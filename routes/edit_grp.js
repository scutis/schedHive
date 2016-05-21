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
            connection.query('UPDATE g_list SET ? WHERE id = ?', [entryList, req.body.g_id], function (err, result) {
                if (err) {
                    connection.release();
                    res.sendStatus(500);
                    return;
                }

                var entryMember = [
                    [req.body.g_id, req.session.user.id, 2]
                ];

                for (var i = 0; i < memberList.length; i++){

                    var member = [req.body.g_id, memberList[i], memberLevel[i]];
                    entryMember.push(member);
                }

                connection.query('DELETE FROM g_member WHERE g_id = ?', [req.body.g_id], function (err) {
                    if (err) {
                        connection.release();
                        res.sendStatus(500);
                        return;
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
        });


    } else{
        res.sendStatus(403);
    }
});


module.exports = router;

