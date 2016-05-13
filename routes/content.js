var express = require('express');
var router = express.Router();
var mysql = require('../db');
var aes = require('../aes');

router.post('/', function(req, res){
    if (req.session.user) {

        var input = req.body.href.split("/");
        
        switch(input[1]) {
            case '':

                var param = {
                    f_name: req.session.user.f_name,
                    l_name: req.session.user.l_name
                };
                res.render('home', param);

                break;

            case 'home':

                var param = {
                    f_name: req.session.user.f_name,
                    l_name: req.session.user.l_name
                };
                res.render('home', param);

                break;
            case 'member':

                mysql.connect(res, function(connection){
                    connection.query('SELECT f_name, l_name FROM user WHERE id = ?', [input[2]], function (err, result) {
                        connection.release();
                        if (err){
                            res.sendStatus(500);
                            return;
                        }

                        var param = {
                            member: {f_name: result[0].f_name, l_name: result[0].l_name}
                        };

                        res.render('member', param);
                    });
                });

                break;

            case 'logout':

                req.session.destroy(function(){
                    res.redirect('../login');
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
