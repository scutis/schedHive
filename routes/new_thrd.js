var express = require('express');
var router = express.Router();
var mysql = require('../db');
var aes = require('../aes');

var fs = require('fs');
var mkdirp = require('mkdirp');

router.post('/', function(req, res) {
    if (req.session.user) {

        req.body.s_list = JSON.parse(req.body.s_list);
        req.body.f_list = JSON.parse(req.body.f_list);
        
        var entryThread = {
            g_id: req.body.g_id,
            u_id: req.session.user.id,
            title: req.body.title,
            data: req.body.data,
        };

        mysql.connect(res, function(connection){
            connection.query('INSERT INTO g_thread SET ?', [entryThread], function (err, result) {
                if (err) {
                    connection.release();
                    res.sendStatus(500);
                    return;
                }

                var insertNumber = 0;
                var endQuery = true;
                var endNotif = false;

                connection.query('SELECT u_id FROM g_member WHERE g_id = ?', [req.body.g_id], function (err, output) {

                    if (err) {
                        connection.release();
                        res.sendStatus(500);
                        return;
                    }

                    var entryNotif = [];

                    for (var i = 0; i < output.length; i++){
                        if (output[i].u_id != req.session.user.id){
                            var notif = [output[i].u_id, req.body.g_id, result.insertId, "New thread "+req.body.title];
                            entryNotif.push(notif);
                        }
                    }

                    connection.query('INSERT INTO notif (u_id, g_id, t_id, data) VALUES ?', [entryNotif], function (err) {
                        if (err) {
                            connection.release();
                            res.sendStatus(500);
                            return;
                        }

                        endNotif = true;

                        if ((req.body.s_list.length == 0 && req.body.f_list.length == 0) || (insertNumber == req.body.f_list.length && endQuery)){
                            connection.release();
                            res.sendStatus(200);
                        }
                    });

                });


                if (req.body.f_list.length != 0){

                    mkdirp(__dirname + '/../public/upload/t' + result.insertId, function (err) {
                        if (err){
                            connection.release();
                            res.sendStatus(500);
                            return;
                        }

                        var writeNumber = 0;

                        for (var i = 0; i < req.body.f_list.length; i++) {

                            var dataIndex = req.body.f_list[i].data.indexOf('base64') + 7;
                            var baseData = req.body.f_list[i].data.slice(dataIndex, req.body.f_list[i].data.length);

                            fs.writeFile(__dirname + '/../public/upload/t'+ + result.insertId +'/' + req.body.f_list[i].name, new Buffer(baseData, 'base64'), function (err) {
                                if (err) {
                                    connection.release();
                                    res.sendStatus(500);
                                    return;
                                }

                                connection.query('INSERT INTO t_file SET ?', [{t_id: result.insertId, name: req.body.f_list[writeNumber].name}], function (err) {
                                    if (err) {
                                        connection.release();
                                        res.sendStatus(500);
                                        return;
                                    }

                                    insertNumber++;

                                    if (insertNumber == req.body.f_list.length && endQuery && endNotif){
                                        connection.release();
                                        res.sendStatus(200);
                                    }
                                });

                                writeNumber++;

                            });
                        }
                    });
                }

                if (req.body.s_list.length != 0){

                    endQuery = false;
                    var schedList = [];

                    for (var i = 0; i < req.body.s_list.length; i++){
                        var schedEntry = [result.insertId, parseInt(req.body.s_type), new Date (req.body.s_list[i].from), new Date (req.body.s_list[i].to)];
                        schedList.push(schedEntry);
                    }
                    connection.query('INSERT INTO t_sched (t_id, s_type, s_from, s_to) VALUES ?', [schedList], function (err) {
                        if (err) {
                            connection.release();
                            res.sendStatus(500);
                            return;
                        }

                        endQuery = true;

                        if (insertNumber == req.body.f_list.length && endQuery && endNotif){
                            connection.release();
                            res.sendStatus(200);
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

