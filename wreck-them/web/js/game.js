(function (window, undefined, $, socket, name) {
    'use strict';
    var $search = $('#search-game'),
        $myCards = $("#my-cards"),
        $oponnentCards = $("#oponnent-cards"),
        $sample = $('#sample'),
        $myPlay = $('#my-play'),
        $oponnentPlay = $('#oponnent-play'),
        chronoInterval,
        chronoFinish,
        $chrono = $('#chrono'),
        $scores = $('#scores'),
        $turn = $('#turn'),
        $num = $('#num'),
        restCards = 40;

    function initChrono(finishTime) {
        chronoFinish = finishTime;

        console.log(new Date(finishTime));

        // Si ya había un cronómetro activo, se limpia
        if (chronoInterval) {
            clearInterval(chronoInterval);
        }

        chronoInterval = setInterval(function () {
            var actual = new Date().getTime(),
                timeRest = (chronoFinish - actual) / 1000;
            $chrono.text(timeRest.toFixed(0));

            if (actual > chronoFinish) {
                finishChrono();
            }
        }, 250);
    }

    function finishChrono() {
        clearInterval(chronoInterval);
        $chrono.text('No hay crono');
    }

    function updateNum() {
        if (restCards <= 0) return;

        $num.text(--restCards);

        if(restCards < 1){
            $sample.addClass('semi-transparent');
            $num.css('background-image', 'none');
        }
    }

    /**
     * Muestra una carta que estaba bocabajo
     * @param $elem elemento del DOM que contiene la carta
     * @param card información de la carta para establecerla en el elemento
     */
    function turnOverCard($elem, card) {
        var classStr = card.suit + card.num.name;
        $elem.addClass(classStr);
    }

    /**
     * Recoje el elemento del DOM que corresponde a la carta
     * que tiene el id enviado a buscar
     * @param id identificador de la carta
     * @returns {$element|undefined}
     */
    function getElementCard(id) {
        var i, $elem, idCard, values,
            $cards = $('#my-cards .card');

        // recorro los divs, es decir, las cartas del propio jugador
        for (i = 0; i < $cards.length; i++) {
            $elem = $cards.eq(i);

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

    /**
     * Buscar una partida
     * */
    $search.click(function () {
        socket.emit('search game');
        $search.prop('disabled', true);
    });

    /**
     * Notifica que se ha unido a una partida
     * */
    socket.on('game', function (idGame) {
        console.log('Te has unido a la sala: ' + idGame);
    });

    /**
     *  Notifica que ha empezado la partida
     *  */
    socket.on('begin', function (data1, data2) {
        $search.prop('disabled', true);
        console.log('¡Comienza la partida!', data1, data2);
//                if(window.location.pathname != '/jugar')
//                    window.location = '/jugar';
    });

    /**
     * Notifica que se ha emitido un turno de jugador
     * */
    socket.on('turn', function (playerName, time) {
        finishChrono();
        if (playerName === name) {
            $turn.text('Me toca');
        }
        else {
            $turn.text('Le toca a ' + playerName);
        }
        initChrono(time);
    });

    /**
     * Recoge la carta enviada del servidor y la añade al contenedor
     * html del jugador y además le asocia su información mediante
     * jQuery data('card')
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

        updateNum();
        console.log('He recibido la carta: ', card.suit, ' ', card.num.name);
    });

    /**
     * Envía al servidor la carta sobre la que se ha clickado
     */
    $myCards.click(".cards", function (ev) {
        var elem    = $(ev.target),
            card   = elem.data('card');
        console.log('Ha intentado jugar: '+card.id);
        socket.emit('play', card.id);
    });

    $sample.click(function () {
        var elem    = $(this),
            card   = elem.data('card');
        socket.emit('change sample', card.id);
    });

    /**
     * Recibe la muestra de la partida
     */
    socket.on('sample', function (card) {
        $sample.data('card', card);
        turnOverCard($sample, card);
        console.log('La muestra es: ', card);
    });

    socket.on('numCards', function (numCards) {
        restCards = numCards;
    });

    /**
     * Notifica que un oponente ha recibido una carta
     */
    socket.on('oponnent card', function (player) {
        if (player === name)
            return;

        // creo el elemento html
        var $htmlCard = $('<div class="card"></div>');

        // añado la carta a la caja contenedora de la GUI
        $oponnentCards.append($htmlCard);

        updateNum();

        console.log('El jugador ' + player + ' ha recibido una carta');
    });

    function onPlayCard(card){
        // recojo el elemento que contiene esa carta
        var $elem = getElementCard(card.id);

        // lo elimino de las cartas del usuario
        $elem.remove();

        // lo añado a carta jugada
        $myPlay.html($elem);
    }

    function onPlayCardLate(card){
        var $elem = $('<div class="card"></div>');
        $myPlay.html($elem);
        turnOverCard($elem, card);
    }

    function onOponnentPlayCardLate(card){
        var $elem = $('<div class="card"></div>');
        $oponnentPlay.html($elem);
        turnOverCard($elem, card);
    }

    function onOponnentPlayCard(card){
        // recojo cualquier carta bocaabajo de su contenedor
        var $elem = $('#oponnent-cards .card').eq(0);

        // lo elimino de ese contenedor
        $elem.remove();

        // lo añado a carta jugada del oponente
        $oponnentPlay.html($elem);

        turnOverCard($elem, card);
    }

    /**
     * Notifica que un jugador ha jugado una carta
     */
    socket.on('played', function (playerName, card) {
        console.log(playerName + ' ha jugado ' , card);
        if (playerName === name){
            onPlayCard(card);
        }else{
            onOponnentPlayCard(card);
        }
        finishChrono();
    });

    socket.on('change sample', function (playerName, oldSample, sample) {
        // si yo la he cambiado
        if(playerName === name){
            // recojo la nueva muestra
            var $elem = getElementCard(sample.id);

            // la elimino de la mano
            $elem.remove();

            // la añado a muestra
            turnOverCard($sample, sample);

            // creo un elemento para la nueva carta en mano
            var $htmlCard = $('<div class="card"></div>');

            // le añado su información
            $htmlCard.data('card', oldSample);

            // añado la carta a la caja contenedora de la GUI
            $myCards.append($htmlCard);

            // Pongo la carta bocarriba
            turnOverCard($htmlCard, oldSample);
        }
    });

    socket.on('latePlayed', function (playerName, card) {
        console.log(playerName + ' ha jugado ' , card);
        if (playerName === name){
            onPlayCardLate(card);
        }else{
            onOponnentPlayCardLate(card);
        }
        finishChrono();
    });

    socket.on('winnerHand', function (playerName) {
        $scores.append('<p><strong>' + playerName + ' ha ganado la mano</strong></p>');
        finishChrono();
        $myPlay.html('');
        $oponnentPlay.html('');
    });

    socket.on('winners', function (winnersNames) {
        if(winnersNames.length == 1)
            alert(winnersNames[0] + ' ha ganado la partida');
        else if (winnersNames.length > 0) {
            alert('Han ganado la partida: ' + winnersNames.join(', '));
        } else
            console.log('¡¡¡nadie ha ganado la partida!!! ¿¿??');

    });

    socket.on('scores', function (players) {
        $scores.append('<p>' + players[0].name + ': ' + players[0].score + '</p>');
        $scores.append('<p>' + players[1].name + ': ' + players[1].score + '</p>');
        $scores.append('<p>--------------</p>');
    });

})(window, undefined, $, socket, name);