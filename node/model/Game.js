var dices = require('./Dices.js')();// instancio este objeto, para todas las partidas
var Player = require('./Player.js');//recibo el constructor
var ArrayProperties = require('./Property.js');//recibo un objeto con todas las propiedades creadas

function Game(io) {
    this.io = io;
    this.id = new Date().getTime();
    this.users = {};
    this.players = [];
    this.numUsers = 0;
    this.start = false;

    //TODO this.states = estados: seleccionando turno, jugando, finalizada

    this.properties = new ArrayProperties();

    this.handlerEvents(); // Inicio una vez el manejador de eventos
}

Game.prototype.addUser = function (player) {
    if (this.numUsers < 4) {
        this.users[player.name] = player;
        ++this.numUsers;
        if (this.numUsers == 4) {
            this.start = true;
            this.startGame();
            this.io.sockets.in(this.id).emit('start');
            //TODO notificar a los usuarios que están en la partida de que se ha unido uno nuevo
        }
    }
};

Game.prototype.isStart = function (name) {
    if (this.start)
        this.notify(name, 'start');
};

Game.prototype.startGame = function () {
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
    var user = global.onlineUsers[name];
    if(user)
        if (this.users[name])
            user.socket.emit(event);
};

Game.prototype.handlerPlayerAction = function () {
    //TODO las variables usadas no existen
    var user; // actual user
    var position = playerActual.position;

    switch (position) {
        case 0:
        case 10:
        case 20:
            //TODO (salida, carcel visita, parking gratuito) no hago nada, la 0, el cobrar, lo gestiono al pasar, no al caer en ella
            break;
        case 38://10000
        case 4://20000
            // se debe pagar un impuesto, aunque es diferente según la casilla
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
                    if (user != owner) {
                        property.pay(user, roll);
                        // TODO emit evento nuevo sueldo del usuario
                    }
                } else {
                    // si no tiene propietario, le pregunto si la quiere comprar
                    // TODO emit evento compra/subasta
                }
            }
    }
};

Game.prototype.roll = function (name) {
    // TODO se invoca cuando el jugador da la orden de tirar. Hago una tirada. Muevo al jugador a la casilla correspondiente e invoco a un manejador que seleccione que debe hacer el usuario (le pregunto si desea comprar, o subastar, o le cobro, o le envío a la cárcel...)

    // Tras la tirada, compruebo si previa a la tirada estaba en un número mayor que después de la tirada, por ejemplo paso de 35 a 7. Esto significa que se ha pasado por salida y se debe cobrar el pago.
};

// Eventos que recibe la partida
Game.prototype.handlerEvents = function (){

    var that = this;

    this.io.on('connection', function (socket) {

        socket.on('roll', function (name, idGame) {
            var game = global.games[idGame];
            // TODO cuando empiece la partida
        });

        socket.on('ready', function () {
            socket.emit('start data', that.players, that.properties);
        });

        //TODO socket.on comprar/
        // TODO socket.on subastar
    });
};

module.exports = Game;