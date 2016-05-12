$(function () {

    socket.on('start data', function (players, properties) {
        console.log(players, properties);
    });

    socket.emit('ready', name); // name es global también, la uso por si aún no ha llegado el usuario desde el servidor

});