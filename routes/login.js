var express = require('express');
var router = express.Router();
var mysql = require('../db');
var hash = require('../sha');


router.get('/', function(req, res){
    if (!req.session.user) {
        res.render('login');
    } else{
        res.redirect('../');
    }
});

router.post('/', function(req, res){
    mysql.query('SELECT * FROM users WHERE username = ?', req.body.username, function(err, result){
        if (err){
            console.error(err);
            res.send("Error");
            return;
        }
        if (!result.length){
            console.log("No user found");
            res.send("No user found");
        }
        else{
            if (hash(req.body.password, result[0].salt) === result[0].hash){
                req.session.user = result[0];
                res.redirect('../');
            }
            else{
                console.log("Incorrect password");
                res.send("Incorrect password");
            }
        }
    });
});

module.exports = router;
