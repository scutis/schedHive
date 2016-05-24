var express = require('express');
var router = express.Router();
var mysql = require('../db');
var aes = require('../aes');

router.post('/', function(req, res) {
    if (req.session.user) {

        var entry = {
            t_id: req.body.t_id,
            u_id: req.session.user.id,
            data: req.body.data
        };

        mysql.connect(res, function(connection){
            connection.query('INSERT INTO t_comment SET ?', entry, function (err) {
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
