const http = require('http');
const websocketServer = require('websocket').server;

const httpServer = http.createServer();
httpServer.listen(1984, () => console.log('Listening on 1984'));

const wsServer = new websocketServer({
    'httpServer': httpServer
});

wsServer.on('request', request => {
    //JPN - capture TCP connection - can put different protocols as first argument, null so open to anything (insecure for production)
    const connection = request.accept(null, request.origin);

    connection.on('open', () => console.log("opened a connection"))
    connection.on('close', () => console.log('close connection'))
    connection.on('message', message => {
        //JPN - Receive a message from a client connection
    })

})