var express = require('express');
var router = express.Router();
var mysql = require('../db');

router.post('/', function(req, res) {
    if (req.session.user) {
        mysql.query('SELECT username FROM users WHERE username LIKE ?', req.body.search.concat("%"), function (err, result) {
            if (err) {
                console.error(err);
                res.send("Error");
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
    } else{
        res.sendStatus(404);
    }
});


module.exports = router;
