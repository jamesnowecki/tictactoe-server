const { client } = require("websocket");

const getClientById = (clientsArray, clientId) => {
    const selectedClient = clientsArray.filter(client => {
        return client.clientId === clientId;
    });

    return selectedClient[0];
};

const getNonActiveClient = (clientsArray, activeClientId) => {
    const nonActiveClient = clientsArray.filter(client => {
        return client.clientId !== activeClientId;
    });

    return nonActiveClient[0];
}

module.exports = { getClientById, getNonActiveClient };