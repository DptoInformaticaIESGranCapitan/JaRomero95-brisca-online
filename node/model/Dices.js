function Dices() {
}

Dices.prototype.roll = function () {
    return [getRandom(), getRandom()];
};

function getRandom() {
    return 1 + Math.floor(Math.random() * 6);
}

module.exports = Dices;