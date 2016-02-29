var express = require('express');
var router = express.Router();
var mysql = require('../db');
var aes = require('../aes');

router.post('/', function(req, res) {
    if (req.session.user) {

        var entry = {
            user: req.session.user.id,
            input: aes.encrypt(req.body.data)
        };

        mysql.query('INSERT INTO data SET ?', entry, function (err) {
            if (err) {
                console.error(err);
                res.send("Error");
                return;
            }
        });

        mysql.query('SELECT input FROM data WHERE user = ?', entry.user, function (err, result) {
            if (err) {
                console.error(err);
                res.send("Error");
                return;
            }
            if (!result.length) {
                res.send("No stored data");
            }
            else {
                var output = "Stored data: ";
                for (var i = 0; i < result.length; i++) {
                    output += "<p>Data "+ i + ": " + aes.decrypt(result[i].input) + "</p>";
                }
                res.send(output);
            }
        });

    } else{
        res.sendStatus(404);
    }
});


module.exports = router;
