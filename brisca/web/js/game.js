// TODO mensajes modo dialogo para los sucesos en la partida
// FIXME al reiniciar una partida, la muestra no se actualiza
// FIXME el número de cartas restantes se queda a 1 en algunas ocasiones
// FIXME scroll al abrir el chat
(function (window, undefined, $, socket, name) {
    'use strict';
    var $search, $overGame, $myCards, $oponnentCards, $sample, $myPlay, $oponnentPlay, chronoInterval, chronoFinish, $chrono, $chronoShadow, $scores, $turn, $num, $deck, $iDiv, $oponnentDiv, $oponnentImg, $oponnentName, $tabChatGame, $tabChatGame2, $tabs, $tabs2, $modalTrigger, $gameAlert, $finish, $finishText, $finishOponnentImg, $finishOponnentName, $finishOponnentScore, $finishMyScore, $imgW, $imgL, $imgD, oneTime, $oponnentOver, $myOver, restCards, soundDistribute, soundDraw, soundBg, soundFlip, soundLose, soundWin, turn, $msgsGame;

    /**
     * force load sounds on mobile devices
     * @param element
     */
    //function load(element) {
    //    element.play();
    //    setTimeout(function () {
    //        element.pause();
    //    }, 10);
    //}

    function animateFlipCard($elem, classStr) {
        var angle = 90,
            halfDuration = 300;
        $({deg: 0}).animate({deg: angle}, {
            duration: halfDuration,
            easing: 'linear',
            step: function (now) {
                // in the step-callback (that is fired each step of the animation),
                // you can use the `now` paramter which contains the current
                // animation-position (`0` up to `angle`)
                $elem.css({
                    transform: 'rotateY(' + now + 'deg)'
                });
            },
            complete: function () {
                $elem.addClass(classStr);
                $elem.css('transform', 'rotateY(270deg)');

                var angle = 360;
                $({deg: 270}).animate({deg: angle}, {
                    duration: halfDuration,
                    easing: 'linear',
                    step: function (now) {
                        // in the step-callback (that is fired each step of the animation),
                        // you can use the `now` paramter which contains the current
                        // animation-position (`0` up to `angle`)
                        $elem.css({
                            transform: 'rotateY(' + now + 'deg)'
                        });
                    },
                    complete: function () {
                        $elem.css('transform', 'rotateY(0deg)');
                    }
                });

            }
        });
    }

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

    function showWinnerHand(winner) {

        if (winner === 0) {
            $oponnentOver.css('backgroundColor', 'rgba(255,0,0,0.6)');
            $myOver.css('backgroundColor', 'rgba(0,255,0,0.6)');
        } else {
            $oponnentOver.css('backgroundColor', 'rgba(0,255,0,0.6)');
            $myOver.css('backgroundColor', 'rgba(255,0,0,0.6)');
        }

        setTimeout(function () {
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
        turn = -1;
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
     * @param animate
     */
    function turnOverCard($elem, card, oldCard, animate) {
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
        if (animate)
            animateFlipCard($elem, classStr);
        else
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
     * Notifica que se ha unido a una partida
     * */
    socket.on('game', function (idGame) {
        $search.prop('disabled', true);
        $overGame.fadeOut();

        $tabChatGame.removeClass('disabled');
        $tabs.tabs('select_tab', 'c-game');

        $tabChatGame2.removeClass('disabled');
        $tabs2.tabs('select_tab', 'c-game2');

        soundBg.play();

        $msgsGame.html('');

        Materialize.toast('Te has unido a una partida', 4000);
    });

    /**
     *  Notifica que ha empezado la partida
     *  */
    socket.on('begin', function () {
        $search.prop('disabled', true);
    });

    socket.on('oponnent', function (username, img) {
        $oponnentName.text(username);
        $oponnentImg.attr('src', '/uploads/images/' + img);

        $finishOponnentName.text(username);
        $finishOponnentImg.attr('src', '/uploads/images/' + img);

        Materialize.toast(username + ' se ha unido a la partida', 4000);
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
            Materialize.toast('Tu turno', 4000);
            turn = 0;
        }
        else {
            $oponnentDiv.addClass('turn');
            Materialize.toast('Turno del oponente', 4000);
            turn = 1;
        }
        initChrono(time);
    });

    /**
     * Recoge la carta enviada del servidor y la añade al contenedor
     * html del jugador y además le asocia su información mediante
     * jQuery data('card')
     */
    socket.on('card', function (card) {
        soundDistribute.play();

        // creo el elemento html
        var $htmlCard = $('<div class="game-card"></div>');

        // le añado como información la carta enviada
        $htmlCard.data('card', card);

        // añado la carta a la caja contenedora de la GUI
        $myCards.append($htmlCard);

        // Pongo la carta bocarriba
        turnOverCard($htmlCard, card, null, true);

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
        soundDistribute.play();

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
        soundDistribute.play();

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
        soundDistribute.play();

        var $elem, $htmlCard;

        if (playerName === name) {
            Materialize.toast('Has cambiado la muestra', 4000);
        } else {
            Materialize.toast(playerName + ' ha cambiado la muestra', 4000);
        }

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

        if (playerName === name)
            Materialize.toast('Has ganado la mano', 4000);
        else
            Materialize.toast(playerName + ' ha ganado la mano', 4000);

        /**
         * 0 = me
         * 1 = oponnent
         * @type {number}
         */
        var winner;
        if (playerName === name) {
            winner = 0;
        } else {
            winner = 1;
        }
        finishChrono();

        showWinnerHand(winner);
    });

    socket.on('score', function (playerName, score) {
        if (playerName === name) {
            $finishMyScore.text(score);
        } else {
            $finishOponnentScore.text(score);
        }
    });

    socket.on('winners', function (winnersNames) {
        soundBg.pause();
        $imgD.hide();
        $imgL.hide();
        $imgW.hide();

        if (winnersNames.length == 1) {
            var winner = winnersNames[0];
            if (winner === name) {
                $imgW.show();
                soundWin.play();
                $finishText.text('¡Has ganado la partida!');
            } else {
                $imgL.show();
                soundLose.play();
                $finishText.text('Tu oponente ha ganado la partida');
            }
        } else if (winnersNames.length > 0) {
            soundDraw.play();
            $finishText.text('La partida ha terminado en empate');
            $imgD.show();
        } else
            console.log('¡¡¡nadie ha ganado la partida!!! ¿¿??');

        $finish.openModal();

        resetGame();
    });

    // Init vars and listeners on DOM load
    $(function () {
        $search = $('#search-game');
        $overGame = $('#over-game');
        $myCards = $("#my-cards");
        $oponnentCards = $("#oponnent-cards");
        $sample = $('#sample');
        $myPlay = $('#my-play');
        $oponnentPlay = $('#oponnent-play');
        $chrono = $('#chrono');
        $chronoShadow = $('#chrono-shadow');
        $scores = $('#scores');
        $turn = $('#turn');
        $num = $('#num');
        $deck = $('#deck');
        $iDiv = $('#iImg');
        $oponnentDiv = $('#oponnentImg');
        $oponnentImg = $('#oponnentImg img');
        $oponnentName = $('#oponnent-name');
        $tabChatGame = $('#tab-chat-game');
        $tabChatGame2 = $('#tab-chat-game2');
        $tabs = $('#tabs');
        $tabs2 = $('#tabs2');
        $modalTrigger = $('#trigger');
        $gameAlert = $('#game-alert');
        $finish = $('#finish');
        $finishText = $('#finish-text');
        $finishOponnentImg = $('#finish-oponnent-img');
        $finishOponnentName = $('#finish-oponnent-name');
        $finishOponnentScore = $('#finish-oponnent-score');
        $finishMyScore = $('#finish-my-score');
        $imgW = $('#winner');
        $imgL = $('#loser');
        $imgD = $('#draw');
        oneTime = true;
        $oponnentOver = $('#oponnent-over');
        $myOver = $('#my-over');
        restCards = 40;
        soundDistribute = document.getElementById('s-distribute');;
        soundDraw = document.getElementById('s-draw');
        soundFlip = document.getElementById('s-flip');
        soundLose = document.getElementById('s-lose');
        soundWin = document.getElementById('s-win');
        soundBg = document.getElementById('s-bg');
        $msgsGame = $('.msgs-game');
        /**
         * 0 = mio, 1 = oponente
         * @type {number}
         */
        turn = -1;

        //load(soundDraw);
        //load(soundFlip);
        //load(soundLose);
        //load(soundWin);

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

            if (restCards < 1)
                return;

            if (turn != 0) {
                Materialize.toast('No es tu turno', 4000);
                return;
            }

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
            } else {
                switch (idCardToChange) {
                    case 7:
                    case 17:
                    case 27:
                    case 37:
                        Materialize.toast('Necesitas el 7 de ' + actualSample.suit + ' para cambiar', 4000);
                        break;
                    case 2:
                    case 12:
                    case 22:
                    case 32:
                        Materialize.toast('Necesitas el 2 de ' + actualSample.suit + ' para cambiar', 4000);
                        break;
                }
            }
        });

        /**
         * Buscar una partida
         * */
        $search.click(function () {
            socket.emit('search game');
        });
    });

    //$(window).load(function () {
        //soundBg.play();
    //})

})(window, undefined, $, socket, name);