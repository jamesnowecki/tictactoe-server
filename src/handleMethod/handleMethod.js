const handleMethod = (message) => {
    const { method, clientId } = message;

    switch (method) {
        case 'create':
            console.log("create requested by player", clientId)
            break;
        case 'join':
            console.log('join requested by player', clientId)
            break;
        case 'play':
            console.log('play requested by player', clientId)
    }
}

module.exports = handleMethod;