const winStates = require('../gameBoard/winStates')

const testForAllSameColor = (testArray) => {
    const allEqual = testArray.every(value => value === testArray[0])

    return allEqual ? { victoryAchieved: true, winningColor: testArray[0]}
    : { victoryAchieved: false, winningColor: 'no victor' };
};

const checkForDraw = (boardState) => {
    let allOccupied = true;
    //JPN - loop through to see if all squares are occupied
    for (const [value] of Object.entries(boardState)) {
        if (!value.isOccupied) {
            allOccupied = false;
        };
    };

    return allOccupied; 
};

const checkVictory = (boardState) => {
    let victoryAchieved = false;
    let winningColor = 'no victor';
    //JPN - Loop through array of possible winning combos
    for (let i= 0; i < winStates.length -1; i++) {
        const testArray = [];
        //JPN - Push the colors of the potential victory connection into an array
        winStates[i].forEach(square => {
            testArray.push(boardState[square].color)
        });

        const testResult = testForAllSameColor(testArray);
        victoryAchieved = testResult.victoryAchieved;
        winningColor = testResult.winningColor;
        
        if (victoryAchieved) {
            //JPN - break loop as soon as a win is identified or leave as no victory
            break;
        };
    };

    const result = {
        victoryAchieved: victoryAchieved,
        winningColor: winningColor
    };

    if (result.victoryAchieved = false) {
        const isDraw = checkForDraw(boardState);

        if (isDraw) {
            result.winningColor = 'draw'
        };
    };

    return result;
};

module.exports = checkVictory;