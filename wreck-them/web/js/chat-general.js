$(function () {
    var socket = io('http://localhost:3000');
    $('form').submit(function () {
        socket.emit('msg', $('#m').val(), User);
        $('#m').val('');
        return false;
    });

    socket.on('msg', function (msg) {
        $('#messages').append($('<li>').html(
            '<strong>' + msg.user + ':</strong> ' + msg.msg
        ));
    });

    socket.on('new user', function (user) {
        $('#messages').append($('<li>').html(
            '<strong>' + user + ' se ha conectado al chat</strong>'
        ));
    });

    socket.emit('join general chat', User);
});