var express = require('express');
var router = express.Router();
var mysql = require('../db');

router.post('/', function(req, res) {
    if (req.session.user) {
        var pattern = req.body.search + '%';

        mysql.connect(res, function(connection){
            connection.query('SELECT username FROM users WHERE username LIKE ?', pattern, function (err, result) {
                connection.release();

                if (err){
                    res.sendStatus(500);
                    return;
                }
                
                if (!result.length) {
                    res.send("Suggestions: none");
                }
                else {
                    var output = "Suggestions: ";
                    for (var i = 0; i < result.length; i++) {
                        output += result[i].username + " ";
                    }
                    res.send(output);
                }
            });
        });


    } else{
        res.sendStatus(403);
    }
});


module.exports = router;
