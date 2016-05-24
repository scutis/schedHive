var express = require('express');
var router = express.Router();
var mysql = require('../db');
var aes = require('../aes');

router.post('/', function(req, res) {
    if (req.session.user) {

        req.body.prefList = JSON.parse(req.body.prefList);

        mysql.connect(res, function(connection){
            var entryList = [];

            for (var i = 0; i < req.body.prefList.length; i++){
                var pref = [req.body.t_id, req.session.user.id, req.body.prefList[i]];

                entryList.push(pref);
            }

            connection.query('DELETE FROM t_pref WHERE t_id = ? AND u_id = ?', [req.body.t_id, req.session.user.id], function (err) {
                if (err) {
                    connection.release();
                    res.sendStatus(500);
                    return;
                }

                if (entryList.length != 0){
                    connection.query('INSERT INTO t_pref (t_id, u_id, s_id) VALUES ?', [entryList], function (err) {
                        connection.release();
                        if (err) {
                            res.sendStatus(500);
                            return;
                        }

                        res.sendStatus(200);
                    });
                } else{
                    connection.release();
                    res.sendStatus(200);
                }
            });
        });


    } else{
        res.sendStatus(403);
    }
});


module.exports = router;
