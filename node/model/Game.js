function Game(io){
    this.io = io;
    this.id = new Date().getTime();
    this.players = [];
    this.start = false;
}

Game.prototype.addPlayer = function(player){
    if(this.players.length < 4){
        this.players[player.name] = player;
        if(this.players.length == 4){
            this.start = true;
            this.io.sockets.in(this.id).emit('start');
        }
    }
};

Game.prototype.notify = function(user){
    if(this.players[user])
        if(this.start)
            user.socket.emit('start');
};

module.exports = Game;