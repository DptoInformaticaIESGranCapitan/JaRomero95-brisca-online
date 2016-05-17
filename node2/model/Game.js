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

    // almacena la muestra
    this.sample = this.deck.cards.pop();
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
            this.players.push(new Player(users[user].name));
        }
    }
    this.sendInitInfo();
};

Game.prototype.sendLateGame = function (name) {
    // fixme enviar la información necesaria en función de sendInitInfo
    'use strict';
};

Game.prototype.distribute = function () {
    'use strict';
    var i, j, player, card;
    for (i = 0; i < this.players.length; ++i) {
        player = this.players[i];
        // a cada jugador, le reparto y ENVÍO 3 cartas
        for (j = 0; j < 3; ++j) {
            card = this.deck.cards.pop();
            player.cards.push(card);

            // extraer método para notificar las cartas
            this.notify(player.name, 'card', card);
            this.notifyAll('oponnent card', player.name);
        }
    }
};

Game.prototype.sendInitInfo = function () {
    'use strict';
    console.log('Comienza la partida: ' + this.id);
    this.notifyAll('begin', this.players);
    //this.setTurn();
    this.distribute();
};
//
Game.prototype.removeUser = function (user) {
    'use strict';
    if (!this.start){
        delete this.users[user.name];
        --this.numUsers;
        console.log('Se ha eliminado a ' + user.name + ' de la partida ' + this.id);
    }
};

/**
 * Envío información al websocket de un usuario
 * @param name nombre del usuario que debe recibir la información
 * @param event nombre del evento que recibirá
 * @param data1 información
 * @param data2 información
 * @param data3 información
 * @param data4 información
 */
Game.prototype.notify = function (name, event, data1, data2, data3, data4) {
    'use strict';
    console.log('[DEBUG GAME NOTIFY] Evento: ' + event + ' | Usuario: ' + name + ' | Info: ', data1, data2, data3, data4);
    var user = this.users[name];
    if (user) {
        user.socket.emit(event, data1, data2, data3, data4);
    } else {
        console.log('[DEBUG GAME NOTIFY] no hay usuario!!' + name);
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
    //TODO turno finalizado
    console.log('Se ha terminado el crono');
    //this.setTurn();
};

// TODO debe enviar el turno al jugador que reciba como parámetro, que será el ganador de la última ronda
Game.prototype.setTurn = function (winner) {
    'use strict';
    var index = this.players.indexOf(winner);
    console.log('indexOf debería valer entre 0 y 1, y vale: ' + index);
    this.turn = this.players[index];
};

Game.prototype.sendTurn = function () {
    'use strict';
    var time = 15;
    this.chrono.init(time);
    // Importante, envío solo el nombre, no el objeto que tiene información sensible
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
        this.setTurn();
    }
};

module.exports = Game;