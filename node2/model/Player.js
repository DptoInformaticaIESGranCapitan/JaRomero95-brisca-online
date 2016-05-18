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
     * @type {Card}
     */
    this.cardPlayed = undefined;
}

Player.prototype.playCard = function (id) {
    'use strict';
    var card = this.getCard(id),
        index;

    if (card) {
        index = this.cards.indexOf(card);
        if (index === -1){
            console.log('[UNRECHEABLE], Player - playCard, la carta no estaba en la baraja');
            return false;
        }

        //elimino de la mano la carta jugada
        this.cards = this.cards.splice(index, 1);

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
    return undefined;
};

module.exports = Player;