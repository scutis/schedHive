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
            connection.query('SELECT id, u_name, hash, salt, n_name, f_name, l_name FROM user WHERE u_name = ?', req.body.u_name, function(err, result){
                connection.release();

                if (err){
                    res.sendStatus(500);
                    return;
                }

                if (!result.length || hash(req.body.pw, result[0].salt) !== result[0].hash)
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
