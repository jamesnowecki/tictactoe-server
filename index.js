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
    const { method, clientId } = message;

    switch (method) {
        case 'create':
            console.log("create requested by player", clientId);
            //JPN - create a new unique game Id and store in object
            const gameId = guid();
            games[gameId] = gameId;
            console.log(games)

            const payload = {
                method: 'create',
                game: games[gameId],
            };
            //JPN - Get this particular client's connection and return them new payload
            const clientConnection = clients[clientId].connection;
            clientConnection.send(JSON.stringify(payload));
            break;
        case 'join':
            console.log('join requested by player', clientId)
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

