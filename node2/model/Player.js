function Player(name) {
    'use strict';

    /**
     * Nombre del jugador
     */
    this.name = name;

    /**
     * Cartas del jugador, máximo 3
     * @type {Array}
     */
    this.cards = [];

    /**
     * Almacena la última carta jugada
     * @type {{}}
     */
    this.cardPlayed = undefined;

    this.cardsEarned = [];

    /**
     * @type {number} puntuación total
     */
    this.score = 0;
}

/**
 * El usuario juega una carta de las que tiene en su mano. Si no se envía el
 * id de la carta, esta se seleccionará automáticamente entre sus cartas.
 * @param id {int} identificador de la carta
 * @returns {boolean|{}} devuelve la carta jugada, o false si falla la operación, cosa que no debería suceder
 */
Player.prototype.playCard = function (id) {
    'use strict';
    var card,
        index,
        randomIndex;


    // Si no se envía el id, es porque se le ha agotado el turno, así que se elige una carta al azar de su mano
    if (id === undefined) {
        // Índice aleatorio entre las cartas que posee el jugador
        randomIndex = Math.floor(Math.random() * this.cards.length);

        // Recojo el íd de la carta seleccionada aleatoriamente
        id = this.cards[randomIndex].id;

        console.log(this.name + ' no ha tirado, saca carta aleatoria');
    }

    card = this.getCard(id);

    if (card) {
        index = this.cards.indexOf(card);
        if (index === -1){
            console.log('[UNREACHABLE], Player - playCard, la carta no estaba en la baraja');
            return false;
        }

        //elimino de la mano la carta jugada
        this.cards.splice(index, 1);

        // la añado como última carta jugada
        this.cardPlayed = card;

        // para notificar el éxito de la operación a la partida
        return card;
    }

    return false;
};

Player.prototype.getCard = function (id) {
    'use strict';
    var i, card;
    for (i = 0; i < this.cards.length; i++) {
        card = this.cards[i];
        if (card.id === id){
            return card;
        }
    }

    console.log('[UNRECHEABLE], Player - getCard, no se ha encontrado la carta');
    console.log('La carte era id: ' + id + ' y el usuario tiene: ');
    console.log(this.cards);
    return undefined;
};

Player.prototype.removeCard = function (card) {
    'use strict';
    var index = this.cards.indexOf(card);
    if (index === -1){
        console.log('[UNREACHABLE], Player - removeCard, la carta no estaba en la baraja');
    }

    //elimino de la mano la carta
    this.cards.splice(index, 1);
};

Player.prototype.cardEarned = function (card) {
    'use strict';

    // Añado la carta, aunque esto es innecesario actualmente
    this.cardsEarned.push(card);

    // Sumo la puntuación al jugador
    this.score += card.num.points;

};

module.exports = Player;