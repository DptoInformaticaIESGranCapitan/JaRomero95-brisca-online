var Game = require('./model/Game.js');

var searchGame = function (io) {

    var actual;

    io.on('connection', function (socket) {
        socket.on('search game', function (name) {
            // se crea si no existe
            actual = actual || new Game(io);

            // se une el jugador a una sala propia de la partida
            socket.join(actual.id);

            // se añade el jugador a la partida
            actual.addPlayer(user);

            // se establece el id de la partida en el objeto jugador
            global.onlineUsers[user.name].game = actual.id;

            // se guarda la partida en el registro de partidas
            global.games[actual.id] = actual;

            // se notifica al jugador del id de su partida
            socket.emit('game', global.onlineUsers[user.name].game);

            console.log(actual.id);

            // inicio otra partida para la próxima petición si esta ya ha empezado
            if(actual.start)
                actual = new Game();


        });
    });

};

module.exports = searchGame;