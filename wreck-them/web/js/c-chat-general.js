$(function () {
    socket.emit('join', name);

    $('form').submit(function () {
        socket.emit('msg', $('#m').val(), name);
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
});