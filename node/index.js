var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var init = require('./init')(io);

var searchGame = require('./search-game.js')(io);

global.onlineUsers = [];
global.games = [];



http.listen(3000, function(){
    console.log('listening on *:3000');
});