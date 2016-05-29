var Game = require('./model/Game.js');

function removeUserFromGame(user) {
    'use strict';
    var idGame = user.game;
    if (idGame) {
        var game = global.games[idGame];
        if (game) {
            game.removeUser(user);
        }
    }
}

function sendGame(user) {
    'use strict';
    var idGame = user.game;
    if (idGame) {
        var game = global.games[idGame];
        if (game) {
            game.sendLateGame(user.name);
        } else {
            console.log('no se ha podido recoger el juego');
        }
    } else {
        console.log('user.game no existe, no debería aparecer');
    }
}

function sendMsgGame(user, msg) {
    'use strict';
    var idGame = user.game;
    if (idGame) {
        var game = global.games[idGame];
        if (game) {
            console.log('se intenta mandar');
            game.sendMsgGame(user, msg);
        } else {
            console.log('chat - no se ha podido recoger el juego');
        }
    } else {
        console.log('chat - user.game no existe, no debería aparecer');
    }
}


/**
 * Última partida que se está completando
 */
var actual;

var listeners = function (io) {
    'use strict';

    console.log('Nuevo socket conectado');

    io.on('connection', function (socket) {

        /**
         * Gestiona la conexión de un socket nuevo
         */
        socket.on('join', function (name, img) {
            //busco si existe
            var user = global.users[name];

            if (user) {
                // Existe, lo conecto
                user.connect = true;
                user.socket = socket;
                if (user.game) {
                    sendGame(user);
                } else {
                    console.log('El usuario ', user.name, ' existía pero no tiene partida en curso');
                }
            } else {
                // No existe, lo creo
                user = {
                    name: name,
                    img: img,
                    connect: true,
                    socket: socket
                };
            }

            //Hago referencia desde el socket al usuario
            global.sockets[socket.id] = name;
            //Guardo el usuarios
            global.users[name] = user;

            console.log('Se ha conectado: ' + user.name);

            // Lo uno a la sala de chat
            socket.join('chat');

            // Notifico a los usuarios conectados
            socket.broadcast.to('chat').emit('new user', name);
        });

        /**
         * Gestiona la desconexión de un usuario
         */
        socket.on('disconnect', function () {
            var user = global.getUserBySocket(socket);
            if (user) {
                console.log('Se ha desconectado: ' + user.name);
                removeUserFromGame(user);
                user.connect = false;
            } else {
                console.log('Alguien se ha desconectado');
            }
        });

        /**
         * Gestiona la llegada de un nuevo mensaje
         */
        socket.on('msg', function (msg) {
            var user = global.getUserBySocket(socket);
            io.sockets.in('chat').emit('msg', {
                    user: user.name,
                    msg: msg
                }
            );
            console.log('Nuevo mensaje => ' + user.name + ': ' + msg);
        });

        /**
         * Gestiona la llegada de un nuevo mensaje a una partida
         */
        socket.on('msg-game', function (msg) {
            var user = global.getUserBySocket(socket);
            sendMsgGame(user, msg);
        });

        /**
         * Gestiona la creación y búsqueda de partida
         */
        socket.on('search game', function () {
            // se recoge el objeto usuario
            var user = global.getUserBySocket(socket);
            if (user) {
                if (user.game) {
                    return;
                }

                if (actual) {
                    if (actual.start) {
                        console.log('La partida actual ha empezado, se crea una nueva: ' + actual.id);
                        actual = new Game(io);
                    }
                } else {
                    actual = new Game(io);
                    console.log('No hay partida, se crea la partida por primera vez: ' + actual.id);
                }

                // se añade el jugador a la partida
                actual.addUser(user);

                // se establece el id de la partida en el objeto usuario
                user.game = actual.id;

                // se guarda la partida en el registro de partidas
                global.games[actual.id] = actual;

                // se notifica al jugador del id de su partida
                socket.emit('game', user.game);

                console.log('Añadido el jugador ' + user.name + ' a la partida ' + actual.id);
            }
        });

        /**
         * Gestiona la action1 de un usuario
         */
        socket.on('play', function (indexCard) {
            var user = global.getUserBySocket(socket),
                game;
            if (user) {
                if (user.game) {
                    game = global.games[user.game];
                    if (game) {
                        game.play(user.name, indexCard);
                    }
                }
            }
        });

        socket.on('change sample', function (indexCard) {
            var user = global.getUserBySocket(socket),
                game;
            if (user) {
                if (user.game) {
                    game = global.games[user.game];
                    if (game) {
                        game.tryChangeSample(user.name, indexCard);
                    }
                }
            }
        });

    });

};

module.exports = listeners;