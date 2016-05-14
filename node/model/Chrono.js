function Chrono(game) {
    'use strict';
    this.game = game;
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
        //console.log('Han pasado ' + timeLapsed + ' de ' + time);
        if (timeLapsed > time) {
            clearInterval(that.interval);
            that.game.sendTurn();
        }
    }, 1000);
};

module.exports = Chrono;