var express = require('express');
var router = express.Router();
var mysql = require('../db');
var aes = require('../aes');

router.post('/', function(req, res) {
    if (req.session.user) {

        var entryList = {
            name: req.body.name,
            info: req.body.desc
        };

        var memberList = JSON.parse(req.body.m_list);
        var memberLevel = JSON.parse(req.body.m_lvl);

        mysql.connect(res, function(connection){
            connection.query('INSERT INTO g_list SET ?', [entryList], function (err, result) {
                if (err) {
                    connection.release();
                    res.sendStatus(500);
                    return;
                }

                var entryMember = [
                    [result.insertId, req.session.user.id, 2]
                ];

                for (var i = 0; i < memberList.length; i++){

                    var member = [result.insertId, memberList[i], memberLevel[i]];

                    entryMember.push(member);
                }

                connection.query('INSERT INTO g_member (g_id, u_id, lvl) VALUES ?', [entryMember], function (err) {
                    if (err) {
                        res.sendStatus(500);
                        return;
                    }

                    var entryNotif = [];

                    for (var i = 0; i < memberList.length; i++){

                        var notif = [memberList[i], result.insertId, 0, "Added to group "+req.body.name];

                        entryNotif.push(notif);
                    }

                    connection.query('INSERT INTO notif (u_id, g_id, t_id, data) VALUES ?', [entryNotif], function (err) {
                        connection.release();
                        if (err) {
                            res.sendStatus(500);
                            return;
                        }

                        res.sendStatus(200);
                    });
                });

            });
        });


    } else{
        res.sendStatus(403);
    }
});


module.exports = router;

