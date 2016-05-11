var express = require('express');
var router = express.Router();
var mysql = require('../db');
var hash = require('../sha');


router.get('/', function(req, res){
    if (!req.session.user)
        res.render('login');
    else
        res.redirect('../');
});

router.post('/', function(req, res){
    if (req.session.user) {
        res.redirect('../');
    } else{
        mysql.connect(res, function(connection){
            connection.query('SELECT * FROM users WHERE username = ?', req.body.username, function(err, result){
                connection.release();

                if (err){
                    res.sendStatus(500);
                    return;
                }

                if (!result.length || hash(req.body.password, result[0].salt) !== result[0].hash)
                    res.send("false");
                else{
                    delete result[0].hash;
                    delete result[0].salt;
                    req.session.user = result[0];
                    res.send("true");
                }
            });
        });
    }
});

module.exports = router;
