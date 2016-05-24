var express = require('express');
var router = express.Router();
var mysql = require('../db');
var aes = require('../aes');

router.post('/', function(req, res){
    if (req.session.user) {

        //Work in progress
        
    } else{
        res.sendStatus(403);
    }
});

module.exports = router;
