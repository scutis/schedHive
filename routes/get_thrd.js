var express = require('express');
var router = express.Router();
var mysql = require('../db');
var aes = require('../aes');

router.post('/', function(req, res){
    if (req.session.user) {

        var response = {};

        var endThread = false;
        var endSched = false;
        var endComment = false;
        var endFile = false;
        var endNotif = false;

        mysql.connect(res, function(connection){

            connection.query('DELETE FROM notif WHERE u_id = ? AND t_id = ?', [req.session.user.id, req.body.t_id], function (err, result) {
                if (err) {
                    connection.release();
                    res.sendStatus(500);
                    return;
                }
                
                endNotif = true;

                if (endThread && endSched && endComment && endFile && endNotif){
                    connection.release();
                    res.send(JSON.stringify(response));
                }
            });


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

                    if (endThread && endSched && endComment && endFile && endNotif){
                        connection.release();
                        res.send(JSON.stringify(response));
                    }
                });
            });

            connection.query('SELECT name FROM t_file WHERE t_id = ?', [req.body.t_id], function (err, result) {

                if (err) {
                    connection.release();
                    res.sendStatus(500);
                    return;
                }

                response.file = result;

                endFile = true;

                if (endThread && endSched && endComment && endFile && endNotif){
                    connection.release();
                    res.send(JSON.stringify(response));
                }

            });


            connection.query('SELECT id, s_type, s_from, s_to FROM t_sched WHERE t_id = ?', [req.body.t_id], function (err, result) {

                if (err) {
                    connection.release();
                    res.sendStatus(500);
                    return;
                }

                var queryNumber = 0;

                if (result.length == 0){
                    response.sched = result;
                    endSched = true;

                    if (endThread && endSched && endComment && endFile && endNotif){
                        connection.release();
                        res.send(JSON.stringify(response));
                    }
                }

                for (var i = 0; i < result.length; i++){
                    result[i].s_from = ('0' + result[i].s_from.getDate()).slice(-2) + '/' + ('0' + (result[i].s_from.getMonth()+1)).slice(-2) + '/' + result[i].s_from.getFullYear() + ' ' +
                        ('0' + (result[i].s_from.getHours())).slice(-2) + ':' + ('0' + (result[i].s_from.getMinutes())).slice(-2);

                    result[i].s_to = ('0' + result[i].s_to.getDate()).slice(-2) + '/' + ('0' + (result[i].s_to.getMonth()+1)).slice(-2) + '/' + result[i].s_to.getFullYear() + ' ' +
                        ('0' + (result[i].s_to.getHours())).slice(-2) + ':' + ('0' + (result[i].s_to.getMinutes())).slice(-2);

                    connection.query('SELECT u_id FROM t_pref WHERE s_id = ?', [result[i].id], function (err, output) {
                        if (err) {
                            connection.release();
                            res.sendStatus(500);
                            return;
                        }

                        result[queryNumber].disabled = false;
                        result[queryNumber].u_id = "";

                        result[queryNumber].size = output.length;
                        result[queryNumber].checked = false;

                        for (var i = 0; i < output.length; i++){
                            if (output[i].u_id == req.session.user.id){
                                result[queryNumber].checked = true;
                            }
                        }

                        if (result[queryNumber].s_type == 1 && output.length == 1 && output[0].u_id != req.session.user.id){
                            result[queryNumber].disabled = true;
                            result[queryNumber].u_id = output[0].u_id;
                        }

                        queryNumber++;

                        if (queryNumber == result.length){
                            response.sched = result;
                            endSched = true;

                            if (endThread && endSched && endComment && endFile && endNotif){
                                connection.release();
                                res.send(JSON.stringify(response));
                            }
                        }

                    });
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
                    response.cmt = result;
                    endComment = true;

                    if (endThread && endSched && endComment && endFile && endNotif){
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

                        if (queryNumber == result.length){
                            response.cmt = result;
                            endComment = true;

                            if (endThread && endSched && endComment && endFile && endNotif){
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
