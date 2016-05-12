function ArrayProperties(name){
    return {
        1: new Property('Calle Lauria', 6000, 3000, 200, 1000, 3000, 9000, 16000, 25000, 5000, Groups.darkBlue),
        3: new Property('Calle Rosellón', 6000, 3000, 400, 2000, 6000, 18000, 32000, 45000, 5000, Groups.darkBlue),
        5: new Property('Estación Ferrocarriles Catalanes', 20000, 10000, undefined, 2500, 5000, 10000, 20000, undefined, undefined, Groups.station),
        6: new Property('Calle Marina', 10000, 5000, 600, 3000, 9000, 27000, 40000, 55000, 5000, Groups.gray),
        8: new Property('Calle Urgel', 10000, 5000, 600, 3000, 9000, 27000, 40000, 55000, 5000, Groups.gray),
        9: new Property('Calle Consejo de Ciento', 12000, 6000, 800, 4000, 10000, 30000, 45000, 60000, 5000, Groups.gray),
        11: new Property('Calle Muntaner', 14000, 7000, 1000, 5000, 15000, 45000, 62500, 75000, 10000, Groups.purple),
        12: new Property('Compañía de Electricidad', 15000, 7500, undefined, 400, 1000, undefined, undefined, undefined, undefined, Groups.companies),
        13: new Property('Calle Aribau', 14000, 7000, 1000, 5000, 15000, 45000, 62500, 75000, 10000, Groups.purple),
        14: new Property('Avda. Infanta Carlota', 16000, 8000, 1200, 6000, 18000, 50000, 70000, 90000, 10000, Groups.purple),
        15: new Property('Apeadero Paseo de Gracia', 20000, 10000, undefined, 2500, 5000, 10000, 20000, undefined, undefined, Groups.station),
        16: new Property('Paseo de San Juan', 18000, 9000, 1400, 7000, 20000, 55000, 75000, 95000, 10000, Groups.orange),
        18: new Property('Calle Diputación', 18000, 9000, 1400, 7000, 20000, 55000, 75000, 95000, 10000, Groups.orange),
        19: new Property('Calle Aragón', 20000, 10000, 1600, 8000, 22000, 60000, 80000, 100000, 10000, Groups.orange),
        21: new Property('Plaza Urquinaona', 22000, 11000, 1800, 9000, 25000, 70000, 87500, 105000, 15000, Groups.red),
        23: new Property('Calle Fontanella', 22000, 11000, 1800, 9000, 25000, 70000, 87500, 105000, 15000, Groups.red),
        24: new Property('Ronda de San Pedro', 24000, 12000, 2000, 10000, 30000, 75000, 92500, 110000, 15000, Groups.red),
        25: new Property('Estación de Francia', 20000, 10000, undefined, 2500, 5000, 10000, 20000, undefined, undefined, Groups.station),
        26: new Property('Ramblas', 26000, 13000, 2200, 11000, 33000, 80000, 97500, 115000, 15000, Groups.yellow),
        27: new Property('Vía Layetana', 26000, 13000, 2200, 11000, 33000, 80000, 97500, 115000, 15000, Groups.yellow),
        28: new Property('Compañía de Aguas', 15000, 7500, undefined, 400, 1000, undefined, undefined, undefined, undefined, Groups.companies),
        29: new Property('Plaza de Cataluña', 28000, 14000, 2200, 12000, 36000, 85000, 102500, 120000, 15000, Groups.yellow),
        31: new Property('Avd. Puerta del Ángel', 30000, 15000, 2600, 13000, 39000, 90000, 110000, 127500, 20000, Groups.green),
        32: new Property('Calle Pelayo', 30000, 15000, 2600, 13000, 39000, 90000, 110000, 127500, 20000, Groups.green),
        34: new Property('Vía Augusta', 32000, 16000, 2800, 15000, 45000, 100000, 120000, 140000, 20000, Groups.green),
        35: new Property('Estación de Sants', 20000, 10000, undefined, 2500, 5000, 10000, 20000, undefined, undefined, Groups.station),
        37: new Property('Calle Balmes', 35000, 17500, 3500, 17500, 50000, 110000, 130000, 150000, 20000, Groups.ligthBlue),
        39: new Property('Paseo de Gracia', 40000, 20000, 5000, 20000, 60000, 140000, 170000, 200000, 20000, Groups.ligthBlue)
    };
}

function Property(name, buyPrice, mortPrice, unbuiltPrice, price1House, price2House, price3House, price4House, priceHotel, buildingPrice, group){
    this.name = name;
    this.mort = false;
    this.houses = 0;

    // TODO función de pagar en base al grupo elegido
    this.payFunction = undefined;

    this.owner = undefined; // usuario al que pertenece la carta
}

Property.prototype.pay = function(user, roll){
    // TODO compruebo que no esté hipotecada
    // A la función de pagar ese tipo de propiedad, le envía el objeto en sí, el usuario, y la tirada por si la necesita
    this.payFunction(this, user, roll);
};

function payNormal(that, user){
    //TODO
}

function payStation(that, user){
    //TODO
}

function payCompany(that, user, roll){
    //TODO
}

var Groups = {
    darkBlue: 'darkBlue',
    gray: 'gray',
    purple: 'purple',
    orange: 'orange',
    red: 'red',
    yellow: 'yellow',
    green: 'green',
    ligthBlue: 'ligthBlue',
    station: 'station',
    companies: 'companies'
};

module.exports = ArrayProperties;