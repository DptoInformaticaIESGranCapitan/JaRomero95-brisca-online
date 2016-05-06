var express = require('express');
var router = express.Router();
var connect = require('./../model/connect');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index');
});

router.get('/registro', function (req, res, next) {
    connect(function (rows) {
        res.render('register');
    }, 'SELECT * FROM usuarios');
});

router.post('/registro', function (req, res, next) {
    var realname = req.body.realname;
    console.log(realname);
    res.render('register');
});

module.exports = router;
