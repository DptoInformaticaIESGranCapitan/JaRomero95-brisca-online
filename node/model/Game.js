var dices = require('./Dices.js')();// instancio este objeto, para todas las partidas
var Player = require('./Player.js');//recibo el constructor
var Chrono = require('./Chrono.js');//recibo el constructor
var ArrayProperties = require('./Property.js');//recibo un objeto con todas las propiedades creadas

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
    this.lastRoll = 0;

    //TODO this.states = estados: seleccionando turno, jugando, finalizada

    this.properties = new ArrayProperties();
}

Game.prototype.addUser = function (player) {
    'use strict';
    if (this.numUsers < numPlayers) {
        this.users[player.name] = player;
        ++this.numUsers;
        if (this.numUsers == numPlayers) {
            this.start = true;
            this.startGame();
            this.io.sockets.in(this.id).emit('start');
            //TODO notificar a los usuarios que están en la partida de que se ha unido uno nuevo
        }
    }
};

Game.prototype.isStart = function (name) {
    'use strict';
    if (this.start)
        this.notify(name, 'start');
};

Game.prototype.startGame = function () {
    'use strict';
    // TODO creo players a partir de los users (array indexado, para controlar el orden y el turno), notifico al usuario para que comience a realizar acciones (tirar)
    var user, users = this.users;
    for (user in users) {
        if (users.hasOwnProperty(user))
            this.players.push(new Player(users[user].name))
    }
    // TODO debo recoger que los usuarios confirmen que están listos. Si no están listos, pasado un tiempo prudencial cancelo la partida en vez de empezarla
    // TODO emito a todos los datos de los jugadores
    // TODO emito a todos quien tiene el turno y cuánto dura
};

Game.prototype.notify = function (name, event) {
    'use strict';
    var user = global.onlineUsers[name];
    if(user)
        if (this.users[name])
            user.socket.emit(event);
};

Game.prototype.notifyAll = function (event, data) {
    'use strict';
    for (var i = 0; i < this.players.length; i++) {
        var player = this.players[i];
        global.onlineUsers[player.name].socket.emit(event, data);
    }
};

Game.prototype.handlerPlayerAction = function (player) {
    'use strict';
    var position = player.position;

    switch (position) {
        case 0: // salida
        case 10: // cárcel, visita
        case 20: // parking gratuito
            break;
        case 38:// impuesto 10000
            this.pay(10000);
            break;
        case 4:// impuesto 20000
            this.pay(20000);
            break;
        case 2:
        case 17:
        case 33:
            // sacar carta de la caja de comunidad
            break;
        case 7:
        case 22:
        case 36:
            // sacar carta de suerte
            break;
        case 30:
            // ir a la cárcel
            break;
        default:
            var property = this.properties.position;
            if (property) {
                //TODO compruebo si es de alguien. Si es de alguien, se debe pagar. Si no es de alguien, se puede comprar o subastar
                var owner = property.owner;
                if (owner) {
                    // Compruebo si el usuario que ha caído no es el mismo que el propietario, de ser así debe pagar
                    if (player != owner) {
                        property.pay(player, roll); // El número sacado puede ser necesario
                        // TODO emit evento nuevo sueldo del usuario
                    }
                } else {
                    // si no tiene propietario, le pregunto si la quiere comprar
                    // TODO emit evento compra/subasta
                }
            }
    }
};

Game.prototype.pay = function (player, amount) {
    player.money -= amount;
    // check bankruptcy
    this.notifyAll('pay', player);
};

Game.prototype.receive = function (player, amount) {
    player.money += amount;
    this.notifyAll('receive', player);
};

Game.prototype.roll = function (player) {
    'use strict';
    var result = dices.roll(),
        initial = player.position;
    this.lastRoll = result;// Se guarda por si luego es necesario
    player.move(result);
    if(player.position < initial){
        this.receive(player, 20000); // cobra por pasar por salida
    }
    this.handlerPlayerAction(player);
};

Game.prototype.checkReady = function(){
    'use strict';
    var allReady = 0;
    for (var i = 0; i < this.players.length; i++) {
        var player = this.players[i];
        if(player.ready)
            ++allReady;
    }
    // Tras comprobar si todos están listos, indico quien inicia el turno
    console.log('Listos ' + allReady + ' de ' + numPlayers + ' jugadores totales');
    if(allReady === numPlayers){
        this.ready = true;
        console.log('Todos están listos, envía el primer turno');
        this.sendTurn();
    }
};

Game.prototype.changeTurn = function(){
    'use strict';
    // Establezco el turno
    if(this.turn < this.players.length-1)
        ++this.turn;
    else
        this.turn = 0;
};

Game.prototype.sendTurn = function(){
    // Emito el turno
    'use strict';
    this.notifyAll('turn', this.players[this.turn]);
    console.log('Emito el turno al jugador :' + this.turn + ', nombre: '+this.players[this.turn].name);

    //Inicio un cronómetro, y cuando acabe, vuelvo a emitir el turno
    this.chrono.init(20, this.players[this.turn]);
};

Game.prototype.autoAction = function(player){
    'use strict';
    this.roll(player);
};

Game.prototype.getPlayer = function(name){
    'use strict';
    for (var i = 0; i < this.players.length; i++) {
        var player = this.players[i];
        if(player.name == name)
            return player;
    }
    console.error('El player es null, esto no debería ocurrir');
    return null;
};

module.exports = Game;