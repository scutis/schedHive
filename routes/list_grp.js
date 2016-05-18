var express = require('express');
var router = express.Router();
var mysql = require('../db');
var aes = require('../aes');

router.post('/', function(req, res){
    if (req.session.user) {

        mysql.connect(res, function(connection){
            connection.query('SELECT g_id FROM g_member WHERE u_id = ?', [req.session.user.id], function (err, result) {

                if (err){
                    connection.release();
                    res.sendStatus(500);
                    return;
                }

                if (result.length == 0) {
                    connection.release();
                    res.send(JSON.stringify(result));
                    return;
                }

                var queryNumber = 0;

                for (var i = 0; i < result.length; i++) {
                    connection.query('SELECT name FROM g_list WHERE id = ?', [result[i].g_id], function (err, output) {
                        if (err) {
                            connection.release();
                            res.sendStatus(500);
                            return;
                        }

                        result[queryNumber].name = output[0].name;
                        queryNumber++;

                        if (result.length == queryNumber) {
                            connection.release();
                            res.send(JSON.stringify(result));
                        }
                    });
                }
            });
        });
    } else{
        res.sendStatus(403);
    }
});

module.exports = router;
