var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var statementSchema = new Schema({
    competitionId: String,
    userId: String,
    type: Number,  // 0表示陈述，1表示反驳，2表示结辩0表示陈述，1表示反驳，2表示结辩
    // speakingTime: Number,  // 发言花费时间
    refute: Array,  // ['', ''] 反驳
    refutePart: Array,  // ['', ''] 反驳的句子
    content: String  // 当type为0即此发言为陈述时，发言内容可能包含三种类型，所以用html格式存储本字段
});

// .pre 表示每次存储数据之前都先调用这个方法
statementSchema.pre('save', function(next){
    var now = new Date();
    this.update_at = now;
    next();
});

mongoose.model('Statement', statementSchema);