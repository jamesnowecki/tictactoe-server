const http = require('http');
const websocketServer = require('websocket').server;

import { guid } from './src/generateGuid'

const httpServer = http.createServer();
httpServer.listen(1984, () => console.log('Listening on 1984'));

const wsServer = new websocketServer({
    'httpServer': httpServer
});

const clients = {};

wsServer.on('request', request => {
    //JPN - capture TCP connection - can put different protocols as first argument, null so open to anything (insecure for production)
    const connection = request.accept(null, request.origin);

    connection.on('open', () => console.log("opened a connection"))
    connection.on('close', () => console.log('close connection'))
    connection.on('message', message => {
        //JPN - Receive a message from a client connection
    })

    //JPN -generate a new clientID and put it in our object list of clients
    const clientId = guid();

    clients[clientId] = {
        connection: connection
    }

    const payload = {
        method: 'connect',
        clientId: clientId
    }

    //JPN - return an initial payload
    connection.send(JSON.stringify(payload))

})



