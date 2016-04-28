var mysql = require('mysql');
var pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : '',
    database        : 'exchange2'
});

function query(callback, sql, params){
    var result = undefined;
    sql = mysql.format(sql, params);
    pool.getConnection(function(err, connection) {
        connection.query(sql, function(err, rows) {
            if(err)
                console.error(err);
            connection.release();
            callback(rows);
        });
    });
}

module.exports = query;