var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var init = require('./init')(io);

require('./search-game.js')(io);

global.onlineUsers = [];
global.games = [];
global.io = io;

//console.log(io);
//console.log(global.io);



http.listen(3000, function(){
    console.log('listening on *:3000');
});