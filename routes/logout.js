var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    if (req.session.user) {
        req.session.destroy(function(){
            res.redirect('../login');
        });
    } else {
        res.redirect('../login');
    }
});

module.exports = router;
