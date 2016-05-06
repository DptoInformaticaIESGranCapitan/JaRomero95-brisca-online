var mysql = require('mysql');
var Q = require('q');

var pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : '',
    database        : 'wreck-them'
});

function exec(sql, params){
    params = params || [];
    var deferred = Q.defer();
    sql = mysql.format(sql, params);
    pool.getConnection(function(err, connection) {
        // FIXME no se ha podido conectar con la base de datos
        connection.query(sql, function(err, rows) {
            if(err)
                deferred.reject(err);
            connection.release();
            deferred.resolve(rows);
        });
    });
    return deferred.promise;
}

module.exports = exec;