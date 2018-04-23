var querystring = require('querystring');
var models = require('../models');
var User = models.User;

// 创建User
exports.create = function (req, res, next) {
    User.find({ phone: req.body.phone}, function(err, result) {
        if (err) {
        } else if (result.length) {  // 手机号已注册
            res.send({ code: 0, data: { message: '该手机号已注册' } });
        } else {
            var user = new User({
                phone: req.body.phone,
                password: req.body.password,
                userName: '',
                icon: '',
                role: 0,
                sex: 0,
                numOfLikes: 0,
                comments: [],
                numOfMvp: 0,
                level: 0,
                numOfCompetition: 0,
                numOfWin: 0,
                competitions: { toStart: [], completed: [] },
                following: [],
                followers: [],
                collections: []
            });
            user.save(function (err, result) {
                if (err) {
                    res.send({code: 0, data: err});
                } else {
                    res.send({code: 1, data: result});
                }
            });     
        }
    });
};
// 查找User
exports.find = function (req, res, next) {
    var info = {
        phone: req.body.phone,
        password: req.body.password
    };
    User.find(info, function(err, result) {
        if (err) {
            res.send({code: 0, data: err});
        } else if (!result.length) {
            res.send({code: 0, data: { message: '该手机号未注册或密码错误' }});
        } else {
            res.send({code: 1, data: result});
        }
    });
};
