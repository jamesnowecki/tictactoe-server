const { client } = require("websocket");

const getClientById = (clientsArray, clientId) => {
    console.log("getClientCalled")
    console.log("clientArray", clientsArray)
    console.log("clientId", clientId)
    const selectedClient = clientsArray.filter(client => {
        return client.clientId === clientId;
    });

    console.log("ret cli", selectedClient)

    return selectedClient[0];
};

const getNonActiveClient = (clientsArray, activeClientId) => {
    const nonActiveClient = clientsArray.filter(client => {
        return client.clientId !== activeClientId;
    });

    return nonActiveClient[0];
}

module.exports = { getClientById, getNonActiveClient };