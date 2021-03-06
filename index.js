const http = require('http');
const websocketServer = require('websocket').server;

const { guid } = require('./src/generateGuid/generateGuid');

const httpServer = http.createServer();
httpServer.listen(1984, () => console.log('Listening on 1984'));

const wsServer = new websocketServer({
    'httpServer': httpServer
});

const clients = {};

wsServer.on('request', request => {
    //JPN - capture TCP connection - can put different protocols as first argument, null so open to anything (insecure for production)
    const connection = request.accept(null, request.origin);

    connection.on('open', () => console.log("opened a connection"));
    connection.on('close', () => console.log('close connection'));
    connection.on('message', message => {
        //JPN - Receive a message from a client connection (comes in as utf8 data)
        //Ensure incoming message is in JSON format
        const res = JSON.parse(message.utf8Data);
        console.log("res: ", res)
    });

    //JPN -generate a new clientID and put it in our object list of clients
    const clientId = guid();

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

