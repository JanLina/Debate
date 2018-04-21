var express = require('express');
var router = express.Router();
var user = require('./controllers/user');

// base
router.get('/', function(req, res, next) {
  res.render('login', { title: '登录页' });
});
router.get('/login', function(req, res, next) {
  res.render('login', { title: '登录页' });
});
router.get('/register', function(req, res, next) {
  res.render('register', { title: '注册页' });
});


// user
router.post('/user/register', user.create);
router.post('/user/login', user.find);

module.exports = router;

