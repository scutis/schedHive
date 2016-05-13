var express = require('express');
var router = express.Router();
var mysql = require('../db');
var aes = require('../aes');

router.post('/', function(req, res) {
    if (req.session.user) {
        var entryList = {
            u_min: Math.min(req.session.user.id, req.body.m_id),
            u_max: Math.max(req.session.user.id, req.body.m_id)
        };

        var entryTable = {
            p_id: null,
            u_id: req.session.user.id,
            data: aes.encrypt(req.body.data)
        };

        mysql.connect(res, function(connection){

            connection.query('SELECT id FROM p_list WHERE u_min = ? AND u_max = ?', [entryList.u_min, entryList.u_max], function (err, result) {
                if (err){
                    res.sendStatus(500);
                    return;
                }

                if (result.length != 0){
                    entryTable.p_id = result[0].id;
                    connection.query('INSERT INTO p_table SET ?', entryTable, function (err) {
                        connection.release();
                        if (err){
                            res.sendStatus(500);
                            return;
                        }

                        res.sendStatus(200);
                    });
                } else{
                    connection.query('INSERT INTO p_list SET ?', entryList, function (err, result) {

                        if (err){
                            res.sendStatus(500);
                            return;
                        }
                        entryTable.p_id = result.insertId;
                        connection.query('INSERT INTO p_table SET ?', entryTable, function (err) {
                            connection.release();
                            if (err){
                                res.sendStatus(500);
                                return;
                            }

                            res.sendStatus(200);
                        });
                    });
                }
            });
        });

    } else{
        res.sendStatus(403);
    }
});


module.exports = router;
