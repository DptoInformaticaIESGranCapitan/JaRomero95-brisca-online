function Chrono(){}

/**
 * Inicia un cronómetro
 * @param time int tiempo en segundos que debe durar el cronómetro
 * @param callback function función a ejecutar cuando finaliza el tiempo
 */
function init(time, callback){
    var that = this;

    // Si ya había un cronómetro activo, se limpia
    if(this.interval)
        clearInterval(this.interval);

    var init = new Date().getTime();
    this.interval = setInterval(function(){
        var actual = new Date().getTime();
        if( (actual - init ) > time ){
            clearInterval(that.interval);
            callback();
        }
    }, 1000);
};

module.exports = Chrono;