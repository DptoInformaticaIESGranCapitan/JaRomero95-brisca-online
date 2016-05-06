var express = require('express');
var router = express.Router();
var connect = require('./../model/connect');
var users = require('./../model/Users');

/* GET home page. */
router.get('/', function (req, res, next) {

    connect('SELECT * FROM wp_users')
        .then(function (value) {
            console.log(value);
            var locals = {
                uno: value,
                dos: 'HOLAAA'
            };
            res.render('index', locals);
        });
});

router.get('/registro', function (req, res, next) {
    res.render('register');
});

router.post('/registro', function (req, res, next) {
    var locals = {};

    var name = req.body.name,
        lastName = req.body.lastName,
        username = req.body.username,
        email = req.body.email,
        date = req.body.date,
        passwd = req.body.passwd,
        passwd2 = req.body.passwd2;


    users.insertUser(name, lastName, username, email, passwd, date)
        .then(function (data) {
            console.log(data);
            res.render('register', locals);
        })
        .fail(function (error) {
            locals.error = 'Error con la base de datos...';
            console.log(error);
            res.render('register', locals);
        });
});

module.exports = router;
