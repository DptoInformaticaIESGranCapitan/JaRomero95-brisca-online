var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

require('./listeners.js')(io);

global.onlineUsers = [];
global.games = [];

http.listen(3000, function(){
    console.log('listening on *:3000');
});