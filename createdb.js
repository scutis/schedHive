var mysql = require('mysql');
var random = require('random-gen');
var hash = require('./sha');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: ''
});

connection.connect();

connection.query('DROP DATABASE schedHive');
connection.query('CREATE DATABASE schedHive');
connection.query('USE schedHive');
connection.query('CREATE TABLE data (id INT unsigned PRIMARY KEY AUTO_INCREMENT, user INT unsigned, input TEXT)');
connection.query('CREATE TABLE user (id INT unsigned PRIMARY KEY AUTO_INCREMENT, u_name VARCHAR(20), hash VARCHAR(255), salt VARCHAR(10), f_name VARCHAR(100), l_name VARCHAR(100))');

connection.query('CREATE TABLE groups (id INT unsigned PRIMARY KEY AUTO_INCREMENT, info VARCHAR(255), t TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)');
connection.query('CREATE TABLE member (g_id INT unsigned, u_id INT unsigned, lvl INT unsigned, t TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)');

connection.query('CREATE TABLE p_table (id INT unsigned PRIMARY KEY AUTO_INCREMENT, u_1 INT unsigned, u_2 INT unsigned, u_id INT unsigned, data TEXT, t TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)');
connection.query('CREATE TABLE g_table (id INT unsigned PRIMARY KEY AUTO_INCREMENT, g_id INT unsigned, u_id INT unsigned, r_id INT unsigned, data TEXT, t TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)');


var Data = function (user1, user2, user_id, content) {
    this.u_1 = user1;
    this.u_2 = user2;
    this.u_id = user_id;
    this.data = content;
};

var dataList = [];

dataList.push(new Data(48, 49, 48, "Hello World"));

connection.query('INSERT INTO p_table SET ?', dataList[0]);



var User = function (firstName, lastName) {
    this.f_name = firstName;
    this.l_name = lastName;
    this.u_name = random.lower(6);
    this.salt = random.alphaNum(6);
    this.hash = hash(this.u_name, this.salt);
};

var userList = [];
userList.push(new User("Alexandra", "Rouhana"));
userList.push(new User("Emad", "Khan"));
userList.push(new User("Hemang", "Rishi"));
userList.push(new User("Quentin", "McGaw"));
userList.push(new User("Raweed", "Khatri"));
userList.push(new User("Vijay", "Gami"));
userList.push(new User("Lorraine", "Choi"));
userList.push(new User("Pieter-Jan", "Fabry"));
userList.push(new User("Qiyang", "Chen"));
userList.push(new User("Sanjana", "George"));
userList.push(new User("Sol-Uh", "Park"));
userList.push(new User("Tanat", "Sanpaveeravong"));
userList.push(new User("Claudia", "Sola Sanz"));
userList.push(new User("Inigo", "Torres Uribe Echebarria"));
userList.push(new User("Iulian", "Ionascu Fometescu"));
userList.push(new User("Mark", "Zolotas"));
userList.push(new User("Niccolo'", "Lamanna"));
userList.push(new User("Omar", "Faqir"));
userList.push(new User("Hao", "Ding"));
userList.push(new User("Izzat", "Khairuzzaman"));
userList.push(new User("Lizhang", "Lin"));
userList.push(new User("Pei", "Tu"));
userList.push(new User("Tong", "Wu"));
userList.push(new User("Tong", "Yang"));
userList.push(new User("Jian", "Lim"));
userList.push(new User("Jiaxi", "Sun"));
userList.push(new User("Liyangyi", "Yu"));
userList.push(new User("Lorenzo", "Scutigliani"));
userList.push(new User("Tianxiao", "Zhao"));
userList.push(new User("Yu", "Lee"));
userList.push(new User("Alexandre", "Benoit"));
userList.push(new User("David", "Angelov"));
userList.push(new User("Niclas", "Nicolae"));
userList.push(new User("Oloruntoba", "Adewuyi"));
userList.push(new User("Oloruntobi", "Adewuyi"));
userList.push(new User("Thomas", "Hobson"));
userList.push(new User("Alexandre", "Hadj-Chaib"));
userList.push(new User("Charitos", "Charitou"));
userList.push(new User("Dimitrios", "Kosyvas"));
userList.push(new User("Georgios", "Karafokas"));
userList.push(new User("Stylianos", "Hartoutsios"));
userList.push(new User("Alexander", "Gallo"));
userList.push(new User("Muhammed", "Ali Ahmed"));
userList.push(new User("Pascal", "Loose"));
userList.push(new User("Shreegovind", "Patwar"));
userList.push(new User("Tim", "Raulf-Pick"));
userList.push(new User("Raymond", "Williams"));

for (var i = 0; i < userList.length; i++)
    connection.query('INSERT INTO user SET ?', userList[i]);

var admin = new User("Admin", "Admin");
admin.u_name = "admin";
admin.hash = hash(admin.u_name, admin.salt);

var mod = new User("Mod", "Mod");
mod.u_name = "mod";
mod.hash = hash(mod.u_name, mod.salt);

connection.query('INSERT INTO user SET ?', admin);
connection.query('INSERT INTO user SET ?', mod);

connection.end();
