var querystring = require('querystring');
var EventProxy = require('eventproxy');
var models = require('../models');
var Competition = models.Competition;
var User = models.User;
var Record = models.Record;
var Statement = models.Statement;

var ws = require("nodejs-websocket")
ws.connect('ws://localhost:3000/', function() {
    console.log('connect success');
});

// 比赛开始后，初始化
exports.initComp = function(req, res, next) {
    var compId = req.body.compId;
    // 初始化record
    // 比赛开始后，才决定一二三辩，将一二三辩按顺序存到record
    var proDebaters = req.body.proDebaters.split(',');
    var conDebaters = req.body.conDebaters.split(',');
    var record = new Record({
        competitionId: compId,
        proDebaters: proDebaters,
        conDebaters: conDebaters,
        debateStatements: [],
        freeDebateStatements: [],
        proEnd: -1,
        conEnd: -1,
        proVote: 0,
        conVote: 0,
        changeSide: [],
        winner: -1,
        mvpUserId: -1,
        bestStatement: -1,
        comments: []
    });
    record.save(function (err, result) {
        if (err) {
            res.send({code: 0, data: err});
        } else {
            var newRecord = result;
            // 更新比赛的record的id
            Competition.update({_id: compId}, {recordId: newRecord._id}, {upsert: true}, function(err, result) {
                if (err) {
                    res.send({code: 0, data: err});
                } else {
                    res.send({code: 1, compId: compId, recordId: newRecord._id, data: newRecord});
                }
            });
        }
    });
};

// 辩手发表言论【参数：用户id，言论类型（陈述statement、反驳refute、结辩end），阶段（立论point、自由辩论free）】
exports.publish = function(req, res, next) {
    var {compId, userId, stand, type, stage, content} = req.body;
    var updateInfo = {};
    type = type === 'statement' ? 0 : (type === 'refute' ? 1 : 2);
    var statement = new Statement({
        competitionId: compId,
        type: type,
        userId: userId,
        content: content
    });
    statement.save(function(err, result) {
        if (err) {
            res.send({code: 0, data: err});
        } else {
            var newStatement = result;
            if (type === 2) {  // 结辩
                updateInfo = stand === 1 ? {  // 判断是正方结辩还是反方结辩
                    proEnd: newStatement._id
                } : {
                    conEnd: newStatement._id
                };
            } else if (stage === 'point') {  // 立论阶段的陈述
                updateInfo = {
                    $push: {debateStatements: {userId: userId, statementId: newStatement._id}}
                };
            } else {  // 自由辩论阶段
                updateInfo = {
                    $push: {freeDebateStatements: {userId: userId, statementId: newStatement._id}}
                };
            }
            Competition.findOne({_id: compId}, {recordId: 1}, function(err, result) {
                if (err) {
                    res.send({code: 0, data: err});
                } else {
                    var recordId = result.recordId;
                    Record.update({_id: recordId}, updateInfo, {upsert: true}, function(err, result) {  // 更新辩论赛对应的比赛记录
                        if (err) {
                            res.send({code: 0, data: err});
                        } else {
                            res.send({code: 1, recordId: recordId, statementId: newStatement._id, data: result});
                        }
                    });
                }
            });
        }   
    });
};

// 观众改变立场
exports.changeSide = function(req, res, next) {
    var compId = req.body.compId;
    var debater = req.body.debater || '';  // 在哪位辩手发言的时候，改变立场
    var debaterSide = req.body.debaterSide;  // 该辩手是正方还是反方（1表示正方，2表示反方）
    var side = req.body.side;  // 观众转到哪个立场（1表示正方，2表示反方）
    var change = debaterSide === side ? 'attract' : 'leave';
    var updateInfo = {};
    Competition.findOne({_id: compId}, {recordId: 1}, function(err, result) {
        if (err) {
            res.send({code: 0, data: err});
        } else {
            var recordId = result.recordId;
            Record.findOne({_id: recordId}, {proVote: 1, conVote: 1, changeSide: 1}, function(err, result) {
                if (err) {
                    res.send({code: 0, data: err});
                } else {
                    // 若前端传来了辩手的id，说明此次投票是在立论阶段进行的，即要计入MVP的评选
                    if (debater) {
                        var changeSide = JSON.parse(JSON.stringify(result.changeSide));  // 深拷贝
                        var isExist = false;
                        changeSide.forEach(function(value, index) {
                            if (value.userId === debater) {
                                value[change] += 1;
                                isExist = true;
                            }
                        });
                        // 若changeSide中还没有该辩手的相关记录，新建一个元素插入数组
                        if (!isExist) {
                            if (change === 'attract') {
                                changeSide.push({userId: debater, attract: 1, leave: 0});
                            } else {
                                changeSide.push({userId: debater, attract: 0, leave: 1});
                            }
                        }
                        // 观众改变立场记录
                        updateInfo.$set = {changeSide: changeSide};
                    }
                    // 正方或反方票数加一
                    if (+side === 1) {
                        updateInfo.$inc = {proVote: 1, conVote: -1};
                    } else {
                        updateInfo.$inc = {proVote: -1, conVote: 1};
                    }
                    Record.update({_id: recordId}, updateInfo, {upsert: true}, function(err, result) {
                        // ...
                        if (err) {
                            res.send({code: 0, data: err});
                        } else {
                            res.send({code: 1, compId: compId, recordId: recordId, updateInfo: updateInfo, data: result});
                        }
                    });
                }
            });
        }
    });
};

// 观众评论
exports.publishComment = function(req, res, next) {
    
};

// 获取比赛结果
exports.getResult = function(req, res, next) {
    var ep = new EventProxy();
    var compId = req.body.compId;
    var compResult = {};
    Competition.findOne({_id: compId}, {recordId: 1}, function(err, result) {
        if (err) {
            res.send({code: 0, data: err});
        } else {
            var recordId = result.recordId;
            Record.findOne({_id: recordId}, {proVote: 1, conVote: 1, changeSide: 1, freeDebateStatements: 1}, function(err, result) {
                if (err) {
                    res.send({code: 0, data: err});
                } else {
                    ep.all('mvpUser', 'bestStatement', function(mvpUser, bestStatement, proDebaters) {
                        compResult.mvpUser = mvpUser;
                        compResult.bestStatement = bestStatement;
                        // 更新record
                        var updateInfo = {
                            $set: {winner: compResult.winner, mvpUserId: compResult.mvpUser.id, bestStatementId: compResult.bestStatementId}
                        };
                        Record.update({_id: recordId}, updateInfo, {upsert: true}, function(err, result) {
                            if (err) {
                                res.send({code: 0, data: err});
                            } else {
                                res.send({code: 1, compId: compId, recordId: recordId, compResult: compResult, data: result});
                            }
                        });
                    });
                    // 计算胜方
                    compResult.winner = result.proVote === result.conVote ? 0 : (result.proVote > result.conVote ? 1 : 2);
                    // 计算MVP
                    var mvpUserId = 0;
                    var mvpCalc = 0;
                    var temp = 0;
                    result.changeSide.forEach(function(value, index) {
                        temp = value.attract - value.leave;
                        mvpUserId = mvpCalc < temp ? value.userId : mvpUserId;
                        mvpCalc = mvpCalc < temp ? temp : mvpCalc;
                    });
                    compResult.mvpCalc = mvpCalc;
                    User.findOne({_id: mvpUserId}, {userName: 1, icon: 1}, function(err, result) {
                        if (err) {
                            res.send({code: 0, data: err});
                        } else {
                            var mvpUser = {
                                id: mvpUserId,
                                userName: result.userName,
                                icon: result.icon
                            }
                            ep.emit('mvpUser', mvpUser);
                        }
                    });
                    // 获取最佳言论
                    compResult.bestStatementId = result.freeDebateStatements[2].statementId;  // 最佳言论暂时random
                    Statement.findOne({_id: compResult.bestStatementId}, {userId: 1, content: 1}, function(err, result) {
                        if (err) {
                            res.send({code: 0, data: err});
                        } else {
                            var bestStatement = {userId: result.userId, content: result.content};
                            ep.emit('bestStatement', bestStatement);
                        }
                    });
                }
            });
        }
    });
};
