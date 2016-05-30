var express = require('express');
var router = express.Router();
var mysql = require('../db');
var aes = require('../aes');
var hash = require('../sha');
var random = require('random-gen');

router.post('/', function(req, res) {
    if (req.session.user) {

        mysql.connect(res, function(connection){

            var user = {
                n_name: req.body.n_name,
                email: req.body.email,
                profile: req.body.profile
            };

            if (req.body.password != ""){
                user.salt = random.alphaNum(6);
                user.hash = hash(req.body.password, user.salt);
            }

            connection.query('UPDATE user SET ? WHERE id = ?', [user, req.session.user.id], function (err) {
                connection.release();
                if (err){
                    res.sendStatus(500);
                    return;
                }

                res.sendStatus(200);
            });
        });


    } else{
        res.sendStatus(403);
    }
});


module.exports = router;
