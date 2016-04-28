var express = require('express');
var router = express.Router();
var connect = require('./../model/connect');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index');
});

router.get('/registro', function (req, res, next) {
    //console.log(req);
    connect(function (rows){
        console.log(rows);
        res.render('register');
    }, 'SELECT * FROM usuarios');
});

router.post('/registro', function (req, res, next) {
    //console.log(req.body);
    res.render('register');
});

module.exports = router;
