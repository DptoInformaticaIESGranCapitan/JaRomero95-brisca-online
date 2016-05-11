var chat = function (io) {
    var onlineUsers = [];
    io.on('connection', function (socket) {

        console.log('Nuevo usuario conectado');

        /**
         * Envía el mensaje recibido a todos los que se encuentran en el chat general
         */
        socket.on('msg', function (msg, User) {
            io.sockets.in('general chat').emit('msg', {
                    user: User.name,
                    msg: msg
                }
            );
            console.log(User.name + ': ' + msg);
        });

        /**
         * Añade al nuevo usuario conectado al chat general, y notifica al resto de usuarios de ello
         */
        socket.on('join general chat', function (User) {
            socket.join('general chat');
            onlineUsers[User.name] = User;

            //mensaje a todos en la sala, salvo quien lo envía
            socket.broadcast.to('general chat').emit('new user', User.name);

            // mensaje a todos, incluido quien lo envía
            //io.sockets.in('general chat').emit('new user', User.name);

            console.log('Conectado al chat general: ' + User.name);
        });
    });
};

module.exports = chat;