var express = require('express');
var router = express.Router();
var mysql = require('../db');
var aes = require('../aes');

router.post('/', function(req, res){
    if (req.session.user) {
        
        switch(req.body.page) {
            case '':
            case 'home':

                var param = {
                    f_name: req.session.user.f_name,
                    l_name: req.session.user.l_name,
                    n_name: req.session.user.n_name
                };
                res.render('home', param);

                break;

            case 'member':

                mysql.connect(res, function(connection){
                    connection.query('SELECT n_name, f_name, l_name, email, profile FROM user WHERE id = ?', [req.body.id], function (err, result) {
                        connection.release();
                        if (err){
                            res.sendStatus(500);
                            return;
                        }

                        var param = {};
                        param.member = result[0];

                        res.render('member', param);
                    });
                });

                break;
            case 'pm':
                
                res.render('pm', {selected: req.body.id});

                break;
            case 'group':

                mysql.connect(res, function(connection){

                    connection.query('SELECT * FROM g_list WHERE id = ?', [req.body.id], function (err, result) {
                        if (err){
                            connection.release();
                            res.sendStatus(500);
                            return;
                        }

                        var param = {
                            user_id: req.session.user.id, g_id: result[0].id, name: result[0].name, info: result[0].info, t: result[0].t
                        };

                        connection.query('SELECT id FROM g_thread WHERE g_id = ? ORDER BY id DESC', [req.body.id], function (err, result) {
                            if (err) {
                                connection.release();
                                res.sendStatus(500);
                                return;
                            }

                            param.threadList = [];
                            
                            for (var i = 0; i < result.length; i++){
                                param.threadList.push(result[i].id);
                            }

                            connection.query('SELECT u_id, lvl FROM g_member WHERE g_id = ? ORDER BY lvl DESC', [param.g_id], function (err, result) {

                                if (err){
                                    connection.release();
                                    res.sendStatus(500);
                                    return;
                                }

                                param.memberList = result;

                                var queryNumber = 0;

                                for (var i = 0; i < param.memberList.length; i++) {
                                    if(param.memberList[i].u_id == req.session.user.id)
                                        param.user_lvl = param.memberList[i].lvl;

                                    connection.query('SELECT f_name, l_name FROM user WHERE id = ?', [param.memberList[i].u_id], function (err, output) {
                                        if (err) {
                                            connection.release();
                                            res.sendStatus(500);
                                            return;
                                        }

                                        param.memberList[queryNumber].name = output[0].f_name + " " + output[0].l_name;
                                        queryNumber++;

                                        if (param.memberList.length == queryNumber) {
                                            connection.query('DELETE FROM notif WHERE u_id = ? AND g_id = ? AND t_id = 0', [req.session.user.id, req.body.id], function (err, result) {
                                                if (err) {
                                                    connection.release();
                                                    res.sendStatus(500);
                                                    return;
                                                }

                                                connection.release();
                                                res.render('group', param);
                                                
                                            });
                                        }
                                    });
                                }
                            });
                        });
                    });
                });

                break;
            case 'profile':

                mysql.connect(res, function(connection){
                    connection.query('SELECT u_name, n_name, f_name, l_name, email, profile FROM user WHERE id = ?', [req.session.user.id], function (err, result) {
                        connection.release();
                        if (err){
                            res.sendStatus(500);
                            return;
                        }

                        var param = result[0];

                        res.render('profile', param);
                    });
                });
                
                break;
            default:
                res.sendStatus(404);
        }

    } else{
        res.sendStatus(403);
    }
});

module.exports = router;
