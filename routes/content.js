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
                    l_name: req.session.user.l_name
                };
                res.render('home', param);

                break;

            case 'member':

                mysql.connect(res, function(connection){
                    connection.query('SELECT f_name, l_name, profile FROM user WHERE id = ?', [req.body.id], function (err, result) {
                        connection.release();
                        if (err){
                            res.sendStatus(500);
                            return;
                        }
                        
                        

                        var param = {
                            member: {f_name: result[0].f_name, l_name: result[0].l_name, profile: result[0].profile}
                        };

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
                        connection.release();
                        if (err){
                            res.sendStatus(500);
                            return;
                        }

                        var param = {
                            g_id: result[0].id, name: result[0].name, info: result[0].info, t: result[0].t
                        };

                        res.render('group', param);
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
