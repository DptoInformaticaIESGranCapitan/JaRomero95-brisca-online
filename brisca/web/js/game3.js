// TODO mensajes modo dialogo para los sucesos en la partida
// FIXME al reiniciar una partida, la muestra no se actualiza
// FIXME el número de cartas restantes se queda a 1 en algunas ocasiones
// FIXME scroll al abrir el chat
(function (window, undefined, $, socket, name) {
    'use strict';
    var $search = $('#search-game'),
        $overGame = $('#over-game'),
        $myCards = $("#my-cards"),
        $oponnentCards = $("#oponnent-cards"),
        $sample = $('#sample'),
        $myPlay = $('#my-play'),
        $oponnentPlay = $('#oponnent-play'),
        chronoInterval,
        chronoFinish,
        $chrono = $('#chrono'),
        $chronoShadow = $('#chrono-shadow'),
        $scores = $('#scores'),
        $turn = $('#turn'),
        $num = $('#num'),
        $deck = $('#deck'),
        $iDiv = $('#iImg'),
        $oponnentDiv = $('#oponnentImg'),
        $oponnentImg = $('#oponnentImg img'),
        $oponnentName = $('#oponnent-name'),
        $tabChatGame = $('#tab-chat-game'),
        $tabChatGame2 = $('#tab-chat-game2'),
        $tabs = $('#tabs'),
        $tabs2 = $('#tabs2'),
        $modalTrigger = $('#trigger'),
        $gameAlert = $('#game-alert'),
        $finish = $('#finish'),
        $finishText = $('#finish-text'),
        $finishOponnentImg = $('#finish-oponnent-img'),
        $finishOponnentName = $('#finish-oponnent-name'),
        $finishOponnentScore = $('#finish-oponnent-score'),
        $finishMyScore = $('#finish-my-score'),
        $imgW = $('#winner'),
        $imgL = $('#loser'),
        $imgD = $('#draw'),
        oneTime = true,
        $oponnentOver = $('#oponnent-over'),
        $myOver = $('#my-over'),
        restCards = 40;

    function resetGame() {

        setTimeout(function () {
            $oponnentName.text('');
            $oponnentImg.attr('src', '/img/qmark.png');
        });

        $sample.removeClass();
        $sample.addClass('game-card');
        $overGame.fadeIn();
        $search.prop('disabled', false);
        $tabChatGame.addClass('disabled');
    }

    function showAlert(msg) {
        //// si se estaba mostrando, lo ocultamos
        //$gameAlert.hide(0);
        //$gameAlert.removeClass('doAnim');
        //
        //// añadimos el nuevo mensaje
        //$gameAlert.html('<p>' + msg + '</p>');
        //
        //// lo mostramos, inicialmente no se ve porque está rotado
        //$gameAlert.show(0)
        //    // lo hacemos rotar y hacerse visible después de mostrarse
        //    .addClass('doAnim',
        //
        //        // temporizador para ocultarse
        //        setTimeout(function () {
        //            // lo ocultamos
        //            $gameAlert.fadeOut(800, function () {
        //                // después de ocultarse eliminamos la clase para que vuelve a la posición inicial
        //                $gameAlert.removeClass('doAnim');
        //            })
        //        }, 3000));
    }

    function showWinnerHand(winner){

        if(winner === 0){
            $oponnentOver.css('backgroundColor', 'rgba(255,0,0,0.6)');
            $myOver.css('backgroundColor', 'rgba(0,255,0,0.6)');
        }else {
            $oponnentOver.css('backgroundColor', 'rgba(0,255,0,0.6)');
            $myOver.css('backgroundColor', 'rgba(255,0,0,0.6)');
        }

        setTimeout(function(){
            $oponnentOver.css('backgroundColor', 'transparent');
            $myOver.css('backgroundColor', 'transparent');
            $myPlay.html('');
            $oponnentPlay.html('');
        }, 1900);
    }

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
            $chronoShadow.text(timeRest.toFixed(0));

            if (actual > chronoFinish) {
                finishChrono();
            }
        }, 250);
    }

    function finishChrono() {
        clearInterval(chronoInterval);
        $chrono.text('--');
        $chronoShadow.text('--');
    }

    function updateNum() {
        var right, bottom;

        $num.text(restCards);

        right = Math.ceil(restCards * 0.25);
        bottom = Math.ceil(restCards * 0.25);
        $deck.css('box-shadow', right + 'px -' + bottom + 'px ' + '18px black');

        if (restCards < 1) {
            $sample.addClass('semi-transparent');
            $deck.hide();
            $num.hide();
        } else {
            $deck.show();
            $num.show();
            $sample.removeClass('semi-transparent');
        }
    }

    /**
     * Muestra una carta que estaba bocabajo
     * @param $elem elemento del DOM que contiene la carta
     * @param card información de la carta para establecerla en el elemento
     * @param oldCard
     */
    function turnOverCard($elem, card, oldCard) {
        var classStr = card.suit + card.num.name,
            oldClassStr;

        // si hay carta antigua, elimino la clase
        if (oldCard) {
            oldClassStr = oldCard.suit + oldCard.num.name;
            console.log('intento eliminar la clase ', oldClassStr);
            $elem.removeClass(oldClassStr);
        } else {
            console.log('No hay carta antigua');
        }

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
            $cards = $('#my-cards .game-card');

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

    function onPlayCard(card) {
        // recojo el elemento que contiene esa carta
        var $elem = getElementCard(card.id);

        // lo elimino de las cartas del usuario
        $elem.remove();

        // lo añado a carta jugada
        $myPlay.html($elem);
    }

    function onPlayCardLate(card) {
        var $elem = $('<div class="game-card"></div>');
        $myPlay.html($elem);
        turnOverCard($elem, card);
    }

    function onOponnentPlayCardLate(card) {
        var $elem = $('<div class="game-card"></div>');
        $oponnentPlay.html($elem);
        turnOverCard($elem, card);
    }

    function onOponnentPlayCard(card) {
        // recojo cualquier carta bocaabajo de su contenedor
        var $elem = $('#oponnent-cards .game-card').eq(0);

        // lo elimino de ese contenedor
        $elem.remove();

        // lo añado a carta jugada del oponente
        $oponnentPlay.html($elem);

        turnOverCard($elem, card);
    }

    /**
     * acciona la pestaña del chat la primera vez que
     * se abre( solo el del diálogo)
     */
    $modalTrigger.click(function () {
        if (oneTime) {
            setTimeout(function () {
                if ($tabChatGame.hasClass('disabled')) {
                    $tabs2.tabs('select_tab', 'c-general2');
                } else {
                    $tabs2.tabs('select_tab', 'c-game2');
                }

                oneTime = false;
            }, 100);
        }
    });

    /**
     * Envía al servidor la carta sobre la que se ha clickado
     */
    $myCards.click(".cards", function (ev) {
        var elem = $(ev.target),
            card = elem.data('card');
        console.log('Ha intentado jugar: ' + card.id);
        socket.emit('play', card.id);
    });

    $sample.click(function () {
        var elem = $(this),
            actualSample,
            idCardToChange,
            $elemCardToChange,
            cardToChange;

        // cojo la carta de muestra
        actualSample = $sample.data('card');

        // Compruebo si la muestra es mayor que la carta 7 => value: 5
        if (actualSample.num.value > 5) {

            // en función del palo de muestra, busco la carta 7 en la baraja
            switch (actualSample.suit) {
                case 'espadas':
                    idCardToChange = 7;
                    break;
                case 'bastos':
                    idCardToChange = 17;
                    break;
                case 'oros':
                    idCardToChange = 27;
                    break;
                case 'copas':
                    idCardToChange = 37;
                    break;
            }
        } else {
            // compruebo que la muestra es mayor que la carta 2 => value: 1
            if (actualSample.num.value > 1) {
                // en función del palo de muestra, busco la carta 2 en la baraja
                switch (actualSample.suit) {
                    case 'espadas':
                        idCardToChange = 2;
                        break;
                    case 'bastos':
                        idCardToChange = 12;
                        break;
                    case 'oros':
                        idCardToChange = 22;
                        break;
                    case 'copas':
                        idCardToChange = 32;
                        break;
                }
            }
        }

        // recojo el elemento de la carta necesitada para cambiar la brisca de la mano del usuario
        $elemCardToChange = getElementCard(idCardToChange);

        // si existe un elemento con esa carta
        if ($elemCardToChange) {
            cardToChange = $elemCardToChange.data('card');

            // tengo la carta necesaria, así que la envío para cambiar
            socket.emit('change sample', cardToChange.id);
        }
    });

    /**
     * Buscar una partida
     * */
    $search.click(function () {
        socket.emit('search game');
    });

    /**
     * Notifica que se ha unido a una partida
     * */
    socket.on('game', function (idGame) {
        $search.prop('disabled', true);
        $overGame.fadeOut();

        $tabChatGame.removeClass('disabled');
        $tabs.tabs('select_tab', 'c-game');

        $tabChatGame2.removeClass('disabled');
        $tabs2.tabs('select_tab', 'c-game2');


        showAlert('Te has unido a una partida');
    });

    /**
     *  Notifica que ha empezado la partida
     *  */
    socket.on('begin', function () {
        showAlert('La partida va a comenzar');
        $search.prop('disabled', true);
    });

    socket.on('oponnent', function (username, img) {
        $oponnentName.text(username);
        $oponnentImg.attr('src', '/uploads/images/' + img);

        $finishOponnentName.text(username);
        $finishOponnentImg.attr('src', '/uploads/images/' + img);
    });

    /**
     * Notifica que se ha emitido un turno de jugador
     * */
    socket.on('turn', function (playerName, time) {
        finishChrono();

        $iDiv.removeClass('turn');
        $oponnentDiv.removeClass('turn');

        if (playerName === name) {
            $iDiv.addClass('turn');
            showAlert('Tu turno');
        }
        else {
            $oponnentDiv.addClass('turn');
            showAlert('Turno del oponente');
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
        var $htmlCard = $('<div class="game-card"></div>');

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
     * Recibe la muestra de la partida
     */
    socket.on('sample', function (card) {
        $sample.data('card', card);
        turnOverCard($sample, card);
        console.log('La muestra es: ', card);
    });

    socket.on('numCards', function (numCards) {
        restCards = numCards;
        updateNum();
    });

    /**
     * Notifica que un oponente ha recibido una carta
     */
    socket.on('oponnent card', function (player) {
        if (player === name)
            return;

        // creo el elemento html
        var $htmlCard = $('<div class="game-card"></div>');

        // añado la carta a la caja contenedora de la GUI
        $oponnentCards.append($htmlCard);

        updateNum();

        console.log('El jugador ' + player + ' ha recibido una carta');
    });

    /**
     * Notifica que un jugador ha jugado una carta
     */
    socket.on('played', function (playerName, card) {
        console.log(playerName + ' ha jugado ', card);
        if (playerName === name) {
            onPlayCard(card);
            $iDiv.removeClass('turn');
        } else {
            onOponnentPlayCard(card);
            $oponnentDiv.removeClass('turn');
        }
        finishChrono();
    });

    socket.on('change sample', function (playerName, oldSample, sample) {
        var $elem, $htmlCard;

        console.log('Ha llegado un change sample del usuario ', playerName, ' donde la antigua muestra era ', oldSample.suit + ' - ', oldSample.num.name, ' y la nueva muestra es ', sample.suit + ' - ', sample.num.name);

        // si yo la he cambiado
        if (playerName === name) {
            // recojo el elemento de mi mano de la nueva muestra
            $elem = getElementCard(sample.id);

            // lo elimino de la mano
            $elem.remove();

            // añado la carta a muestra
            $sample.data('card', sample);
            turnOverCard($sample, sample, oldSample);

            // creo un elemento para la nueva carta en mano
            $htmlCard = $('<div class="game-card"></div>');

            // le añado su información
            $htmlCard.data('card', oldSample);

            // añado la carta a la caja contenedora de la GUI
            $myCards.append($htmlCard);

            // Pongo la carta bocarriba
            turnOverCard($htmlCard, oldSample);
        } else {
            // aquí si la muestra no la he cambiado yo mismo

            showAlert('Tu oponente ha cambiado la muestra');

            // recojo cualquier carta bocaabajo de su contenedor
            $elem = $('#oponnent-cards .game-card').eq(0);

            // lo elimino de ese contenedor
            $elem.remove();

            // añado la carta a muestra
            $sample.data('card', sample);
            turnOverCard($sample, sample, oldSample);

            // creo el elemento html
            $htmlCard = $('<div class="game-card"></div>');

            // añado la carta a la caja contenedora de la GUI
            $oponnentCards.append($htmlCard);
        }
    });

    socket.on('latePlayed', function (playerName, card) {
        console.log(playerName + ' ha jugado ', card);
        if (playerName === name) {
            onPlayCardLate(card);
        } else {
            onOponnentPlayCardLate(card);
        }
        finishChrono();
    });

    socket.on('winnerHand', function (playerName) {

        /**
         * 0 = me
         * 1 = oponnent
         * @type {number}
         */
        var winner;
        if(playerName === name) {
            winner = 0;
        } else {
            winner = 1;
        }
        finishChrono();

        showWinnerHand(winner);
    });

    socket.on('final', function (players) {
        var player1,
            player2,
            /**
             * me = 0
             * oponnent = 1
             * draw = 2
             */
            winner;

        $imgD.hide();
        $imgL.hide();
        $imgW.hide();

        player1 = players[0];
        player2 = players[1];

        // establezco las puntuaciones en el dom
        if(player1.name === name){
            $finishMyScore.text(player1.score);
            $finishOponnentScore.text(player2.score)

            if(player1.score > player2.score){
                winner = 0;
            } else if (player1.score < player2.score) {
                winner = 1;
            } else {
                winner = 2;
            }

        } else {
            $finishMyScore.text(player2.score);
            $finishOponnentScore.text(player1.score)

            if(player1.score > player2.score){
                winner = 1;
            } else if (player1.score < player2.score) {
                winner = 0;
            } else {
                winner = 2;
            }
        }




        if (winners.length == 1){
            var winner = winners[0];
            if (winner.name === name){
                $finishText.text('¡Has ganado la partida!');
                $imgW.show();
                $finish.openModal();
            } else {
                $finishText.text('Tu rival ha ganado la partida');
                $imgL.show();
                $finish.openModal();
            }
        } else if (winners.length > 0) {
            $finishText.text('La partida ha terminado en empate');
            $imgD.show();
            $finish.openModal();
        } else
            alert('¡¡¡nadie ha ganado la partida!!! ¿¿??');

        resetGame();
    });

    socket.on('scores', function (players) {
        $scores.append('<p>' + players[0].name + ': ' + players[0].score + '</p>');
        $scores.append('<p>' + players[1].name + ': ' + players[1].score + '</p>');
        $scores.append('<p>--------------</p>');
    });

})(window, undefined, $, socket, name);