(function (window, undefined, $, socket, name) {
    'use strict';
    var $search = $('#search-game'),
        $myCards = $("#my-cards"),
        $sample = $('#sample');

    function turnOverCard($elem, card){
        var str  = card.num.name + ' de ' + card.suit
        $elem.html(str);
    }

    $search.click(function () {
        socket.emit('search game');
        $search.prop('disabled', true);
    });

    socket.on('game', function (idGame) {
        console.log('Te has unido a la sala: ' + idGame);
    });

    socket.on('begin', function (data1, data2) {
        $search.prop('disabled', true);
        console.log('¡Comienza la partida!', data1, data2);
//                if(window.location.pathname != '/jugar')
//                    window.location = '/jugar';
    });

    socket.on('turn', function (player, time) {
        if (player === name) {
            console.log('El turno es mío');
            $action1.prop('disabled', false);
        }
        else {
            console.log('El turno es de: ' + player);
            $action1.prop('disabled', true);
        }

        console.log('Tiempo: ' + time);
    });

    /**
     * Recoge la carta enviada del servidor y la añade al contenedor html del jugador y además le asocia su información mediante jQuery data('index')
     */
    socket.on('card', function (card) {
        var $htmlCard = $('<div class="card"></div>');
        $htmlCard.data('id', card.id);
        $myCards.append($htmlCard);
        turnOverCard($htmlCard, card);
        console.log('He recibido la carta: ', card.suit, ' ', card.num.name);
    });

    /**
     * Envía al servidor la carta sobre la que se ha clickado
     */
    $myCards.click(".cards", function (ev) {
        var elem    = $(ev.target),
            id   = elem.data('id');
        socket.emit('play', id);
    });

    /**
     * Recibe la muestra de la partida
     */
    socket.on('sample', function (card) {
        turnOverCard($sample, card);
        console.log('La muestra es: ', card);
    });

    socket.on('oponnent card', function (player) {
        if (player === name)
            return;
        console.log('El jugador ' + player + ' ha recibido una carta');
    });

    function newGame(player, oponnent) {

    }
})(window, undefined, $, socket, name);