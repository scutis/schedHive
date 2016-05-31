var mysql = require('mysql');
var random = require('random-gen');
var hash = require('./sha');
var aes = require('./aes');
var parseCSV = require('csv-parse');
var fs = require('fs');
var rmdir = require('rmdir');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: ''
});

connection.connect();
connection.query('DROP DATABASE IF EXISTS schedHive');
connection.query('CREATE DATABASE schedHive');
connection.query('USE schedHive');
connection.query('CREATE TABLE data (id INT unsigned PRIMARY KEY AUTO_INCREMENT, user INT unsigned, input TEXT)');

connection.query('CREATE TABLE user (id INT unsigned PRIMARY KEY AUTO_INCREMENT, u_name VARCHAR(20), hash VARCHAR(255), salt VARCHAR(10), n_name VARCHAR(100), f_name VARCHAR(100), l_name VARCHAR(100), email VARCHAR(100), profile TEXT)');

connection.query('CREATE TABLE g_list (id INT unsigned PRIMARY KEY AUTO_INCREMENT, name VARCHAR(255), info VARCHAR(255), t TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)');
connection.query('CREATE TABLE g_member (g_id INT unsigned, u_id INT unsigned, lvl INT unsigned)');
connection.query('CREATE TABLE g_thread (id INT unsigned PRIMARY KEY AUTO_INCREMENT, g_id INT unsigned, u_id INT unsigned, title VARCHAR(255), data TEXT, t TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)');

connection.query('CREATE TABLE t_comment (id INT unsigned PRIMARY KEY AUTO_INCREMENT, t_id INT unsigned, u_id INT unsigned, data TEXT, t TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)');
connection.query('CREATE TABLE t_file (id INT unsigned PRIMARY KEY AUTO_INCREMENT, t_id INT unsigned, name VARCHAR(255))');

connection.query('CREATE TABLE t_sched (id INT unsigned PRIMARY KEY AUTO_INCREMENT, t_id INT unsigned, t_from TIMESTAMP, t_to TIMESTAMP)');
connection.query('CREATE TABLE t_pref (t_id INT unsigned, u_id INT unsigned, s_id INT unsigned)');



connection.query('CREATE TABLE notif (id INT unsigned PRIMARY KEY AUTO_INCREMENT, u_id INT unsigned, g_id INT unsigned, t_id INT unsigned, data VARCHAR(255), t TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)');

connection.query('CREATE TABLE p_table (id INT unsigned PRIMARY KEY AUTO_INCREMENT, u_from INT unsigned, u_to INT unsigned, data TEXT, u_read INT unsigned, t TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)');

rmdir(__dirname + "/public/upload", function (err, dirs, files) {});

fs.readFile(__dirname + '/user_db.csv', {
    encoding: 'utf-8'
}, function(err, csvData) {
    if (err) {
        console.log(err);
    }

    parseCSV(csvData, {}, function(err, output) {

        var User = function (data) {
            this.id = parseInt(data[0]);
            this.n_name = data[1];
            this.l_name = data[2];
            this.f_name = data[3];
            this.email = data[4];
            this.u_name = this.n_name + this.id;
            this.salt = random.alphaNum(6);
            this.hash = hash(this.u_name, this.salt);
            this.profile = "Each member can edit their personal profile (picture, CV, skills, interests)...";
        };

        var userList = [];
        
        for (var i = 1; i < output.length; i++){
            userList.push(new User(output[i]));
        }


        for (var i = 0; i < userList.length; i++)
            connection.query('INSERT INTO user SET ?', userList[i]);
        
        var data_admin = [parseInt(output[output.length - 1]) + 1, "Admin", "Admin", "Admin", "Admin.Admin@testmail.com"];
        var admin = new User(data_admin);
        admin.u_name = "admin";
        admin.hash = hash(admin.u_name, admin.salt);

        var data_mod = [parseInt(output[output.length - 1]) + 2, "Mod", "Mod", "Mod", "Mod.Mod@testmail.com"];
        var mod = new User(data_mod);
        mod.u_name = "mod";
        mod.hash = hash(mod.u_name, mod.salt);

        connection.query('INSERT INTO user SET ?', admin);
        connection.query('INSERT INTO user SET ?', mod);

        connection.end();
    });

});
