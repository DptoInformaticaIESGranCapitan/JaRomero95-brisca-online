var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var chat = require('./chat');
chat(io);

http.listen(3000, function(){
    console.log('listening on *:3000');
});