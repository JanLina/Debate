var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var competitionSchema = new Schema({
    title: String,  // 辩题
    time: Date,  // 辩论时间
    status: Number,  // 0表示未开始，1表示正在进行，2表示已结束
    emceeId: String,  // 主持人的id
    proDebaters: Array,  // [正方辩手id]
    conDebaters: Array,  // [反方辩手id]
    profiles: Array,  // [{ id: 辩手id, profile: 立场简述 }]
    recordId: String,  // 比赛过程记录的id,
    votes: Number,  // 上周获得的票数
    clicks: Number,  // 点击量
    createdAt: Date  // 创建时间
});

// .pre 表示每次存储数据之前都先调用这个方法
competitionSchema.pre('save', function(next){
    var now = new Date();
    this.update_at = now;
    next();
});

mongoose.model('Competition', competitionSchema);