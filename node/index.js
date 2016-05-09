var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//app.get('/', function(req, res){
//    //res.sendFile(__dirname + '/index.html');
//});
var onlineUsers = [];
io.on('connection', function(socket){

    console.log('Nuevo usuario conectado');
    
    
    socket.on('chat message', function(msg, User){
        //socket.join('justin bieber fans'); // put socket in a channel
        //socket.broadcast.to('justin bieber fans').emit('new fan'); // broadcast a message to a channel
        //io.sockets.in('rammstein fans').emit('new non-fan'); // to another channel
        //socket.broadcast.to('chat').emit('chat message', msg);
        io.sockets.in('chat').emit('chat message', User.name + ': ' + msg);
        //io.emit('chat message', msg);
        console.log('Debería enviar:' + msg);
    });

    socket.on('new user', function (User) {
        socket.join('chat');
        onlineUsers[User.name] = User;
        console.log('Conectado:' + User.name);
        //onlineUsers[User.nick] = socket.id;
        //io.to(onlineUsers).emit('new user', User.nick);
        //io.to(socketid).emit('message', 'whatever');
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});