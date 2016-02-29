var mysql = require('mysql');
var random = require('random-gen');
var hash = require('./sha');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: ''
});

connection.connect();

connection.query('CREATE DATABASE schedHive');
connection.query('USE schedHive');
connection.query('CREATE TABLE data (id INT unsigned PRIMARY KEY AUTO_INCREMENT, user INT unsigned, input TEXT)');
connection.query('CREATE TABLE users (id INT unsigned PRIMARY KEY AUTO_INCREMENT, username VARCHAR(255), hash VARCHAR(255), salt VARCHAR(255), password VARCHAR(255))');

var entry = {
    username: '',
    hash: '',
    salt: '',
    password: ''
};

for (var i = 0; i < 100; i++){
    entry['username'] = random.lower(6);
    entry['password'] = random.alphaNum(6);
    entry['salt'] = random.alphaNum(6);
    entry['hash'] = hash(entry['password'], entry['salt']);

    connection.query('INSERT INTO users SET ?', entry);
}

connection.end();
