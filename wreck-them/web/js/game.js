(function (window, undefined, $, socket, name) {
    'use strict';
    var $search = $('#search-game'),
        $myCards = $("#my-cards"),
        $sample = $('#sample'),
        $myPlay = $('#my-play'),
        $oponnentPlay = $('#oponnent-play');

    /**
     * Muestra una carta que estaba bocabajo
     * @param $elem elemento del DOM que contiene la carta
     * @param card información de la carta para establecerla en el elemento
     */
    function turnOverCard($elem, card){
        var str  = card.num.name + ' de ' + card.suit
        $elem.html(str);
    }

    /**
     * Recoje el elemento del DOM que corresponde a la carta que tiene el id enviado a buscar
     * @param id identificador de la carta
     * @returns {$element|undefined}
     */
    function getElementCard(id) {
        'use strict';
        var i, $elem, idCard, values,
            $cards = $('#my-cards .card');

        // recorro los divs, es decir, las cartas del propio jugador
        for (i = 0; i < $cards.length; i++) {
            $elem = $cards[i];

            // recojo la información de la carta asociada al div
            values = $elem.data('card');

            //guardo el id
            idCard = values.id;

            // Si concuerda el id de la caja con el id que debo recoger, devuelvo esa caja contenedora
            if (id === idCard) {
                return $elem;
            }
        }

        console.log('[UNRECHEABLE], getElementCard, no se ha encontrado la carta');
        return undefined;
    }

    /** Buscar una partida */
    $search.click(function () {
        socket.emit('search game');
        $search.prop('disabled', true);
    });

    /** Notifica que se ha unido a una partida */
    socket.on('game', function (idGame) {
        console.log('Te has unido a la sala: ' + idGame);
    });

    /** Notifica que ha empezado la partida */
    socket.on('begin', function (data1, data2) {
        $search.prop('disabled', true);
        console.log('¡Comienza la partida!', data1, data2);
//                if(window.location.pathname != '/jugar')
//                    window.location = '/jugar';
    });

    /** Notifica que se ha emitido un turno de jugador */
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
     * Recoge la carta enviada del servidor y la añade al contenedor html del jugador y además le asocia su información mediante jQuery data('card')
     */
    socket.on('card', function (card) {
        // creo el elemento html
        var $htmlCard = $('<div class="card"></div>');

        // le añado como información la carta enviada
        $htmlCard.data('card', card);

        // añado la carta a la caja contenedora de la GUI
        $myCards.append($htmlCard);

        // Pongo la carta bocarriba
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

    /**
     * Notifica que un oponente ha recibido una carta
     */
    socket.on('oponnent card', function (player) {
        if (player === name)
            return;
        console.log('El jugador ' + player + ' ha recibido una carta');
    });

    function onPlayCard(card){
        // recojo el elemento que contiene esa carta
        var $elem = getElementCard(card.id);

        // lo elimino de las cartas del usuario
        $elem.remove();

        // lo añado a carta jugada
        $myPlay.append($elem);
    }

    function onOponnentPlayCard(card){
        // recojo cualquier carta bocaabajo de su contenedor
        var $elem = $('#oponnent-cards .card')[0];

        // lo elimino de ese contenedor
        $elem.remove();

        // lo añado a carta jugada del oponente
        $oponnentPlay.append($elem);
    }

    /**
     * Notifica que un jugador ha jugado una carta
     */
    socket.on('played', function (player, card) {
        if (player === name){
            onPlayCard(card);
        }else{
            onOponnentPlayCard(card);
        }
    });
})(window, undefined, $, socket, name);