var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var competitionSchema = new Schema({
    title: String,  // 辩题
    time: Date,  // 辩论时间
    status: Number,  // 0表示未开始，1表示正在进行，2表示已结束
    emceeId: Number,  // 主持人的id
    proDebaters: Array,  // [{ id: 正方辩手id, profile: 立场简述 }]
    conDebaters: Array,  // [{ id: 反方辩手id, profile: 立场简述 }]
    record: Number  // 比赛过程记录的id
});

// .pre 表示每次存储数据之前都先调用这个方法
competitionSchema.pre('save', function(next){
    var now = new Date();
    this.update_at = now;
    next();
});

mongoose.model('Competition', competitionSchema);