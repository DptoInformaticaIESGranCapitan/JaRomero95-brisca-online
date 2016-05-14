function Player(name){
    this.name = name;
    this.cards = [];
    this.jail = false;
    this.position = 0;
    this.ready = false;
}

module.exports = Player;