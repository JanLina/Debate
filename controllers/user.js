var querystring = require('querystring');
var EventProxy = require('eventproxy');
var models = require('../models');
var User = models.User;
var Competiton = models.Competiton;

// 获取User信息（关注的人/关注我的人）
// var getUserInfo = function(userId, filter) {
//     if (Object.prototype.toString.call(userId) === '[object Array]') {
//         User.find({_id: {$in: userId}}, filter, function(err, result) {
//             return err ? null : result;
//         });
//     } else {
//         User.findOne({_id: userId}, filter, function(err, result) {
//             return err ? null : result;
//         });
//     }
// };
// 获取辩论赛（即将参加的/参加过的/收藏的）
var getCompInfo = function(compIds, filter) {
    Competiton.find({_id: {$in: compIds}}, filter, function(err, result) {
        if (err) {
            return null;
        } else {
            result.forEach(function(comp, index) {
                // 获取辩手头像、昵称
                var pro = getUserInfo(comp.proDebaters, {icon: 1, userName: 1});
                var con = getUserInfo(comp.conDebaters, {icon: 1, userName: 1});
                // 获取主持人头像、昵称
                var emcee = getUserInfo(comp.emceeId, {icon: 1, userName: 1});
                // 判断是否已收藏
                var collected = user.collections.indexOf(comp._id) !== -1;
                comp.proDebaters = pro;
                comp.conDebaters = con;
                comp.emcee = emcee;
                comp.collected = collected;
            });
            return result;
        }
    });
}
// 创建User
exports.register = function (req, res, next) {
    User.find({ phone: req.body.phone}, function(err, result) {
        if (err) {
        } else if (result.length) {  // 手机号已注册
            res.send({ code: 0, data: { message: '该手机号已注册' } });
        } else {
            var user = new User({
                phone: req.body.phone,
                password: req.body.password,
                userName: '',
                intro: '',
                icon: '',
                role: 0,
                sex: 0,
                numOfLike: 0,
                comments: [],
                numOfMvp: 0,
                level: 0,
                numOfCompetition: 0,
                numOfWin: 0,
                competition: { toStart: [], completed: [] },
                followings: [],
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
exports.login = function (req, res, next) {
    var info = {
        // phone: req.body.phone,
        userName: req.body.userName,
        password: req.body.password
    };
    User.findOne(info, function(err, result) {
        if (err) {
            res.send({code: 0, data: err});
        } else if (!result) {
            res.send({code: 0, data: { message: '该用户未注册或密码错误' }});
        } else {
            res.send({code: 1, data: result});
        }
    });
};
// 获取用户信息（进入个人信息页面）
exports.getInfo = function (req, res, next) {
    var userId = req.body.id;
    var data = null;
    var completed = [];
    var user = null;
    User.find({ _id: userId }, {phone: 0, password: 0, followers: 0, followings: 0, collections: 0, comments: 0}, function(err, result) {
        if (err) {
            res.send({code: 0, data: err});
        } else {
            user = result;
            if (user.role === 1) {  // 若该用户为辩手，获取其“即将参加的辩论赛”
                user.competition.toStart = getCompInfo(user.competition.toStart, {record: 0, votes: 0, clicks: 0, createdAt: 0});
                delete user.competition.completed;
            } else {
                delete user.competition;
            }
            res.send({code: 1, data: user});
        }
    });
};
// 获取用户参加过的辩论赛
exports.getCompleted = function(req, res, next) {
    var userId = req.body.id;
    User.find({ _id: userId }, function(err, result) {
        if (err) {
            res.send({code: 0, data: err});
        } else {
            var data = getCompInfo(result.competition.completed, {record: 0, votes: 0, clicks: 0, createdAt: 0});
            res.send({code: 1, data: data});
        }
    });
};
// 获取关注的人
exports.getFollowings = function(req, res, next) {
    var userId = req.body.id;
    User.find({ _id: userId }, function(err, result) {
        if (err) {
            res.send({code: 0, data: err});
        } else {
            var data = getUserInfo(result.followings, {icon: 1, userName: 1});
            res.send({code: 1, data: data});
        }
    });
};
// 获取关注我的人
exports.getFollowers = function(req, res, next) {
    var userId = req.body.id;
    User.find({ _id: userId }, function(err, result) {
        if (err) {
            res.send({code: 0, data: err});
        } else {
            var data = getUserInfo(result.followers, {icon: 1, userName: 1});
            // 判断我是否关注了他
            if (data.length) {
                data.forEach(function(user, index, followings) {
                    if (result.followings.indexOf(user._id) !== -1) {
                        user.follow = true;
                    } else {
                        user.follow = false;
                    }
                });
            }
            res.send({code: 1, data: data});
        }
    });
};
// 获取收藏
exports.getCollections = function(req, res, next) {
    var userId = req.body.id;
    User.find({ _id: userId }, function(err, result) {
        if (err) {
            res.send({code: 0, data: err});
        } else {
            var data = getCompInfo(result.collections, {record: 0, votes: 0, clicks: 0, createdAt: 0});
            res.send({code: 1, data: data});
        }
    });
};
// 修改个人简介
exports.changeIntro = function(req, res, next) {
    var userId = req.body.id;
    var newIntro = req.body.intro;
    User.update({_id: userId}, {intro: newIntro}, {upsert: true}, function(err, result) {
        if (err) {
            res.send({code: 0, data: err});
        } else {
            res.send({code: 1, data: result});
        }
    });
}
// 修改密码
exports.changePassword = function(req, res, next) {
    var userId = req.body.id;
    var newPassword = req.body.password;
    User.update({_id: userId}, {password: newPassword}, {upsert: true}, function(err, result) {
        if (err) {
            res.send({code: 0, data: err});
        } else {
            res.send({code: 1, data: result});
        }
    });
}
// 修改头像
exports.changeIcon = function(req, res, next) {
    var userId = req.body.id;
    var newIcon = req.body.icon;
    User.update({_id: userId}, {icon: newIcon}, {upsert: true}, function(err, result) {
        if (err) {
            res.send({code: 0, data: err});
        } else {
            res.send({code: 1, data: result});
        }
    });
}
// 关注用户

// 取消关注用户

