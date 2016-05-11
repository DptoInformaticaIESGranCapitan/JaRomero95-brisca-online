$(function () {
    $('#search-game').click(function () {
        if(!User.game)
            socket.emit('search game', User.name);
    });

    socket.on('game', function (game) {
        User.game = game;
        console.log(game);
    });

    socket.on('start', function () {
        console.log('Comienza la partida');
        window.location = '/jugar';
    });
});