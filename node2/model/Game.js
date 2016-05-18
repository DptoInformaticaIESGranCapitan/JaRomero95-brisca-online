var dices = require('./Dices.js')();// instancio este objeto, para todas las partidas
var Player = require('./Player.js');//recibo el constructor
var Chrono = require('./Chrono.js');//recibo el constructor
var Deck = require('./Deck.js');//recibo el constructor

var numPlayers = 2;

function Game(io) {
    'use strict';

    /**
     * Referencia para poder enviar información desde la clase
     */
    this.io = io;

    /**
     * Id de la partida
     * @type {number}
     */
    this.id = new Date().getTime();

    /**
     * Usuarios de la partida, se usa durante el periodo de espera
     * @type {{}}
     */
    this.users = {};

    /**
     * Jugadores de la partida, una vez esta ha empezado
     * @type {Array}
     */
    this.players = [];

    /**
     * Facilita la cuenta de propiedades del objeto this.users
     * @type {number}
     */
    this.numUsers = 0;

    /**
     * FIXME: esto debería suprimirse y usarse this.state
     * Define si la partida ya está empezada
     * @type {boolean}
     */
    this.start = false;

    /**
     * Cronómetro de la partida
     * @type {Chrono|exports|module.exports}
     */
    this.chrono = new Chrono(this);

    /**
     * Baraja de la partida
     * @type {Deck|exports|module.exports}
     */
    this.deck = new Deck();

    /**
     * Estado actual de la partida. Se inicia en espera
     * @type {string}
     */
    this.state = this.states.wait;

    /**
     * Índice del jugador al que le toca jugar
     * @type {number}
     */
    this.turn = 0;

    /**
     * Índice del jugador que ha iniciado la mano
     * @type {number}
     */
    this.firstTurn = 0;


    /**
     * Muestra. Se inicia una vez ha comenzado la partida
     * @type {undefined}
     */
    this.sample = undefined;
}

/**
 * Añade un usuario a la partida
 * @param user Usuario que desea añadirse
 */
Game.prototype.addUser = function (user) {
    'use strict';
    if (this.numUsers < numPlayers) {
        this.users[user.name] = user;
        ++this.numUsers;
    }
    this.checkUsers();
};

/**
 * Comprueba si están todos los usuarios para poder empezar la partida
 */
Game.prototype.checkUsers = function () {
    'use strict';
    if (this.numUsers === numPlayers) {
        this.init();
        this.start = true;

        this.state = this.states.sendInit;
    }
};

/**
 * Crea la partida cuando están todos los jugadores
 */
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

// TODO enviar la información al usuario que se reconecta
Game.prototype.sendLateGame = function () {
    'use strict';
};

/**
 * Envía la información inicial de la partida a los jugadores que la componen
 */
Game.prototype.sendInitInfo = function () {
    'use strict';
    console.log('Comienza la partida: ' + this.id);
    this.notifyAll('begin', this.players);
    //this.setTurn();
    this.distribute();
};

/**
 * Al comenzar la partida, envía las tres primeras cartas a cada jugador y la brisca
 */
Game.prototype.distribute = function () {
    'use strict';
    var i, j, player, card;

    // La muestra es la última carta, pero no se saca de la baraja porque al final de la partida también se repartirá esta carta
    this.sample = this.deck.cards[this.deck.cards.length - 1];
    this.notifyAll('sample', this.sample);

    for (i = 0; i < this.players.length; ++i) {
        player = this.players[i];
        // a cada jugador, le reparto y ENVÍO 3 cartas
        for (j = 0; j < 3; ++j) {
            card = this.deck.cards.pop();
            player.cards.push(card);

            // Nombre, carta
            this.notify(player.name, 'card', card);
            this.notifyAll('oponnent card', player.name);
        }
    }

    // Esperamos tres segundos. Luego el manejador se encargará de enviar el primer turno
    this.chrono.init(3);
};

/**
 * Elimina un usuario de la partida si se desconecta del socket. Esto solo sucede si el usuario está en la partida y esta se encuentra en espera mientras se unen los demás.
 * @param user usuario que se debe eliminar
 */
Game.prototype.removeUser = function (user) {
    'use strict';
    if (!this.start) {
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
    //console.log('[DEBUG GAME NOTIFY] Evento: ' + event + ' | Usuario: ' + name + ' | Info: ', data1, data2, data3, data4);
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

/**
 * ENUM. Almacena los estados en los que se puede encontrar la partida
 * @type {{wait: string, sendInit: string, playHand: string, checkHand: string, checkGame: string, finish: string}}
 */
Game.prototype.states = {
    wait: 'wait',
    sendInit: 'sendInit',
    playHand: 'playHand',
    checkHand: 'checkHand',
    checkGame: 'checkGame',
    finish: 'finish'
};

/**
 * Gestiona las acciones que debe realizar la partida en función del estado en el que se encuentra
 */
Game.prototype.handlerState = function () {
    'use strict';
    switch (this.state){
        case this.states.wait:
            // En este no se debería encontrar nunca, aquí no hay ninguna espera
            break;
        case this.states.sendInit:
            // envío el primer turno
            this.sendTurn();

            // establezco el estado a: jugando la mano
            this.state = this.states.playHand;
            break;
        case this.states.playHand:
            //primero, compruebo si el usuario del turno actual, ha jugado la mano que le corresponde

            // recojo el player
            var player = this.players[this.turn];

            // compruebo si ha tirado
            if(player.cardPlayed){

            }else{
                // no ha tirado
            }
            break;
    }

};

// TODO debe enviar el turno al jugador que reciba como parámetro, que será el ganador de la última ronda
Game.prototype.setTurn = function (winner) {
    'use strict';
    var index = this.players.indexOf(winner);
    console.log('indexOf debería valer entre 0 y 1, y vale: ' + index);
    this.turn = this.players[index];
};

/**
 * Envía el turno al jugador que le corresponde, además de iniciar el cronómetro y notificar a todos los jugadores de a quién le corresponde jugar
 */
Game.prototype.sendTurn = function () {
    'use strict';
    var time = 15;
    this.chrono.init(time);
    // Importante, envío solo el nombre, no el objeto, que tiene información sensible
    this.notifyAll('turn', this.players[this.turn].name, time);
};

/**
 * Recoge a un jugador de la partida por su nombre
 * @param name nombre del jugador buscado
 * @returns {Player|undefined}
 */
Game.prototype.getPlayer = function (name) {
    'use strict';
    for (var i = 0; i < this.players.length; i++) {
        var player = this.players[i];
        if (player.name == name)
            return player;
    }
    console.error('El player es null, esto no debería ocurrir');
    return undefined;
};

/**
 * Juega una carta si la partida está en el estado correspondiente y el turno es del jugador que desea jugarla
 * @param userName nombre del jugador que realiza la acción
 * @param id índice de la carta que quiere jugar
 */
Game.prototype.play = function (userName, id) {
    'use strict';
    var player = this.getPlayer(userName),
        card,
        success;
    if (player) {
        if (player === this.players[this.turn]){
            if (this.state === this.states.playHand) {
                card = player.playCard(id);
                if ( success ) {
                    // Notifico a todos la carta que ha jugado el usuario
                    this.notifyAll('played', userName, card);

                    //finalizo el cronómetro
                    this.chrono.finish();
                }
            } else {
                console.log('El jugador ha intentado jugar una carta, pero la partida no está en playHand');
            }
        }else{
            console.log('El jugador ha intentado jugar una carta, pero no es su turno');
        }
    }
};

module.exports = Game;