var init = function (io) {
    io.on('connection', function (socket) {

        console.log('Nuevo usuario conectado');

        /**
         * Envía el mensaje recibido a todos los que se encuentran en el chat general
         */
        socket.on('msg', function (msg, user) {
            io.sockets.in('general chat').emit('msg', {
                    user: user,
                    msg: msg
                }
            );
            console.log(user + ': ' + msg);
        });

        /**
         * Añade al nuevo usuario conectado al chat y a la lista
         */
        socket.on('join', function (name) {
            socket.join('general chat');

            //mensaje a todos en la sala de chat, salvo quien lo envía
            socket.broadcast.to('general chat').emit('new user', name);

            // mensaje a todos, incluido quien lo envía
            //io.sockets.in('general chat').emit('new user', User.name);

            // compruebo si existe ya como usuario conectado
            var user = global.onlineUsers[name];
            if(!user){
                // si no existe, lo creo
                user = {
                    name: name
                };
            }else{
                // si existe, elimino su socket antiguo
                user.socket = '';
            }

            // finalmente le envío su objeto usuario
            socket.emit('user', user);

            // y lo añado junto con su socket a los usuarios online
            user.socket = socket;
            global.onlineUsers[name] = user;

            // le notifico al jugador si tiene una partida en curso
            var idGame = user.game;
            if(idGame){
                global.games[idGame].isStart(user);
            }

            console.log('Conectado: ' + name);
        });

    });
};

module.exports = init;