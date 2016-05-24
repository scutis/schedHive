var express = require('express');
var router = express.Router();
var mysql = require('../db');
var aes = require('../aes');

router.post('/', function(req, res){
    if (req.session.user) {

        var response = {
            title: null,
            data: null,
            t: null,
            u_id: null,
            f_name: null,
            l_name: null,
            sched: [],
            cmt: []
        };

        var endThread = false;
        var endSched = false;
        var endComment = false;

        mysql.connect(res, function(connection){
            connection.query('SELECT u_id, title, data, t FROM g_thread WHERE id = ?', [req.body.t_id], function (err, result) {

                if (err) {
                    connection.release();
                    res.sendStatus(500);
                    return;
                }

                response.title = result[0].title;
                response.data = result[0].data;
                response.u_id = result[0].u_id;
                response.t = ('0' + result[0].t.getDate()).slice(-2) + '/' + ('0' + (result[0].t.getMonth()+1)).slice(-2) + '/' + result[0].t.getFullYear() + ' ' +
                    ('0' + (result[0].t.getHours())).slice(-2) + ':' + ('0' + (result[0].t.getMinutes())).slice(-2);

                connection.query('SELECT f_name, l_name FROM user WHERE id = ?', [result[0].u_id], function (err, result) {

                    if (err) {
                        connection.release();
                        res.sendStatus(500);
                        return;
                    }

                    response.f_name = result[0].f_name;
                    response.l_name = result[0].l_name;

                    endThread = true;

                    if (endThread && endSched && endComment){
                        connection.release();
                        res.send(JSON.stringify(response));
                    }
                });
            });


            connection.query('SELECT id, t_from, t_to FROM t_sched WHERE t_id = ?', [req.body.t_id], function (err, result) {

                if (err) {
                    connection.release();
                    res.sendStatus(500);
                    return;
                }

                for (var i = 0; i < result.length; i++){
                    result[i].t_from = ('0' + result[i].t_from.getDate()).slice(-2) + '/' + ('0' + (result[i].t_from.getMonth()+1)).slice(-2) + '/' + result[i].t_from.getFullYear() + ' ' +
                        ('0' + (result[i].t_from.getHours())).slice(-2) + ':' + ('0' + (result[i].t_from.getMinutes())).slice(-2);

                    result[i].t_to = ('0' + result[i].t_to.getDate()).slice(-2) + '/' + ('0' + (result[i].t_to.getMonth()+1)).slice(-2) + '/' + result[i].t_to.getFullYear() + ' ' +
                        ('0' + (result[i].t_to.getHours())).slice(-2) + ':' + ('0' + (result[i].t_to.getMinutes())).slice(-2);
                }

                response.sched = result;
                endSched = true;

                if (endThread && endSched && endComment){
                    connection.release();
                    res.send(JSON.stringify(response));
                }
            });

            connection.query('SELECT u_id, data, t FROM t_comment WHERE t_id = ?', [req.body.t_id], function (err, result) {

                if (err) {
                    connection.release();
                    res.sendStatus(500);
                    return;
                }

                var queryNumber = 0;
                
                if (result.length == 0){
                    endComment = true;

                    if (endThread && endSched && endComment){
                        connection.release();
                        res.send(JSON.stringify(response));
                    }
                }

                for (var i = 0; i < result.length; i++){
                    result[i].t = ('0' + result[i].t.getDate()).slice(-2) + '/' + ('0' + (result[i].t.getMonth()+1)).slice(-2) + '/' + result[i].t.getFullYear() + ' ' +
                        ('0' + (result[i].t.getHours())).slice(-2) + ':' + ('0' + (result[i].t.getMinutes())).slice(-2);

                    connection.query('SELECT f_name, l_name FROM user WHERE id = ?', [result[i].u_id], function (err, output) {
                        if (err) {
                            connection.release();
                            res.sendStatus(500);
                            return;
                        }
                        result[queryNumber].f_name = output[0].f_name;
                        result[queryNumber].l_name = output[0].l_name;

                        queryNumber++;

                        if (result.length == queryNumber){
                            response.cmt = result;
                            endComment = true;

                            if (endThread && endSched && endComment){
                                connection.release();
                                res.send(JSON.stringify(response));
                            }
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
