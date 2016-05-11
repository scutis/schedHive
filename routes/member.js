var express = require('express');
var router = express.Router();
var mysql = require('../db');
var hash = require('../sha');

router.post('/', function(req, res){
    if (req.session.user) {

        var data = {
            user: req.session.user.firstName+ " " + req.session.user.lastName,
            member: null,
            messages: null
        };

        mysql.connect(res, function(connection){
                connection.query('SELECT firstName, lastName FROM users WHERE id = ?', [req.body.user], function (err, result) {
                    
                    if (err){
                        res.sendStatus(500);
                        return;
                    }

                    data.member = result[0].firstName+ " "+ result[0].lastName;
                    console.log(data.member);
                    connection.query('SELECT id FROM private WHERE user1 = ? AND user2 = ?', [Math.min(req.session.user.id, req.body.user), Math.max(req.session.user.id, req.body.user)], function (err, result) {
                        if (err){
                            res.sendStatus(500);
                            return;
                        }
                        console.log(result[0].id);
                        if (result.length == 1){
                            connection.query('SELECT * FROM ??', ["p"+result[0].id], function (err, result) {
                                connection.release();

                                if (err){
                                    res.sendStatus(500);
                                    return;
                                }
                                data.messages = result;
                                res.render('member', data);
                            });
                        }else{
                            connection.release();
                            res.render('member', data);
                        }
                    });
                });
        });
    } else{
        res.sendStatus(403);
    }
});

module.exports = router;
