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

                var writeNumber = 0;
                var endQuery = false;

                if (req.body.f_list.length != 0){

                    mkdirp(__dirname + '/../upload/t' + result.insertId, function (err) {
                        if (err){
                            res.sendStatus(500);
                            return;
                        }

                        for (var i = 0; i < req.body.f_list.length; i++) {

                            fs.writeFile(__dirname + '/../upload/t'+ + result.insertId +'/' + req.body.f_list[i].name, req.body.f_list[i].data, function (err) {
                                if (err) {
                                   res.sendStatus(500);
                                    return;
                                }

                                writeNumber++;

                                if (writeNumber == req.body.f_list.length && endQuery){
                                    res.sendStatus(200);
                                }
                            });
                        }
                    });
                }

                var schedList = [];

                for (var i = 0; i < req.body.s_list.length; i++){

                    var schedEntry = [result.insertId, new Date (req.body.s_list[i].from), new Date (req.body.s_list[i].to)];

                    schedList.push(schedEntry);
                }

                if (req.body.s_list.length != 0){
                    connection.query('INSERT INTO t_sched (t_id, t_from, t_to) VALUES ?', [schedList], function (err) {
                        connection.release();
                        if (err) {
                            res.sendStatus(500);
                            return;
                        }

                        endQuery = true;

                        if (writeNumber == req.body.f_list.length && endQuery){
                            res.sendStatus(200);
                        }
                    });
                }

                if (req.body.s_list.length == 0 && req.body.f_list.length == 0){
                    res.sendStatus(200);
                }
            });
        });

    } else{
        res.sendStatus(403);
    }
});


module.exports = router;

