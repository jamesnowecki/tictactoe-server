const http = require('http');
const websocketServer = require('websocket').server;

const guid = require('./src/generateGuid/generateGuid');
const startBoardState = require('./src/gameBoard/gameBoard');
const checkVictory = require('./src/checkVictory/checkVictory');
const { getClientById, getNonActiveClient } = require('./src/getClients/getClients');

const httpServer = http.createServer();
httpServer.listen(1984, () => console.log('Listening on 1984'));

const wsServer = new websocketServer({
    'httpServer': httpServer
});

const clients = {};
const games = {};

const handleMethod = (message) => {
    const { method, clientId, clientName} = message;
    console.log(`I've received a ${method} method`)

    switch (method) {
        case 'create':
            console.log("create requested by player", clientId);
            //JPN - create a new unique game Id and store in object
            const gameId = guid();
            games[gameId] = {
                gameId: gameId,
                clients: []
            };

            const createPayload = {
                method: 'create',
                gameState: games[gameId],
            };
            //JPN - Get this particular client's connection and return them new payload
            const clientConnection = clients[clientId].connection;
            clientConnection.send(JSON.stringify(createPayload));
            break;
        case 'join':
            console.log('join requested by player', clientId)
            //JPN - Join an instantiated game by gameId
            const gameInstanceId = message.gameId;
            const joinGame = games[gameInstanceId];
            //JPN - Max number of players in tictactoe is 2
            if (joinGame.clients.length >= 2) {
                console.log("game full")
                //JPN - need to make a better error handling func here
                return;
            }
            //JPN - assign color to joining player connection
            const color = {"0": "red", "1": "blue"}[joinGame.clients.length];
            //JPN - Push client into the client array
            joinGame.clients.push({
                clientId: clientId,
                clientName: clientName,
                color: color
            });

            const numberOfPlayers = joinGame.clients.length;

            const joinPayload = {
                method: 'join',
                gameState: {
                    ...joinGame,
                    gameIsActive: numberOfPlayers === 2,
                    activePlayerId: joinGame.clients[0].clientId,
                    boardState: startBoardState
                }
            };

            //JPN - Update the server instance of the boardState
            games[gameInstanceId] = joinPayload.gameState;

            //JPN - Get each client connection and broadcast the gamestate
            joinGame.clients.forEach(client => {
                clients[client.clientId].connection.send(JSON.stringify(joinPayload))
            });

            break;
        case 'play':
            console.log('play requested by player', clientId);
            console.log("message:", message);
            const playGameInstanceId = message.gameId;
            const playGame = games[playGameInstanceId];

            ///JPN - Who is attempting to make move
            const moveMakingClientId = message.clientId;
            //JPN - The move object they are passing
            const incomingMove = message.move;

            const currentBoardState = playGame.boardState;
            console.log("curBoard", currentBoardState)
            let newBoardState;
            let nextPlayerId;

            //JPN - Check move is being made by the active player (turn based game), in a real time game maybe follow a 'last in wins' paradigm on moves, collate changes and then broadcast the gamestate regularly e.g. multiple times a second?
            if (playGame.activePlayerId === moveMakingClientId) {
                const activeClientColor = getClientById(playGame.clients, moveMakingClientId).color;
                //JPN update the boardstate with the new move
                nextPlayerId = getNonActiveClient(playGame.clients, moveMakingClientId).clientId;

                newBoardState = currentBoardState;
                //JPN - Apply move
                console.log('moveId', incomingMove.moveSquareId)
                console.log('newBoard before apply', newBoardState)
                console.log('try board sq', newBoardState[incomingMove.moveSquareId])
                newBoardState[incomingMove.moveSquareId] = {
                    id: incomingMove.moveSquareId,
                    isOccupied: true,
                    color: activeClientColor
                };
                console.log("new board after apply", newBoardState)
                //JPN - load next payload
                const playPayload = {
                    method: 'update',
                    gameState: {
                        ...playGame,
                        gameIsActive: true,
                        activePlayerId: nextPlayerId,
                        boardState: newBoardState,
                    }
                };

                console.log("outGoingPayload", playPayload)
                console.log("outGoingBoard", playPayload.gameState.boardState)

                //JPN- update server instance gameState
                games[playGameInstanceId] = playPayload.gameState;

                //JPN - Broadcast most recent legal play
                playGame.clients.forEach(client => {
                    clients[client.clientId].connection.send(JSON.stringify(playPayload))
                });
            }

            const evaluateVictoryObj = checkVictory(newBoardState);
            //JPN - Test for victory or draw and if needed end game.
            if (evaluateVictoryObj.victoryAchieved || evaluateVictoryObj.winningColor === 'draw') {
                console.log("running endgame block")
                const endGamePayload = {
                    method: 'gameEnd',
                    gameResult: evaluateVictoryObj
                };

                //JPN - Update server instance gameState
                games[playGameInstanceId].gameState = {
                     ...games[playGame].gamestate,
                     gameResult: evaluateVictoryObj
                };

                //JPN - Broadcast end of game result
                playGame.clients.array.forEach(client => {
                    clients[client.clientId].connection.send(JSON.stringify(endGamePayload))
                });
            } 

            break;
    }
}

wsServer.on('request', request => {
    //JPN - capture TCP connection - can put different protocols as first argument, null so open to anything (insecure for production)
    const connection = request.accept(null, request.origin);

    connection.on('open', () => console.log("opened a connection"));
    connection.on('close', () => console.log('close connection'));
    connection.on('message', message => {
        //JPN - Receive a message from a client connection (comes in as utf8 data)
        //Ensure incoming message is in JSON format
        const req = JSON.parse(message.utf8Data);
        console.log('Ive got a message')
        handleMethod(req)
    });

    //JPN -generate a new clientID and put it in our object list of clients
    const clientId = guid();
    //JPN - store connection instantiation for this client
    clients[clientId] = {
        connection: connection
    };

    const payload = {
        method: 'connect',
        clientId: clientId
    };

    //JPN - return an initial payload
    connection.send(JSON.stringify(payload));

});

