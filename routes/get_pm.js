var express = require('express');
var router = express.Router();
var mysql = require('../db');
var aes = require('../aes');

router.post('/', function(req, res){
    if (req.session.user) {

        var data = {
            user: {id: req.session.user.id, f_name: req.session.user.f_name, l_name: req.session.user.l_name},
            member: {id: req.body.m_id, f_name: null, l_name: null},
            output: []
        };

        mysql.connect(res, function(connection){
            connection.query('SELECT f_name, l_name FROM user WHERE id = ?', [data.member.id], function (err, result) {

                if (err){
                    res.sendStatus(500);
                    return;
                }

                data.member.f_name = result[0].f_name;
                data.member.l_name = result[0].l_name;

                connection.query('SELECT id FROM p_list WHERE u_min = ? AND u_max = ?', [Math.min(data.user.id, data.member.id), Math.max(data.user.id, data.member.id)], function (err, result) {
                    if (err){
                        res.sendStatus(500);
                        return;
                    }
                    if (result.length != 0){
                        connection.query('SELECT id, u_id, data, t FROM p_table WHERE p_id = ?', [result[0].id], function (err, result) {
                            connection.release();

                            if (err){
                                res.sendStatus(500);
                                return;
                            }
                            data.output = result;

                            for (var i = 0; i < result.length; i++){
                                data.output[i].data = aes.decrypt(result[i].data);
                            }
                            res.send(JSON.stringify(data));
                        });
                    } else{
                        connection.release();
                        res.send(JSON.stringify(data));
                    }
                });
            });
        });
    } else{
        res.sendStatus(403);
    }
});

module.exports = router;
