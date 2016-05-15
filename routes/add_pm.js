var express = require('express');
var router = express.Router();
var mysql = require('../db');
var aes = require('../aes');

router.post('/', function(req, res) {
    if (req.session.user) {

        var entry = {
            u_from: req.session.user.id,
            u_to: req.body.m_id,
            data: aes.encrypt(req.body.data),
            u_read: 0
        };

        mysql.connect(res, function(connection){
            connection.query('INSERT INTO p_table SET ?', entry, function (err) {
                connection.release();
                if (err) {
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
