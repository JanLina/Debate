var express = require('express');
var router = express.Router();
var user = require('./controllers/user');
var competition = require('./controllers/competition');
var debate = require('./controllers/debate');

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
router.get('/debate', function(req, res, next) {
  res.render('debate', { title: '辩论赛' });
});


// user
router.post('/debate/initComp', debate.initComp);
router.post('/user/register', user.register);
router.post('/user/login', user.login);
router.post('/user/changeIntro', user.changeIntro);

// debate
router.post('/debate/publish', debate.publish);
router.post('/debate/changeSide', debate.changeSide);
router.post('/debate/getResult', debate.getResult);

// home
// router.get('/home/hot', competition.getHot);


// test
router.get('/manage', function(req, res, next) {
  res.render('manage', { title: '后台管理' });
});
router.get('/m', function(req, res, next) {
  res.render('m', { title: 'WebSocket测试' });
});
router.post('/competition/create', competition.create);
router.post('/competition/createT', competition.createT);

router.post('/competition/getList', competition.getList);
router.get('/competition/getRecommend', competition.getRecommend);
router.get('/competition/getHot', competition.getHot);
router.get('/competition/getNew', competition.getNew);
router.post('/competition/getDetail', competition.getDetail);

module.exports = router;

