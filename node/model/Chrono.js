function Chrono(game) {
    'use strict';
    this.game = game;
    this.rest = 0;
    this.initTime = 0;
    this.finishTime = 0;
}

/**
 * Inicia un cronómetro
 * @param time int tiempo en segundos que debe durar el cronómetro
 */
Chrono.prototype.init = function (time) {
    'use strict';
    var that = this;

    this.initTime = new Date().getTime();
    this.finishTime = this.initTime + (time * 1000);

    // Si ya había un cronómetro activo, se limpia
    if (this.interval) {
        clearInterval(this.interval);
    }

    this.interval = setInterval(function () {
        var actual = new Date().getTime(),
            timeLapsed = (actual - that.initTime) / 1000;

        that.rest = time - timeLapsed;
        if (that.rest < 0) {
            clearInterval(that.interval);
            that.game.handlerState();
        }
    }, 500);
};

Chrono.prototype.finish = function () {
    'use strict';
    clearInterval(this.interval);
    this.game.handlerState();
};

module.exports = Chrono;