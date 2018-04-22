var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({
    competitionId: Number,
    userId: Number,
    repliedCommentId: Number,  // 被回复的评论的id，值为0说明这不是回复，是一级评论，计入观众晋升进程
    pubtime: Date,  // 发表时间
    content: String,
    likes: Number,
    replys: Array  // [此评论的回复的id]
});

// .pre 表示每次存储数据之前都先调用这个方法
commentSchema.pre('save', function(next){
    var now = new Date();
    this.update_at = now;
    next();
});

mongoose.model('Comment', commentSchema);