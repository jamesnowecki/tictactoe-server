const http = require('http');
const websocketServer = require('websocket').server;

const { guid } = require('./src/generateGuid/generateGuid');

const httpServer = http.createServer();
httpServer.listen(1984, () => console.log('Listening on 1984'));

const wsServer = new websocketServer({
    'httpServer': httpServer
});

const clients = {};
const games = {};

const handleMethod = (message) => {
    const { method, clientId} = message;

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
            console.log('message:', message)
            //JPN - Join an instantiated game by gameId
            const gameInstanceId = message.gameState.gameId;
            const joinGame = games[gameInstanceId];
            //JPN - Max number of players in tictactoe is 2
            if (joinGame.clients.length >= 2) {
                console.log("game full")
                //JPN - need to make a better error handling func here
                return;
            }
            const color = {"0": "Red", "1": "Blue"}[joinGame.clients.length];
            //JPN - Push client into the client array
            joinGame.clients.push({
                clientId: clientId,
                color: color
            });

            const joinPayload = {
                method: 'join',
                gameState: joinGame
            }
            //JPN - Get each client connection and broadcast the gamestate
            joinGame.clients.forEach(client => {
                clients[client.clientId].connection.send(JSON.stringify(joinPayload))
            })

            break;
        case 'play':
            console.log('play requested by player', clientId)
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

