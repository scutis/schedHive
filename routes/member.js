var express = require('express');
var router = express.Router();
var mysql = require('../db');

router.post('/', function(req, res){
    if (req.session.user) {

        var data = {
            user: req.session.user.f_name+ " " + req.session.user.l_name,
            u_id: req.session.user.id,
            member: null,
            m_id: req.body.m_id,
            output: null
        };

        mysql.connect(res, function(connection){
                connection.query('SELECT f_name, l_name FROM user WHERE id = ?', [data.m_id], function (err, result) {
                    
                    if (err){
                        res.sendStatus(500);
                        return;
                    }

                    data.member = result[0].f_name+ " "+ result[0].l_name;
                        
                    connection.query('SELECT id, u_id, data, t FROM p_table WHERE u_1 = ? AND u_2 = ?', [Math.min(data.u_id, data.m_id), Math.max(data.u_id, data.m_id)], function (err, result) {
                        connection.release();
                        
                        if (err){
                            res.sendStatus(500);
                            return;
                        }
                        data.output = result;
                        res.render('member', data);
                    });
                });
        });
    } else{
        res.sendStatus(403);
    }
});

module.exports = router;
