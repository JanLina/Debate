var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var recordSchema = new Schema({
    competitionId: String,
    proDebaters: Array,  // [正方辩手id]
    conDebaters: Array,  // [反方辩手id]
    profiles: Array,  // [{ id: 辩手id, profile: 立场简述 }]
    debateStatements: Array,  // [{userId: 辩手id, statementId: 立论阶段发言的id}]
    freeDebateStatements: Array,  // [[{userId: 辩手id, statementId: 自由辩论阶段某个队伍的队员发言的id}]] 共包含3个循环，6个数组
    proEnd: String,  // 正方结辩的id
    conEnd: String,  // 反方结辩的id
    proVote: Number,  // 正方票数
    conVote: Number,  // 反方票数
    changeSide: Array,  // [{userId: 辩手id, attract: 因其转为我方的观众数，leave: 因其转为他方的观众数}]
    winner: Number,  // 1表示正方，2表示反方
    mvpUserId: String,  // MVP辩手id
    bestStatementId: String,  // 最佳言论id
    comments: Array  // [评论的id]
});

// .pre 表示每次存储数据之前都先调用这个方法
recordSchema.pre('save', function(next){
    var now = new Date();
    this.update_at = now;
    next();
});

mongoose.model('Record', recordSchema);