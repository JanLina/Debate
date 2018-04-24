var express = require('express');
var router = express.Router();
var user = require('./controllers/user');
var competition = require('./controllers/competition');

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
router.get('/home', function(req, res, next) {
  res.render('home', { title: '首页' });
})


// user
router.post('/user/register', user.create);
router.post('/user/login', user.find);

// home
// router.get('/home/hot', competition.getHot);


// test
router.get('/manage', function(req, res, next) {
  res.render('manage', { title: '后台管理' });
});
router.post('/competition/create', competition.create);
router.post('/competition/getList', competition.getList);
router.get('/competition/getRecommend', competition.getRecommend);
router.get('/competition/getHot', competition.getHot);
router.get('/competition/getNew', competition.getNew);
router.post('/competition/detail', competition.getDetail);

module.exports = router;

