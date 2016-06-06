var Player = require('./Player.js');//recibo el constructor
var Chrono = require('./Chrono.js');//recibo el constructor
var Deck = require('./Deck.js');//recibo el constructor

// FIXME un usuario puede cambiar la muestra después de jugar su turno, puesto que conforme se envía y calcula la mano, el aún tiene el turno apuntándole

var numPlayers = 2,
    timeMargin = 2,
    timeTurn = 20;

function Game(io) {
    'use strict';

    /**
     * Referencia para poder enviar información desde la clase
     */
    this.io = io;

    /**
     * Id de la partida
     * @type {number}
     */
    this.id = new Date().getTime();

    /**
     * Usuarios de la partida, se usa durante el periodo de espera
     * @type {{}}
     */
    this.users = {};

    /**
     * Jugadores de la partida, una vez esta ha empezado
     * @type {Array}
     */
    this.players = [];

    /**
     * Facilita la cuenta de propiedades del objeto this.users
     * @type {number}
     */
    this.numUsers = 0;

    /**
     * FIXME: esto debería suprimirse y usarse this.state
     * Define si la partida ya está empezada
     * @type {boolean}
     */
    this.start = false;

    /**
     * Cronómetro de la partida
     * @type {Chrono|exports|module.exports}
     */
    this.chrono = new Chrono(this);

    /**
     * Baraja de la partida
     * @type {Deck|exports|module.exports}
     */
    this.deck = new Deck();

    /**
     * Estado actual de la partida. Se inicia en espera
     * @type {string}
     */
    this.state = this.states.wait;

    /**
     * Índice del jugador al que le toca jugar
     * @type {number}
     */
    this.turn = 0;

    /**
     * Índice del jugador que ha iniciado la mano
     * @type {number}
     */
    this.firstTurn = 0;


    /**
     * Muestra. Se inicia una vez ha comenzado la partida
     * @type {undefined}
     */
    this.sample = undefined;

    /**
     * Establece a los ganadores al acabar la partida
     * @type {[]}
     */
    this.winners = undefined;
}

/**
 * Añade un usuario a la partida
 * @param user Usuario que desea añadirse
 */
Game.prototype.addUser = function (user) {
    'use strict';
    if (this.numUsers < numPlayers) {
        // solo añado si no existe ya en la partida
        if (!this.users[user.name]) {
            // solo añado si no tiene ya una partida en curso
            if (!user.game) {
                this.users[user.name] = user;
                ++this.numUsers;
            }
        }
    }
    this.checkUsers();
};

/**
 * Comprueba si están todos los usuarios para poder empezar la partida
 */
Game.prototype.checkUsers = function () {
    'use strict';
    if (this.numUsers === numPlayers) {
        this.init();
        this.start = true;

        this.state = this.states.sendInit;
    }
};

/**
 * Crea la partida cuando están todos los jugadores
 */
Game.prototype.init = function () {
    'use strict';
    // creo un player para cada usuario en la partida
    var user, users = this.users;
    for (user in users) {
        if (users.hasOwnProperty(user)) {
            this.players.push(new Player(users[user].name, users[user].img));
        }
    }
    this.sendInitInfo();
};

Game.prototype.sendLateGame = function (userName) {
    'use strict';
    var player = this.getPlayer(userName),
        i,
        card,
        oponnent,
        j;

    console.log('SendLateGame a ', userName);

    // recorro todos los jugadores
    for (i = 0; i < this.players.length; ++i) {
        oponnent = this.players[i];

        // recorro las cartas del jugador
        for (j = 0; j < oponnent.cards.length; ++j) {
            card = oponnent.cards[j];

            // Si el jugador es el mismo que el que se ha conectado, envío sus cartas
            if (oponnent === player) {
                this.notify(player.name, 'card', card);
                console.log('envío carta a ', player.name);
            }
            else {
                this.notify(player.name, 'oponnent card', oponnent.name);
                console.log('envío carta oponente a ', player.name);
            }

            // envío cartas jugadas si las hay
            if (oponnent.cardPlayed) {
                console.log('envío carta jugada por ', oponnent.name, ' a ', player.name);
                this.notify(player.name, 'latePlayed', oponnent.name, oponnent.cardPlayed);
            }
        }
    }

    // envío las cartas restantes
    this.notify(player.name, 'numCards', this.deck.cards.length);

    // envío la muestra
    this.notify(player.name, 'sample', this.sample);

    this.notify(player.name, 'game', player.game);

    if (player.name === this.players[1].name) {
        this.notify(this.players[1].name, 'oponnent', this.players[0].name, this.players[0].img);
    } else {
        this.notify(this.players[0].name, 'oponnent', this.players[1].name, this.players[1].img);
    }

    // envío el turno si existe este ahora
    if (this.state === this.states.playHand) {
        this.notify(player.name, 'turn', this.players[this.turn].name, this.chrono.finishTime);
    }

};

/**
 * Envía la información inicial de la partida a los jugadores que la componen
 */
Game.prototype.sendInitInfo = function () {
    'use strict';
    console.log('Comienza la partida: ' + this.id);
    this.notifyAll('begin');
    this.notify(this.players[0].name, 'oponnent', this.players[1].name, this.players[1].img);
    this.notify(this.players[1].name, 'oponnent', this.players[0].name, this.players[0].img);
    //this.setTurn();
    this.distribute();
};

/**
 * Al comenzar la partida, envía las tres primeras cartas a cada jugador y la brisca
 */
Game.prototype.distribute = function () {
    'use strict';
    var i, j, player, card;

    // La muestra es la primera carta, pero no se saca de la baraja porque al final de la partida también se repartirá esta carta
    this.sample = this.deck.cards[0];
    this.notifyAll('sample', this.sample);

    for (i = 0; i < this.players.length; ++i) {
        player = this.players[i];
        // a cada jugador, le reparto y ENVÍO 3 cartas
        for (j = 0; j < 3; ++j) {
            card = this.deck.cards.pop();
            player.cards.push(card);

            // Nombre, carta
            this.notify(player.name, 'card', card);
            this.notifyAll('oponnent card', player.name);
        }
    }

    this.notifyAll('numCards', this.deck.cards.length);

    this.chrono.init(timeMargin);
};

/**
 * Al comenzar la partida, envía las tres primeras cartas a cada jugador y la brisca
 */
Game.prototype.distributeHand = function () {
    'use strict';

    if (this.hasCards()) {
        var i,
            player,
            card,
            card1 = this.deck.cards.pop(),
            card2 = this.deck.cards.pop();

        for (i = 0; i < this.players.length; ++i) {
            player = this.players[i];

            if (player === this.players[this.turn]) {
                card = card1;
            } else {
                card = card2;
            }

            // añado la carta a su mano
            player.cards.push(card);

            // Nombre, carta
            this.notify(player.name, 'card', card);
            this.notifyAll('oponnent card', player.name);
        }

        this.chrono.init(timeMargin);
    } else {
        // si no reparto cartas, espero menos tiempo para pasar a la siguiente acción
        this.chrono.init(1);
    }

    // envía las cartas restantes
    this.notifyAll('numCards', this.deck.cards.length);
};

/**
 * Elimina un usuario de la partida si se desconecta del socket. Esto solo sucede si el usuario está en la partida y esta se encuentra en espera mientras se unen los demás.
 * @param user usuario que se debe eliminar
 */
Game.prototype.removeUser = function (user) {
    'use strict';
    if (!this.start) {
        delete this.users[user.name];
        user.game = undefined;
        --this.numUsers;
        console.log('Se ha eliminado a ' + user.name + ' de la partida ' + this.id);
    }
};

/**
 * Envío información al websocket de un usuario
 * @param name nombre del usuario que debe recibir la información
 * @param event nombre del evento que recibirá
 * @param data1 información
 * @param data2 información
 * @param data3 información
 * @param data4 información
 */
Game.prototype.notify = function (name, event, data1, data2, data3, data4) {
    'use strict';
    //console.log('[DEBUG GAME NOTIFY] Evento: ' + event + ' | Usuario: ' + name + ' | Info: ', data1, data2, data3, data4);
    var user = this.users[name];
    if (user) {
        if(user.socket){
            user.socket.emit(event, data1, data2, data3, data4);
        } else {
            console.log('!!!!!Game notify: se intentaba enviar algo a un socket sin definir');
        }
    } else {
        console.log('[DEBUG GAME NOTIFY] no hay usuario!!' + name);
    }
};

/**
 * Notifica un evento a todos los usuarios de la partida
 * @param event {string} nombre del evento
 * @param data1
 * @param data2
 * @param data3
 * @param data4
 */
Game.prototype.notifyAll = function (event, data1, data2, data3, data4) {
    'use strict';

    var user, users = this.users;
    for (user in users) {
        if (users.hasOwnProperty(user)) {
            if (users[user].socket) {
                users[user].socket.emit(event, data1, data2, data3, data4);
            } else {
                console.log('!!!!!Game notifyAll: se intentaba enviar algo a un socket sin definir');
            }
        }
    }
};

/**
 * ENUM. Almacena los estados en los que se puede encontrar la partida
 * @type {{wait: string, sendInit: string, playHand: string, checkHand: string, checkGame: string, finish: string}}
 */
Game.prototype.states = {
    wait: 'wait',
    sendInit: 'sendInit',
    playHand: 'playHand',
    checkHand: 'checkHand',
    distribute: 'distribute',
    sendTurn: 'sendTurn',
    finish: 'finish'
};

/**
 * Gestiona las acciones que debe realizar la partida en función del estado en el que se encuentra
 */
Game.prototype.handlerState = function () {
    'use strict';
    switch (this.state) {
        case this.states.wait:
            // En este no se debería encontrar nunca, aquí no hay ninguna espera
            break;
        case this.states.sendInit:
            // se cambia a este estado dentro de checkusers, y después de enviar la info, en distribute se espera por primera vez

            // envío el primer turno
            this.sendTurn();

            // establezco el estado a: jugando la mano
            this.state = this.states.playHand;

            // No espero margen, porque ya se espera el tiempo del turno, y al acabar el turno se pasa a playHand
            break;
        case this.states.playHand:
            // Extraigo método solo para no ensuciar este con muchas líneas
            this.playHand();

            // Compruebo si el turno ha vuelto al jugador que ha iniciado la mano
            if (this.turn === this.firstTurn) {
                // establezco el estado de la partida a: comprobando mano
                this.state = this.states.checkHand;

                // Espero el margen antes de entrar en comprobar mano
                this.chrono.init(timeMargin);
            } else {
                // La mano aún no ha terminado, notifico el próximo turno
                this.sendTurn();
            }

            break;
        case this.states.checkHand:

            // Se ha esperado ya unos segundos el crono, por lo que directamente podemos enviar el ganador sin sobrecargar de info.
            this.checkHand();

            // Notifico el ganador de la última mano. Como ya se ha establecido que el siguiente que inicia la próxima mano es el ganador de la anterior, el turno actual apunta al ganador
            this.notifyAll('winnerHand', this.players[this.turn].name);
            this.notifyAll('scores', this.players);

            // Cambio el estado de la partida
            this.state = this.states.sendTurn;

            // Espero el margen antes de entrar en enviar turno
            this.chrono.init(timeMargin);
            break;
        case this.states.sendTurn:

            // Primero compruebo si hay suficientes cartas para todos los jugadores. Si no es el caso, la partida habría terminado.
            if (this.isEnd()) {
                // La partida ha terminado
                this.checkWinner();

                // Establezco el estado de la partida a finalizado
                this.state = this.states.finish;

                // Espero el margen antes de entrar en finish
                this.chrono.init(timeMargin);
            } else {
                this.distributeHand();
                this.state = this.states.distribute;
            }
            break;
        case this.states.distribute:
            this.sendTurn();
            this.state = this.states.playHand;
            break;
        case this.states.finish:
            // Solo queda anunciar al ganador o ganadores, pero solo se debe enviar el nombre
            var i,
                winner,
                winnerNames = [],
                player;

            for (i = 0; i < this.players.length; i++ ) {
                player = this.players[i];
                this.notifyAll('score', player.name, player.score);
            }

            for (i = 0; i < this.winners.length; i++ ) {
                winner = this.winners[i];
                winnerNames.push(winner.name);
            }

            this.notifyAll('winners', winnerNames);

            this.removeUsersGame();

            break;
    }

};

/**
 * Establece el ganador (o ganadores, en caso de empate) de la partida
 */
Game.prototype.checkWinner = function () {
    // Comparo la puntuación de cada jugador

    // Ganadores ( array porque puede ser empate, varios ganadores )
    var player,
        i,
        winners = [this.players[0]];

    for (i = 1; i < this.players.length; i++) {
        player = this.players[i];
        if (player.score > winners[0].score) {
            // reasigno porque debo eliminar a todos los jugadores que estuvieran empatados para añadir al campeón
            winners = [player];
        } else if (player.score === winners[0].score) {
            // lo añado al array de vencedores porque van empate
            winners.push(player);
        }

        // Tiene menos puntuación así que no hago nada
    }

    this.winners = winners;
};

/**
 * Gestiona el estado de jugar una mano de la partida. Va dentro de handlerState,
 * pero se ha extraído para limpiar el código
 */
Game.prototype.playHand = function () {
    //primero, compruebo si el usuario del turno actual, ha jugado la mano que le corresponde

    // recojo el player
    var player = this.players[this.turn],
        card;

    // compruebo si ha tirado
    if (!player.cardPlayed) {
        // no ha tirado

        // lanzamiento automático
        card = player.playCard();

        if (card) {
            // Notifico a todos la carta que ha jugado el usuario
            this.notifyAll('played', player.name, card);
        } else {
            console.log('No ha jugado carta, no debería suceder');
        }
    }

    // Una vez que ha jugado este jugador, cambio el turno al siguiente
    this.nextTurn();
};

/**
 * Cambio el turno al siguiente jugador en el array
 */
Game.prototype.nextTurn = function () {
    'use strict';
    if (this.turn < this.players.length - 1)
        ++this.turn;
    else
        this.turn = 0;
};

/**
 * Comprueba el ganador de una mano cuando esta ha finalizado
 */
Game.prototype.checkHand = function () {
    'use strict';
    var samples = [], i, player, winner;

    // Compruebo si hay jugadores que han jugado cartas del palo de muestra
    for (i = 0; i < this.players.length; i++) {
        player = this.players[i];
        if (player.cardPlayed.suit === this.sample.suit) {
            samples.push(player);
            //console.log(player.name + ' ha jugado muestra: ' + player.cardPlayed);
        }
    }

    // Si hay muestras, compruebo quien tiene la más alta
    if (samples.length > 0) {
        // La primera muestra es la ganadora actual
        winner = samples[0];
        //console.log('Hay muestras, el ganador va siendo: ', winner.name);

        // Se empieza a recorrer a partir del segundo jugador (preparado para más de 2)
        for (i = 1; i < samples.length; i++) {
            player = samples[i];
            if (winner.cardPlayed.num.value < player.cardPlayed.num.value) {
                winner = player;
                //console.log('Hay muestra mayor, el ganador va siendo: ', winner.name);
            }
        }
    } else {
        // No se han jugado cartas de muestra, así que aún no hay ganador

        // La primera carta jugada es la ganadora actual
        winner = this.players[this.firstTurn];

        //console.log('El ganador de la mano momentáneo es: ' + winner.name);

        // Se recorren todos los jugadores, no importa recorrer también al que ya es ganador inicialmente
        for (i = 0; i < this.players.length; i++) {
            player = this.players[i];
            // Se comprueba que la carta sea del palo que se está jugando
            if (player.cardPlayed.suit === winner.cardPlayed.suit) {

                // Se compara la puntuación de ambas cartas
                if (winner.cardPlayed.num.value < player.cardPlayed.num.value) {
                    winner = player;
                    //console.log('Hay mejor carta, el ganador va siendo: ', winner.name);
                }
            }
        }
    }

    // Se añaden las cartas ganadas al jugador, y se limpian las cartas jugadas
    for (i = 0; i < this.players.length; i++) {
        player = this.players[i];

        // se añaden
        winner.cardEarned(player.cardPlayed);

        // se limpian
        player.cardPlayed = undefined;
    }

    // finalmente se establece el turno al jugador que ha ganado
    this.setTurn(winner);
};

/**
 * Establece el turno al jugador enviado, que debe ser el ganador de
 * la última mano
 * @param winner {Player} ganador de la última mano
 */
Game.prototype.setTurn = function (winner) {
    'use strict';
    var index = this.players.indexOf(winner);
    this.turn = index;
    this.firstTurn = index;

    console.log('El jugador que ha ganado la mano es: ' + winner.name + ', por lo tanto el turno se establce a ' + this.players[this.turn].name);
};

/**
 * Envía el turno al jugador que le corresponde, además de iniciar el cronómetro y notificar a todos los jugadores de a quién le corresponde jugar
 */
Game.prototype.sendTurn = function () {
    'use strict';
    var player = this.players[this.turn],
        user = this.users[player.name];
    
    if (user) {
        // compruebo si está online el jugador al que le toca
        if (user.socket.connected) {
            this.chrono.init(timeTurn);
        } else {
            // como está desconectado, se tira en 1 seg
            this.chrono.init(1);
        }
    } else {
        console.log('NO HAY USUARIO EN sendTurn');
    }

    this.notifyAll('turn', this.players[this.turn].name, this.chrono.finishTime);
};

/**
 * Recoge a un jugador de la partida por su nombre
 * @param name nombre del jugador buscado
 * @returns {Player|undefined}
 */
Game.prototype.getPlayer = function (name) {
    'use strict';
    for (var i = 0; i < this.players.length; i++) {
        var player = this.players[i];
        if (player.name == name)
            return player;
    }
    console.error('El player es null, esto no debería ocurrir');
    return undefined;
};

/**
 * Juega una carta si la partida está en el estado correspondiente y el turno es del jugador que desea jugarla
 * @param userName nombre del jugador que realiza la acción
 * @param id índice de la carta que quiere jugar
 */
Game.prototype.play = function (userName, id) {
    'use strict';
    var player = this.getPlayer(userName),
        card;
    if (player) {
        if (this.hasTurn(player)) {
            card = player.playCard(id);
            if (card) {
                // Notifico a todos la carta que ha jugado el usuario
                this.notifyAll('played', userName, card);

                //finalizo el cronómetro
                this.chrono.finish();
            }
        }
    }
};

Game.prototype.hasTurn = function (player) {
    if (player === this.players[this.turn]) {
        if (this.state === this.states.playHand) {
            return true;
        }
    }

    return false;
};

Game.prototype.tryChangeSample = function (userName, id) {
    'use strict';
    var player = this.getPlayer(userName),
        card,
        neccesaryCardId;
    if(this.deck.cards.length > 0) {
        if (player) {
            if (this.hasTurn(player)) {
                card = player.getCard(id);

                // existe la carta que el usuario quiere canjear
                if (card) {

                    // AQUÍ el usuario tiene la carta enviada y tiene el turno

                    if (this.sample.num.value > 5) {

                        // en función del palo de muestra, busco la carta 7 en la baraja
                        switch (this.sample.suit) {
                            case 'espadas':
                                neccesaryCardId = 7;
                                break;
                            case 'bastos':
                                neccesaryCardId = 17;
                                break;
                            case 'oros':
                                neccesaryCardId = 27;
                                break;
                            case 'copas':
                                neccesaryCardId = 37;
                                break;
                        }
                    } else {
                        // compruebo que la muestra es mayor que la carta 2 => value: 1
                        if (this.sample.num.value > 1) {
                            // en función del palo de muestra, busco la carta 2 en la baraja
                            switch (this.sample.suit) {
                                case 'espadas':
                                    neccesaryCardId = 2;
                                    break;
                                case 'bastos':
                                    neccesaryCardId = 12;
                                    break;
                                case 'oros':
                                    neccesaryCardId = 22;
                                    break;
                                case 'copas':
                                    neccesaryCardId = 32;
                                    break;
                            }
                        } else {
                            console.log('La carta de muestra es el 2, esa no se puede cambiar');
                            neccesaryCardId = undefined;
                        }
                    }

                    // si la carta de muesta no es 2, aquí ya se tiene la carta necesaria
                    if (neccesaryCardId) {
                        if (neccesaryCardId === id) {
                            this.changeSample(player, card);
                        }
                    }

                } else {
                    console.log('El player no tiene esa carta en la mano');
                }
            } else {
                console.log('el player no tiene el turno');
            }
        } else {
            console.log('el player no existe');
        }
    }
};

Game.prototype.changeSample = function (player, card) {
    // almaceno la antigua muestra y la elimino de la baraja
    var oldSample = this.deck.cards.shift();

    // elimino la carta de la mano del usuario
    player.removeCard(card.id);

    // añado la nueva muestra al principio de la baraja (que será la última en repartir)
    this.deck.cards.unshift(card);

    // establezco la carta enviada como muestra
    this.sample = card;

    // añado al usuario la que era antes la muestra
    player.cards.push(oldSample);

    // notifico a todos del cambio de la muestra y quien lo ha realizado
    this.notifyAll('change sample', player.name, oldSample, this.sample);
};

/**
 * Comprueba que haya terminado la partida. Esto significa que no quedan
 * cartas en la baraja para poder repartir a todos y que además, ninguno
 * de los jugadores mantiene cartas en sus manos.
 * @returns {boolean}
 */
Game.prototype.isEnd = function () {
    var player,
        i,
        emptyHands = true; // todos los jugadores sin cartas

    // Compruebo si ya no quedan cartas para repartir
    if (!this.hasCards()) {

        // recorro los jugadores
        for (i = 0; i < this.players.length; i++) {
            player = this.players[i];

            // compruebo si al jugador le quedan cartas
            if (player.cards.length > 0) {
                // como le quedan cartas a uno, aún sigue la partida
                emptyHands = false;
            }
        }

        // si no le quedasen cartas a ninguno, la partida se habría acabado
        if (emptyHands)
            return true;
    }

    return false;
};

/**
 * Comprueba si hay suficientes cartas para repartir una mano a los jugadores
 * @returns {boolean}
 */
Game.prototype.hasCards = function () {
    return this.deck.cards.length >= this.players.length;
};

Game.prototype.removeUsersGame = function () {
    var player, i, user;
    /**
     * Los usuarios son los mismos que los jugadores,
     * para coger cada uno de ellos, recorro los players
     * y busco sus nombres en el objeto global de usuarios.
     */
    for (i = 0; i < this.players.length; i++) {
        player = this.players[i];
        user = this.users[player.name];

        if (user) {
            user.game = undefined;
        } else {
            console.log('¡¡!! esto no debería darse - Game.removeUsersGame');
        }

    }
};

Game.prototype.sendMsgGame = function (user, msg) {
    console.log('ha llegado aquí');
    this.notifyAll('msg-game', user.name, msg)
};

module.exports = Game;