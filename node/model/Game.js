var Dices = require('model/Dices.js');

function Game(io) {
    this.io = io;
    this.id = new Date().getTime();
    this.users = {};
    this.numUsers = 0;
    this.start = false;
    this.dices = new Dices();
    this.properties = new ArrayProperty();
}

Game.prototype.addUser = function (player) {
    if (this.numUsers < 4) {
        this.users[player.name] = player;
        ++this.numUsers;
        if (this.numUsers == 4) {
            this.start = true;
            this.io.sockets.in(this.id).emit('start');
            //TODO notificar a los usuarios que están en la partida de que se ha unido uno nuevo
        }
    }
};

Game.prototype.isStart = function (user) {
    if (this.start)
        this.notify(user, 'start');
};

Game.prototype.notify = function (user, event) {
    if (this.users[user.name])
        user.socket.emit(event);
};

Game.prototype.roll = function (user){

};

// Eventos que recibe la partida
io.on('connection', function (socket) {

    socket.on('roll', function (name, idGame) {
        var game = global.games[idGame];
        // TODO cuando empiece la partida
    });

});

module.exports = Game;