var express = require('express');
var router = express.Router();
var mysql = require('../db');

router.post('/', function(req, res) {
    if (req.session.user) {
        var pattern = '%' + mysql.escape(req.body.search) + '%';

        mysql.connect(res, function(connection){
            connection.query('SELECT id, f_name, l_name FROM user WHERE id != ? && CONCAT(f_name, " ", l_name) LIKE ?', [req.session.user.id, pattern], function (err, result) {
                connection.release();

                if (err){
                    res.sendStatus(500);
                    return;
                }
                var output = [];

                for (var i = 0; i < Math.min(result.length, 5); i++)
                    output.push([result[i].id, result[i].f_name, result[i].l_name]);

                res.send(JSON.stringify(output));

            });
        });


    } else{
        res.sendStatus(403);
    }
});


module.exports = router;
