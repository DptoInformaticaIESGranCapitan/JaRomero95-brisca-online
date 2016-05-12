$(function () {
    var $m = $('#m');

    socket.emit('join', name);

    $('form').submit(function () {
        var val = $m.val();
        if(val){
            socket.emit('msg', val, name);
            $m.val('');
        }
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