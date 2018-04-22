var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var recordSchema = new Schema({
    competitionId: Number,
    proDebaters: Array,  // [正方辩手id]
    conDebaters: Array,  // [反方辩手id]
    debateStatements: Array,  // [立论阶段发言的id]
    freeDebateStatements: Number,  // [[自由辩论阶段某个队伍的队员发言的id]] 共包含3个循环，6个数组
    endDebate: Object,  // { proEndStatement: 正方结辩的id, conEndStatement: 反方结辩的id }
    winner: Number,  // 0表示正方，1表示反方
    mvpUserId: Number,  // MVP辩手id
    bestStatement: Number,  // 最佳言论id
    comments: Array  // [评论的id]
});

// .pre 表示每次存储数据之前都先调用这个方法
recordSchema.pre('save', function(next){
    var now = new Date();
    this.update_at = now;
    next();
});

mongoose.model('Record', recordSchema);