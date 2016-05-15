function Chrono(game) {
    'use strict';
    this.game = game;
}

/**
 * Inicia un cronómetro
 * @param time int tiempo en segundos que debe durar el cronómetro
 * @param player Player jugador al cual le afecta el cronómetro
 */
Chrono.prototype.init = function (time, player) {
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

        // Si el jugador ya ha realizado su acción, 'apago' el cronómetro
        if (player.action) {
            clearInterval(that.interval);
        }

        // Si el jugador ha agotado su tiempo, realizo una acción automática
        if (timeLapsed > time) {
            clearInterval(that.interval);
            that.game.autoAction(player);
        }
    }, 1000);
};

module.exports = Chrono;