var querystring = require('querystring');
var EventProxy = require('eventproxy');
var models = require('../models');
var Competition = models.Competition;
var User = models.User;
var Record = models.Record;
var Statement = models.Statement;


// 比赛开始后，初始化
exports.initComp = function(req, res, next) {
    var compId = req.body.compId;
    var proDebaters;
    var conDebaters;
    var newRecord;
    // var proDebaters = req.body.proDebaters.split(',');
    // var conDebaters = req.body.conDebaters.split(',');
    Competition.findOne({_id: compId}, {proDebaters: 1, conDebaters: 1}, function(err, result) {
        proDebaters = result.proDebaters;
        conDebaters = result.conDebaters;
        // 这里对proDebaters和conDebaters进行排序
        // ...
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
                newRecord = result;
                // 更新比赛的record的id
                Competition.update({_id: compId}, {recordId: newRecord._id, proDebaters: proDebaters, conDebaters: conDebaters}, {upsert: true}, function(err, result) {
                    if (err) {
                        res.send({code: 0, data: err});
                    } else {
                        res.send({code: 1, compId: compId, recordId: newRecord._id, newRecord: newRecord});
                    }
                });
            }
        });
    });
};

progress = function() {
    // 在publish中调用这个方法
    // 辩手发表言论后，客户端发来通知，隔5s后，广播“下一轮发言开始”
    // 参数：next: true，客户端只要告诉服务端要进入下一阶段了，具体进入哪一阶段由服务端返回给客户端，competition需要一个字段来控制比赛进程

}

// 辩手发表言论【参数：用户id，言论类型（陈述statement、反驳refute、结辩end），阶段（立论point、自由辩论free）】
// exports.publish = function(req, res, next) {
exports.publish = function(params) {
    var {compId, userId, upsert, stand, type, stage, content} = params;
    var updateInfo = {};
    var statement = new Statement({
        competitionId: compId,
        type: type,
        userId: userId,
        content: content
    });
    // 保存言论
    statement.save(function(err, result) {
        // ...
        if (err) {
            // res.send({code: 0, data: err});
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
            // 更新record
            Competition.findOne({_id: compId}, {recordId: 1}, function(err, result) {
                // 更新辩论赛对应的比赛记录
                var recordId = result.recordId;
                Record.update({_id: recordId}, updateInfo, {upsert: true}, function(err, result) {});
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
            // 观众投票
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
                        // 更新信息
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
// exports.publishComment = function(req, res, next) {
    
// };

// 获取比赛结果
exports.getResultT = function(req, res, next) {
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
                    ep.all('mvpUser', 'bestStatement', function(mvpUser, bestStatement) {
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
                    // 计算获胜方，1表示正方，2表示反方
                    compResult.winner = result.proVote === result.conVote ? 0 : (result.proVote > result.conVote ? 1 : 2);
                    // 计算并获取MVP
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
                    // 计算并获取最佳言论
                    var bestStatementId = 0;
                    var attract = 0;
                    result.debateStatements.forEach(function(value, index) {
                        if (value.attract > attract) {
                            attract = value.attract;
                            bestStatementId = value.statementId;
                        }
                    });
                    compResult.bestStatementId = bestStatementId;
                    Statement.findOne({_id: compResult.bestStatementId}, {userId: 1, content: 1}, function(err, result) {
                        if (err) {
                            res.send({code: 0, data: err});
                        } else {
                            var bestStatement = {userId: result.userId, content: result.content};
                            ep.emit('bestStatement', bestStatement);
                        }
                    });

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

// 获取比赛结果 —— Test
exports.getResult = function(req, res, next) {
    var r = {
        winner: 1, // 正方
        mvpUser: {
            stand: 2,
            order: 1,
            userName: '不会挖洞的土拨鼠',
            icon: 'http://www.fzlqqqm.com/uploads/allimg/20150306/201503062251092154.jpg'
        },
        bestStatement: {
            stand: 1,
            order: 0,
            stage: 'free',
            num: 2,
            userName: '成长中的樱桃树',
            icon: 'http://imgsrc.baidu.com/imgad/pic/item/bba1cd11728b4710ff77bfeac9cec3fdfc0323bf.jpg'
        }
    };
    res.send({code: 1, data: r});
};