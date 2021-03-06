(function (window, undefined, $, socket) {
    'use strict';
    var $m = $('#m'),
        $m2 = $('#m2'),
        $mGame = $('#m-game'),
        $mGame2 = $('#m-game2'),
        $msgs = $('.msgs'),
        $msgsGame = $('.msgs-game'),
        $modal = $('#modal1'),
        $tabChatGame = $('#tab-chat-game'),
        $tabChatGame2 = $('#tab-chat-game2'),
        $trigger = $('#trigger'),
        maxChatMsg = 50;
//                    $action1 = $('#action1');

    $tabChatGame.addClass('disabled');
    $tabChatGame2.addClass('disabled');

    function restrictMaxMsg($ul){
        //$('.messages.msgs').eq(1).children().eq(0).remove()
        if ($ul.children().size() > maxChatMsg) {
            $ul.children().eq(0).remove();
        }
    }

    function getChatMsg(username, msg) {
        var float = (username === name) ? 'right' : 'left';
        return '<div class="chat-msg green lighten-5 ' + float + '">' +
            '<span class="msg-name green-text text-darken-4"><strong>' + username + '</strong></span><br/>' +
            '<span class="msg-msg">' + msg + '</span>' +
            '</div>' +
            '<div style="clear: both"></div>';
    }

    $(window).load(function () {
        socket.emit('join', name, img);
    });

    // Chat general a la derecha
    $('#chat').submit(function () {
        var val = $m.val();
        if (val) {
            socket.emit('msg', val);
            $m.val('');
        }
        return false;
    });

    // Chat general dialogo
    $('#chat2').submit(function () {
        var val = $m2.val();
        if (val) {
            socket.emit('msg', val);
            $m2.val('');
        }
        return false;
    });

    // Chat partida a la derecha
    $('#chat-game').submit(function () {
        var val = $mGame.val();
        if (val) {
            socket.emit('msg-game', val);
            $mGame.val('');
        }
        return false;
    });

    // Chat partida dialogo
    $('#chat-game2').submit(function () {
        var val = $mGame2.val();
        if (val) {
            socket.emit('msg-game', val);
            $mGame2.val('');
        }
        return false;
    });

    // Recibir mensaje chat general tanto derecha como dialogo
    socket.on('msg', function (msg) {
        $msgs.append($('<li>').html(
            getChatMsg(msg.user, msg.msg)
        ));
        restrictMaxMsg($msgs.eq(0));

        // se hace scroll
        $msgs.scrollTop($msgs.prop('scrollHeight'));

        // se hace scroll para el otro chat si lo hay
        if ($msgs.size() > 1) {
            $msgs.eq(1).scrollTop($msgs.eq(1).prop('scrollHeight'));
            restrictMaxMsg($msgs.eq(1));
        }
    });

    // Recibir mensaje chat partida tanto derecha como dialogo
    socket.on('msg-game', function (username, msg) {
        console.log('se ha emitido este evento');
        $msgsGame.append($('<li>').html(
            getChatMsg(username, msg)
        ));

        restrictMaxMsg($msgsGame.eq(0));

        // se hace scroll
        $msgsGame.scrollTop($msgsGame.prop('scrollHeight'));

        // se hace scroll para el otro chat si lo hay
        if ($msgsGame.size() > 1) {
            $msgsGame.eq(1).scrollTop($msgsGame.eq(1).prop('scrollHeight'));
            restrictMaxMsg($msgsGame.eq(1));
        }

        // blink en el botón de chat
        if (!$modal.hasClass('open')) {
            $trigger.addClass('blink');
        }
    });

    // limpiar blink al abrir el chat dialogo
    $trigger.click(function () {
        $trigger.removeClass('blink');
    });

    socket.on('new user', function (user) {
        $msgs.append($('<li>').html(
            '<div class="chat-msg green lighten-5 left">' +
            '   <span class="msg-name green-text text-darken-4">' +
            '       <strong>' +
            '           ' + user + ' se ha conectado al chat' +
            '       </strong>' +
            '   </span>' +
            '</div>' +
            '<div style="clear: both"></div>'
        ));
    });
})(window, undefined, $, socket);