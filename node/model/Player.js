function Player(name) {
    this.name = name;
    this.cards = [];
    this.jail = false;
    this.position = 0;
    this.ready = false;
    this.action = false;
    this.money = 150000; // FIXME money
}

Player.prototype.move = function (num) {
    'use strict';
    this.position += num;
    if (this.position > 39) {
        this.position = (this.position % 39) - 1;
    }
};

module.exports = Player;