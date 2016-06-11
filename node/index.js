var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

require('./listeners.js')(io);

global.users = [];
global.sockets = [];
global.games = [];

/**
 * Busca el usuario al que corresponde el socket
 * @param socket socket que corresponde a un usuario
 * @returns {*} devuelve el usuario encontrado o undefined
 */
global.getUserBySocket = function (socket) {
    'use strict';
    var name = global.sockets[socket.id],
        user;

    if (name) {
        user = global.users[name];
        if (user) {
            return user;
        }
    }
    return undefined;
};

http.listen(8000, '192.168.0.163', function(){
    console.log('listening on *:3000');
});