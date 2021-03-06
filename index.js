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

const S4 = () => {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
}
 
// Generate a guid (Stolen from stack overflow)
const guid = () => (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();