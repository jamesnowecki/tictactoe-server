const http = require('http');
const websocketServer = require('websocket').server;
const guid = require('uuid').v4;

// const guid = require('./src/generateGuid/generateGuid');
const startBoardState = require('./src/gameBoard/gameBoard');
const checkVictory = require('./src/checkVictory/checkVictory');
const { getClientById, getNonActiveClient } = require('./src/getClients/getClients');

const httpServer = http.createServer();
httpServer.listen(1984, () => console.info('Listening on 1984'));

const wsServer = new websocketServer({
    'httpServer': httpServer
});

const clients = {};
const games = {};

const handleMethod = (message) => {
    const { method, clientId, clientName} = message;
    console.info(`I've received a ${method} method`);

    switch (method) {
        case 'create':
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
            //JPN - Join an instantiated game by gameId
            const gameInstanceId = message.gameId;
            const joinGame = games[gameInstanceId];
            //JPN - Max number of players in tictactoe is 2
            if (joinGame.clients.length >= 2) {
                //JPN - need to make a better error handling func here
                return;
            };
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
            const playGameInstanceId = message.gameId;
            const playGame = games[playGameInstanceId];

            ///JPN - Who is attempting to make move
            const moveMakingClientId = message.clientId;
            //JPN - The move object they are passing
            const incomingMove = message.move;

            const currentBoardState = playGame.boardState;
            let newBoardState;
            let nextPlayerId;

            //JPN - Check move is being made by the active player (turn based game), in a real time game maybe follow a 'last in wins' paradigm on moves, collate changes and then broadcast the gamestate regularly e.g. multiple times a second?
            if (playGame.activePlayerId === moveMakingClientId) {
                const activeClientColor = getClientById(playGame.clients, moveMakingClientId).color;
                //JPN update the boardstate with the new move
                nextPlayerId = getNonActiveClient(playGame.clients, moveMakingClientId).clientId;

                newBoardState = currentBoardState;
                //JPN - Apply move
                newBoardState[incomingMove.moveSquareId] = {
                    id: incomingMove.moveSquareId,
                    isOccupied: true,
                    color: activeClientColor
                };

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

                //JPN- update server instance gameState
                games[playGameInstanceId] = playPayload.gameState;

                //JPN - Broadcast most recent legal play
                playGame.clients.forEach(client => {
                    clients[client.clientId].connection.send(JSON.stringify(playPayload))
                });
            };

            const evaluateVictoryObj = checkVictory(newBoardState);
            //JPN - Test for victory or draw and if needed end game.
            if (evaluateVictoryObj.victoryAchieved || evaluateVictoryObj.winningColor === 'draw') {
                //JPN - Update server instance gameState
                games[playGameInstanceId].gameResult = evaluateVictoryObj;
                games[playGameInstanceId].gameIsActive = false;

                const endGamePayload = {
                    method: 'gameEnd',
                    gameState: games[playGameInstanceId]
                };

                //JPN - Broadcast end of game result
                playGame.clients.forEach(client => {
                    clients[client.clientId].connection.send(JSON.stringify(endGamePayload));
                });


                //JPN - game is finished so close all connections
                // playGame.clients.forEach(client => {
                //     clients[client.clientId].connection.close();
                // });
            } 

            break;
        case 'reset':

            const resetGameInstanceId = message.gameId;
            const resetGame = games[resetGameInstanceId];

            //JPN - Only allow a reset if the game is truly over, to prevent reset of a game in progress. Not sure how I feel about this from a user perspective. In a game like this it's ok, but in longer games people would probably want to be able to reset if the board state became untenable for them (e.g. resign and play again).
            if (!resetGame.gameIsActive) {
                 //JPN - Remove the victory object from instance
                delete resetGame.gameResult;
                //JPN - Provide a payload resetting the boardstate, but maintaining the current players and colors
                const resetGamePayload = {
                    method: 'reset',
                    gameState: {
                        ...resetGame,
                        gameIsActive: true,
                        boardState: startBoardState
                    }
                };
    
                //JPN - Update the server instance of the gamestate
                games[resetGameInstanceId] = resetGamePayload.gameState;
    
                //JPN - Broadcast new gameState
                resetGame.clients.forEach(client => {
                    clients[client.clientId].connection.send(JSON.stringify(resetGamePayload));
                });
    
            }


            break;
    };
};

wsServer.on('request', request => {
    //JPN - capture TCP connection - can put different protocols as first argument, null so open to anything (insecure for production)
    const connection = request.accept(null, request.origin);

    connection.on('open', () => console.info("opened a connection"));
    connection.on('close', () => console.info('close connection'));
    connection.on('message', message => {
        //JPN - Receive a message from a client connection (comes in as utf8 data)
        //Ensure incoming message is in JSON format
        const req = JSON.parse(message.utf8Data);
        handleMethod(req);
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