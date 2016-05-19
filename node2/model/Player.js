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
}

/**
 * El usuario juega una carta de las que tiene en su mano. Si no se envía el
 * id de la carta, esta se seleccionará automáticamente entre sus cartas.
 * @param id {int} identificador de la carta
 * @returns {boolean|{}} devuelve la carta jugada, o false si falla la operación, cosa que no debería suceder
 */
Player.prototype.playCard = function (id) {
    'use strict';

    // Si no se envía el id, es porque se le ha agotado el turno, así que se elige una carta al azar de su mano
    if (!id) {
        // Índice aleatorio entre las cartas que posee el jugador
        var randomIndex = Math.floor(Math.random() * this.cards.length);

        // Recojo el íd de la carta seleccionada aleatoriamente
        id = this.cards[randomIndex].id;

        console.log(this.name + ' no ha tirado, saca carta aleatoria');
    }

    var card = this.getCard(id),
        index;

    if (card) {
        index = this.cards.indexOf(card);
        if (index === -1){
            console.log('[UNREACHABLE], Player - playCard, la carta no estaba en la baraja');
            return false;
        }

        //elimino de la mano la carta jugada
        this.cards = this.cards.splice(index, 1);

        // la añado como última carta jugada
        this.cardPlayed = card;

        // para notificar el éxito de la operación a la partida
        return card;
    }

    console.log('[UNREACHABLE], Player - playCard, no existe carta');
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
    return undefined;
};

module.exports = Player;