var express = require('express');
var router = express.Router();
var mysql = require('../db');
var aes = require('../aes');


router.post('/', function(req, res){
    if (req.session.user) {

        mysql.connect(res, function(connection){
            connection.query('SELECT data, g_id, t_id, t FROM notif WHERE u_id = ? ORDER BY id DESC', [req.session.user.id], function (err, result) {
                connection.release();
                if (err){
                    res.sendStatus(500);
                    return;
                }

                for (var i = 0; i < result.length; i++) {
                    result[i].t = ('0' + result[i].t.getDate()).slice(-2) + '/' + ('0' + (result[i].t.getMonth()+1)).slice(-2) + '/' + result[i].t.getFullYear() + ' ' +
                        ('0' + (result[i].t.getHours())).slice(-2) + ':' + ('0' + (result[i].t.getMinutes())).slice(-2);
                }

                res.send(JSON.stringify(result));
            });
        });

    } else{
        res.sendStatus(403);
    }
});

module.exports = router;
