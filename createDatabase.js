var mysql = require('mysql');
var random = require('random-gen');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: ''
});

connection.connect();

connection.query('CREATE DATABASE schedHive');
connection.query('USE schedHive');
connection.query('CREATE TABLE users (id INT unsigned PRIMARY KEY AUTO_INCREMENT, username VARCHAR(255), password VARCHAR(255))');

var entry = {
    username: '',
    password: ''
};

for (var i = 0; i < 100; i++){
    entry['username'] = random.lower(6);
    entry['password'] = random.alphaNum(6);

    connection.query('INSERT INTO users SET ?', entry);
}

connection.end();
