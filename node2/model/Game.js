var dices = require('./Dices.js')();// instancio este objeto, para todas las partidas
var Player = require('./Player.js');//recibo el constructor
var Chrono = require('./Chrono.js');//recibo el constructor
var Deck = require('./Deck.js');//recibo el constructor

var numPlayers = 2;

function Game(io) {
    'use strict';
    this.io = io;
    this.id = new Date().getTime();
    this.users = {};
    this.players = [];
    this.numUsers = 0;
    this.start = false;
    this.ready = false;
    this.turn = 0;
    this.chrono = new Chrono(this);
    this.deck = new Deck();
}

Game.prototype.addUser = function (player) {
    'use strict';
    if (this.numUsers < numPlayers) {
        this.users[player.name] = player;
        ++this.numUsers;
    }
    this.checkUsers();
};

Game.prototype.checkUsers = function () {
    'use strict';
    if (this.numUsers === numPlayers) {
        this.init();
        this.start = true;
    }
};

Game.prototype.init = function () {
    'use strict';
    // creo un player para cada usuario en la partida
    var user, users = this.users;
    for (user in users) {
        if (users.hasOwnProperty(user)) {
            this.players.push(new Player(users[user].name))
        }
    }
    this.sendInitInfo();
};

Game.prototype.sendLateGame = function (name) {
    'use strict';
    this.notifyAll('begin', this.players, this.deck);
    this.notify(name, 'turn', this.players[this.turn].name, this.chrono.rest);
};


Game.prototype.sendInitInfo = function () {
    'use strict';
    this.notifyAll('begin', this.players, this.deck);

    this.moveTurn();
};

Game.prototype.removeUser = function (user) {
    'use strict';
    if (!this.start)
        delete this.users[user.name];
};

Game.prototype.notify = function (name, event, data1, data2, data3, data4) {
    'use strict';
    console.log('envío' + event + ' al usuario ' + name + ' con info ' + data1);
    var user = this.users[name];
    if (user) {
        user.socket.emit(event, data1, data2, data3, data4);
    } else {
        console.log('no hay usuario!!' + name);
    }
};

Game.prototype.notifyAll = function (event, data1, data2, data3, data4) {
    'use strict';
    for (var i = 0; i < this.players.length; i++) {
        var player = this.players[i];
        global.users[player.name].socket.emit(event, data1, data2, data3, data4);
    }
};

Game.prototype.endChrono = function () {
    'use strict';
    console.log('Se ha terminado el crono');
    this.moveTurn();
};

Game.prototype.moveTurn = function () {
    'use strict';
    this.chrono.finish();

    if (this.turn < this.players.length - 1)
        ++this.turn;
    else
        this.turn = 0;

    // lo envío
    var time = 15;
    this.chrono.init(time);
    this.notifyAll('turn', this.players[this.turn].name, time);
};

Game.prototype.getPlayer = function (name) {
    'use strict';
    for (var i = 0; i < this.players.length; i++) {
        var player = this.players[i];
        if (player.name == name)
            return player;
    }
    console.error('El player es null, esto no debería ocurrir');
    return null;
};

Game.prototype.doAction1 = function (name) {
    'use strict';
    var user = this.getPlayer(name);
    if (user) {
        console.log(name + ' ha realizado la acción 1, se pasa el turno al siguiente');
        this.moveTurn();
    }
};

module.exports = Game;