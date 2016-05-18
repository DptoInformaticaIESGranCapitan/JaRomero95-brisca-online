function Chrono(game) {
    'use strict';
    this.game = game;
    this.rest = 0;
}

/**
 * Inicia un cronómetro
 * @param time int tiempo en segundos que debe durar el cronómetro
 */
Chrono.prototype.init = function (time) {
    'use strict';
    var that = this,
        init = new Date().getTime();

    // Si ya había un cronómetro activo, se limpia
    if (this.interval) {
        clearInterval(this.interval);
    }

    this.interval = setInterval(function () {
        var actual = new Date().getTime(),
            timeLapsed = (actual - init) / 1000;

        that.rest = time - timeLapsed;
        if (that.rest < 0) {
            clearInterval(that.interval);
            that.game.handlerState();
        }
    }, 1000);
};

Chrono.prototype.finish = function () {
    'use strict';
    clearInterval(this.interval);
};

module.exports = Chrono;