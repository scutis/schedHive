var express = require('express');
var router = express.Router();
var mysql = require('../db');
var aes = require('../aes');


router.post('/', function(req, res){
    if (req.session.user) {

        var sql = 'SELECT * FROM p_table WHERE u_from = ? OR u_to = ? ORDER BY id DESC';

        if (req.body.sel == "unread")
            sql = 'SELECT * FROM p_table WHERE u_to = ? AND u_read = 0 ORDER BY id DESC';

        mysql.connect(res, function(connection){
                connection.query(sql, [req.session.user.id, req.session.user.id], function (err, result) {
                    if (err){
                        res.sendStatus(500);
                        return;
                    }

                    if (result.length == 0){
                        connection.release();
                        res.send(JSON.stringify(result));
                        return;
                    }

                    var memberList = [];
                    var queryNumber = 0;

                    for (var i = 0; i < result.length; i++){
                        var m_id = result[i].u_from;
                        if (m_id == req.session.user.id)
                            m_id = result[i].u_to;

                        if (memberList.indexOf(m_id) <= -1){
                            memberList.push(m_id);
                            result[i].data = aes.decrypt(result[i].data).substring(0, 40) + "...";
                            
                            result[i].t = ('0' + result[i].t.getDate()).slice(-2) + '/' + ('0' + (result[i].t.getMonth()+1)).slice(-2) + '/' + result[i].t.getFullYear() + ' ' +
                                ('0' + (result[i].t.getHours())).slice(-2) + ':' + ('0' + (result[i].t.getMinutes())).slice(-2);

                            result[i].m_id = m_id;
                            connection.query('SELECT f_name, l_name FROM user WHERE id = ?', [m_id], function (err, output) {
                                if (err) {
                                    connection.release();
                                    res.sendStatus(500);
                                    return;
                                }
                                result[queryNumber].f_name = output[0].f_name;
                                result[queryNumber].l_name = output[0].l_name;

                                queryNumber++;

                                if (result.length == queryNumber){
                                    connection.release();
                                    res.send(JSON.stringify(result));
                                }
                            });

                        } else{
                            result.splice(i, 1);
                            i--;
                        }
                    }
                });
        });

    } else{
        res.sendStatus(403);
    }
});

module.exports = router;
