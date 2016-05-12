var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    if (req.session.user){
        //console.log(req.session);
        res.render('index', { u_name: req.session.user.u_name });
    } else{
        res.redirect('/login');
    }
});

module.exports = router;
