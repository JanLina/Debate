var querystring = require('querystring');
var EventProxy = require('eventproxy');
var models = require('../models');
var Competition = models.Competition;
var Record = models.Record;
var User = models.User;

function calcDate(gap) {
    var dateOfToday = Date.now()
    var dayOfToday = (new Date().getDay() + 7 - 1) % 7;
    return new Date(dateOfToday + (gap - dayOfToday) * 1000 * 60 * 60 * 24);
}
function getZero(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
}

// 创建辩题
exports.create = function (req, res, next) {
    var competition = new Competition({
        title: req.body.title,
        status: req.body.status,
        votes: req.body.votes,
        clicks: req.body.clicks,
        createdAt: req.body.createdAt,
        proDebaters: req.body.proDebaters.split(','),
        conDebaters: req.body.conDebaters.split(',')
        // status: 0,
        // votes: 0,
        // clicks: 0,
        // createdAt: Date.now()
    });
    competition.save(function (err, result) {
        if (err) {
            res.send({code: 0, data: err});
        } else {
            res.send({code: 1, data: result});
        }
    }); 
}
// 获取本周热点（上周投票量）
exports.getHot = function (req, res, next) {
    // 筛选出创建时间为上周的，再根据上周投票量进行排
    var lastMonday = calcDate(-7);
    var lastTuesday = calcDate(-6);
    var start = getZero(lastMonday);
    var end = getZero(lastTuesday);
    Competition.find({createdAt: {$gt: start, $lt: end}}).sort({'votes': -1}).exec(function(err, result) {
        if (err) {
            res.send({code: 0, data: err});
        } else {    
            res.send({code: 1, start: start, end: end, data: result});
        }
    });
};
// 获取榜单（点击量），首页一次只展示3个榜单辩题，点击“换一换”，按顺序展示接下来的榜单
// 可选时间范围：上周、近3月、本年、所有
exports.getList = function (req, res, next) {
    var timeRange = req.body.timeRange;
    var currentPage = req.body.currentPage;
    var pageCount = timeRange === '3' ? 20 : 3;
    var findCondition = null;
    var start;
    // if (isNaN(+currentPage)) {
    //     res.send({code:0, data: {message: '页数不得为非数字'}});
    //     return false;
    // }
    if (timeRange === '0') {  // 上周
        var lastMonday = calcDate(-7);
        start = getZero(lastMonday);
    } else if (timeRange === '1') {  // 近三月
        start = new Date();  
        start.setMonth(start.getMonth()-3);
    } else if (timeRange === '2') {  // 本年
        var today = new Date();
        start = new Date(today.getFullYear(), 0, 1, 0, 0, 0); 
    }
    if (timeRange === '3') {  // 所有
        findCondition = {};
    } else {
        findCondition = {createdAt: {$gt: start}};
    }
    Competition.find(findCondition).sort({'clicks': -1}).exec(function(err, result) {
        if (err) {
            res.send({code: 0, data: err});
        } else {
            var r = result.splice((currentPage - 1) * pageCount, pageCount);
            res.send({code: 1, data: r, start: start, currentPage: currentPage});
        }
    });
};
// 获取推荐
exports.getRecommend = function (req, res, next) {
    var total = 0;
    var skip = 0;
    Competition.find({}, function(err, result) {
        total = result.length;
    });
    skip = Math.round(Math.random() * (total / 3));
    Competition.find({}).skip(skip).limit(3).exec(function(err, result) {
        if (err) {
            res.send({code: 0, data: err});
        } else {
            res.send({code: 1, data: result});
        }
    });
};
// 新辩题立场投票，一次性返回所有下周的新辩题
exports.getNew = function (req, res, next) {
    var monday = calcDate(0);
    var tuesday = calcDate(1);
    var start = getZero(monday);
    var end = getZero(tuesday);
    Competition.find({createdAt: {$gt: start, $lt: end}}, function(err, result) {
        if (err) {
            res.send({code: 0, data: err});
        } else {    
            res.send({code: 1, start: start, end: end, data: result});
        }
    });
};
// 进入/回顾辩论赛
exports.getDetail = function (req, res, next) {
    var ep = new EventProxy();
    var compId = req.body.compId;
    var comp = null;
    Competition.findOne({_id: compId}, function(err, result) {
        if (err) {
            res.send({code: 0, compId: compId, data: err});
        } else {
            comp = result;
            ep.all('getRecord', 'getConDebaters', 'getProDebaters', function(record, conDebaters, proDebaters) {
                comp.record = record;
                comp.conDebaters = conDebaters;
                comp.proDebaters = proDebaters;
                res.send({code: 1, compId: compId, data: comp});
            });
            // 若比赛已结束，获取比赛记录
            if (comp.status === 2) {
                Record.findOne({_id: comp.record}, function(err, result) {
                    if (err) {
                        ep.emit('getRecord', null);
                    } else {
                        ep.emit('getRecord', result);
                    }
                });
            } else {
                ep.emit('getRecord', null);
            }
            // 获取正方辩手
            if (comp.proDebaters.length) {
                User.find({_id: {$in: comp.proDebaters}}, {userName: 1, icon: 1}, function(err, result) {
                    if (err) {
                        ep.emit('getProDebaters', []);
                    } else {
                        ep.emit('getProDebaters', result);
                    }
                });
            } else {
                ep.emit('getProDebaters', []);
            }
            // 获取反方辩手
            if (comp.conDebaters.length) {
                User.find({_id: {$in: comp.conDebaters}}, {userName: 1, icon: 1}, function(err, result) {
                    if (err) {
                        ep.emit('getConDebaters', []);
                    } else {
                        ep.emit('getConDebaters', result);
                    }
                });
            } else {
                ep.emit('getConDebaters', []);
            }
        }
    });
};
// 收藏辩论赛

// 取消收藏辩论赛