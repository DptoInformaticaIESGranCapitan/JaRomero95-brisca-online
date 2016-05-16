function Deck() {
    'use strict';
    this.cards = [
        {suit: this.suits.espadas, num: this.nums.n1},
        {suit: this.suits.espadas, num: this.nums.n2},
        {suit: this.suits.espadas, num: this.nums.n3},
        {suit: this.suits.espadas, num: this.nums.n4},
        {suit: this.suits.espadas, num: this.nums.n5},
        {suit: this.suits.espadas, num: this.nums.n6},
        {suit: this.suits.espadas, num: this.nums.n7},
        {suit: this.suits.espadas, num: this.nums.n8},
        {suit: this.suits.espadas, num: this.nums.n9},
        {suit: this.suits.espadas, num: this.nums.n10},

        {suit: this.suits.bastos, num: this.nums.n1},
        {suit: this.suits.bastos, num: this.nums.n2},
        {suit: this.suits.bastos, num: this.nums.n3},
        {suit: this.suits.bastos, num: this.nums.n4},
        {suit: this.suits.bastos, num: this.nums.n5},
        {suit: this.suits.bastos, num: this.nums.n6},
        {suit: this.suits.bastos, num: this.nums.n7},
        {suit: this.suits.bastos, num: this.nums.n8},
        {suit: this.suits.bastos, num: this.nums.n9},
        {suit: this.suits.bastos, num: this.nums.n10},

        {suit: this.suits.oros, num: this.nums.n1},
        {suit: this.suits.oros, num: this.nums.n2},
        {suit: this.suits.oros, num: this.nums.n3},
        {suit: this.suits.oros, num: this.nums.n4},
        {suit: this.suits.oros, num: this.nums.n5},
        {suit: this.suits.oros, num: this.nums.n6},
        {suit: this.suits.oros, num: this.nums.n7},
        {suit: this.suits.oros, num: this.nums.n8},
        {suit: this.suits.oros, num: this.nums.n9},
        {suit: this.suits.oros, num: this.nums.n10},

        {suit: this.suits.copas, num: this.nums.n1},
        {suit: this.suits.copas, num: this.nums.n2},
        {suit: this.suits.copas, num: this.nums.n3},
        {suit: this.suits.copas, num: this.nums.n4},
        {suit: this.suits.copas, num: this.nums.n5},
        {suit: this.suits.copas, num: this.nums.n6},
        {suit: this.suits.copas, num: this.nums.n7},
        {suit: this.suits.copas, num: this.nums.n8},
        {suit: this.suits.copas, num: this.nums.n9},
        {suit: this.suits.copas, num: this.nums.n10}
    ];

    // hay que barajar bien ;D
    this.shuffle();
    this.shuffle();
    this.shuffle();
}

Deck.prototype.suits = {
    espadas: 'espadas',
    bastos: 'bastos',
    oros: 'oros',
    copas: 'copas'
};

Deck.prototype.nums = {
    n1: {
        name: 'As',
        points: 11,
        value: 10 // me
    },
    n2: {
        name: 'Dos',
        points: 0,
        value: 1
    },
    n3: {
        name: 'Tres',
        points: 10,
        value: 9
    },
    n4: {
        name: 'Cuatro',
        points: 0,
        value: 2
    },
    n5: {
        name: 'Cinco',
        points: 0,
        value: 3
    },
    n6: {
        name: 'Seis',
        points: 0,
        value: 4
    },
    n7: {
        name: 'Siete',
        points: 0,
        value: 5
    },
    n8: {
        name: 'Sota',
        points: 2,
        value: 6
    },
    n9: {
        name: 'Caballo',
        points: 3,
        value: 7
    },
    n10: {
        name: 'Rey',
        points: 4,
        value: 8
    }
};

Deck.prototype.shuffle = function () {
    'use strict';
    var array = this.cards,
        currentIndex = array.length,
        temporaryValue,
        randomIndex;

    while (0 !== currentIndex) {

        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
};

module.exports = Deck;