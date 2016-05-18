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

        mysql.connect(res, function(connection){
            connection.query('INSERT INTO g_list SET ?', entryList, function (err, result) {
                if (err) {
                    connection.release();
                    res.sendStatus(500);
                    return;
                }

                var entryMember = [
                    [result.insertId, req.session.user.id, 2]
                ];

                for (var i = 0; i < memberList.length; i++){

                    var member = [result.insertId, memberList[i], 0];

                    entryMember.push(member);
                }

                connection.query('INSERT INTO g_member (g_id, u_id, lvl) VALUES ?', [entryMember], function (err) {
                    connection.release();
                    if (err) {
                        res.sendStatus(500);
                        return;
                    }

                    res.sendStatus(200);
                });
            });
        });


    } else{
        res.sendStatus(403);
    }
});


module.exports = router;

