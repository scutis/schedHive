var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit : 100,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'schedHive'
});

var connect = function(res, callback){
    pool.getConnection(function(err, connection) {
        if(err){
            connection.release();
            res.sendStatus(500);
            return;
        }

        callback(connection);
    });
};

module.exports.connect = connect;
