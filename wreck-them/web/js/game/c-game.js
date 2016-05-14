$(function () {
    'use strict';
    var players, properties;

    socket.on('start data', function (aPlayers, aProperties) {
        // La propiedad ready se envía como parte del objeto player pero no se actualiza a true una vez se recibe, en el lado del cliente no importa esto
        players = aPlayers;
        properties = aProperties;
        console.log('Recibo los datos de inicio');
    });

    socket.on('aTurn', function (player) {
        alert('recibo un turno');
        if (player.name === name)
            console.log('El turno es mío');
        else
            console.log('El turno es de: ' + player.name);
    });

    socket.on('algo', function () {
        alert('algo');
    });

    socket.on('user', function () {
        socket.emit('ready', User.game, User.name);
    });

});