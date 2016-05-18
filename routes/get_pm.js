var express = require('express');
var router = express.Router();
var mysql = require('../db');
var aes = require('../aes');

router.post('/', function(req, res){
    if (req.session.user) {

        var data = {
            u: {f_name: req.session.user.f_name, l_name: req.session.user.l_name},
            m: {f_name: null, l_name: null},
            o: []
        };

        mysql.connect(res, function(connection){
            connection.query('SELECT f_name, l_name FROM user WHERE id = ?', [req.body.m_id], function (err, result) {

                if (err){
                    connection.release();
                    res.sendStatus(500);
                    return;
                }

                data.m.f_name = result[0].f_name;
                data.m.l_name = result[0].l_name;

                connection.query('SELECT u_from, data, t, u_read FROM p_table WHERE (u_from = ? AND u_to = ?) OR (u_from = ? AND u_to = ?)', [req.session.user.id, req.body.m_id, req.body.m_id, req.session.user.id], function (err, result) {
                    if (err){
                        connection.release();
                        res.sendStatus(500);
                        return;
                    }
                    
                    if (result.length != 0) {
                        data.o = result;

                        for (var i = 0; i < result.length; i++) {
                            data.o[i].data = aes.decrypt(result[i].data);
                            data.o[i].t = ('0' + result[i].t.getDate()).slice(-2) + '/' + ('0' + (result[i].t.getMonth()+1)).slice(-2) + '/' + result[i].t.getFullYear() + ' ' +
                                ('0' + (result[i].t.getHours())).slice(-2) + ':' + ('0' + (result[i].t.getMinutes())).slice(-2);
                        }

                        connection.query('UPDATE p_table SET u_read = 1 WHERE u_from = ? AND u_to = ? AND u_read = 0', [req.body.m_id, req.session.user.id], function (err) {
                            connection.release();
                            if (err){
                                console.log(err);
                            }
                        });
                    } else
                        connection.release();

                    res.send(JSON.stringify(data));

                });
            });
        });
    } else{
        res.sendStatus(403);
    }
});

module.exports = router;
