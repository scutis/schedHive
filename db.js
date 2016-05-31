var mysql = require('mysql');

/*
var pool = mysql.createPool({
    connectionLimit : 100,
    host: 'sql8.freemysqlhosting.net',
    port: '3306',
    user: 'sql8121762',
    password: 'yDTMjHzTbM',
    database: 'sql8121762'
});
*/
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

var escape = function(str) {
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
        switch (char) {
            case "\0":
                return "\\0";
            case "\x08":
                return "\\b";
            case "\x09":
                return "\\t";
            case "\x1a":
                return "\\z";
            case "\n":
                return "\\n";
            case "\r":
                return "\\r";
            case "\"":
            case "'":
            case "\\":
            case "%":
                return "\\"+char;
        }
    });
};

module.exports.connect = connect;
module.exports.escape = escape;
