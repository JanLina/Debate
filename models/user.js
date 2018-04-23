var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    phone: Number,
    password: String,
    userName: String,
    icon: String,  // base64, FileReader
    role: Number,  // 0表示仅是观众，1表示辩手，2表示主持人
    sex: Number,  // 0表示女，1表示男
    // 观众特有
    numOfLikes: Number,
    comments: Array,  // [发表的评论的id]
    // 辩手特有
    level: Number,  // 辩论等级
    numOfCompetition: Number,  // 参与辩论赛次数
    numOfWin: Number,
    numOfMvp: Number,
    competitions: Object,  // { toStart: [我即将参与的辩论赛的id], completed: [我参与过的辩论赛的id] }
    following: Array,  // [我关注的人的id]
    followers: Array,  // [关注我的人的id]
    collections: Array  // [我收藏的辩论赛的id]
});

// .pre 表示每次存储数据之前都先调用这个方法
UserSchema.pre('save', function(next){
    var now = new Date();
    this.update_at = now;
    next();
});

mongoose.model('User', UserSchema);
