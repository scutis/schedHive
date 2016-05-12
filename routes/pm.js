var express = require('express');
var router = express.Router();
var mysql = require('../db');

router.post('/', function(req, res){
    if (req.session.user) {

        var data = {
            user: {id: req.session.user.id, f_name: req.session.user.f_name, l_name: req.session.user.l_name},
            member: {id: req.body.m_id, f_name: null, l_name: null},
            output: null
        };

        mysql.connect(res, function(connection){
            connection.query('SELECT f_name, l_name FROM user WHERE id = ?', [data.member.id], function (err, result) {

                if (err){
                    res.sendStatus(500);
                    return;
                }

                data.member.f_name = result[0].f_name;
                data.member.l_name = result[0].l_name;

                connection.query('SELECT id, u_id, data, t FROM p_table WHERE u_1 = ? AND u_2 = ?', [Math.min(data.user.id, data.member.id), Math.max(data.user.id, data.member.id)], function (err, result) {
                    connection.release();

                    if (err){
                        res.sendStatus(500);
                        return;
                    }
                    data.output = result;
                    res.send(JSON.stringify(data));
                });
            });
        });
    } else{
        res.sendStatus(403);
    }
});

module.exports = router;
