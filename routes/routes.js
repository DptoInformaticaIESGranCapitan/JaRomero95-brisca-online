var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index');
});

router.get('/registro', function (req, res, next) {
    console.log(req);
    res.render('register');
});

router.post('/registro', function (req, res, next) {
    console.log(req.body);
    res.render('register');
});

module.exports = router;
