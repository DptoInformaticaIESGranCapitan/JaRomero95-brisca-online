(function (window, undefined, $, socket, name) {
    'use strict';
    var $m = $('#m'),
        $messages = $('#messages');
//                    $action1 = $('#action1');

    $(window).load(function(){
        socket.emit('join', name);
    });

    $('#chat').submit(function () {
        var val = $m.val();
        if (val) {
            socket.emit('msg', val, name);
            $m.val('');
        }
        return false;
    });

    socket.on('msg', function (msg) {
        $messages.append($('<li>').html(
            '<strong>' + msg.user + ':</strong> ' + msg.msg
        ));
        $messages.scrollTop($messages.prop('scrollHeight'));
    });

    socket.on('new user', function (user) {
        $('#messages').append($('<li>').html(
            '<strong>' + user + ' se ha conectado al chat</strong>'
        ));
    });
})(window, undefined, $, socket, name);