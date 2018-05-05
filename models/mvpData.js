var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var mvpDataSchema = new Schema({
    competitionId: String,
    activeVoteNumber: Number,  // 整场辩论赛中参与了2次以上投票的观众数
    activePraiseNumber: Number,  // 整场辩论赛中参与了2次以上点赞的观众数
    data: Array
    // data: [{ 
    //     preTimeForSelf:上一个辩手发言所花费的时间（s）,
    //     timeForSelf: 自己发言所花费的时间,
    //     susWord: 观看上任辩手编辑发言时，自己编辑的字数,
    //     amountWord: 提交的本轮发言的总字数,
    //     debateGainAudience: 立论阶段从敌方转向己方的观众数,
    //     debateLostAudience: 立论阶段从己方转向敌方的观众数,
    //     debateOutAudience: 立论阶段离开辩论赛的观众数,
    //     debateTotalParticipant: 立论开始时辩论赛总人次,
    //     debateTypeScore: 立论结构得分（每种发言类型得3分，上限9分）,
    //     argueGainAudience: 反驳阶段从敌方转向己方的观众数,
    //     argueLostAudience: 反驳阶段从己方转向敌方的观众数,
    //     freeJumpScore: 自由辩论阶段的插队得分（每次插队成功获得3分）,
    //     withoutExWord: 立论中除了例子以外总编辑字数,
    //     exWord: 立论中例子的总字数,
    //     freeData: [{
    //         preFreeSelfTime: 对方队伍发言的时间,
    //         freeSusTime: 对方队伍发言并且自己还没开始编辑反驳内容的时间,
    //         freeSelfTime: 本队伍发言的时间,
    //         freeArgWord: 反驳的字数,
    //         freeAmountWord: 本轮发言的字数,
    //         freeGainAudience: 自由辩论阶段从敌方转向己方的观众数,
    //         freeLostAudience: 自由辩论阶段从己方转向敌方的观众数,
    //         freeOutAudience: 自由辩论阶段离开辩论赛的观众数,
    //         freeTotalParticipant: 自由辩论开始时辩论赛总人次,
    //         freeJumpWord: 插队言论的字数,
    //         freeSelfWord: 自身环节言论的字数
    //     }]
    // }]
});

// .pre 表示每次存储数据之前都先调用这个方法
mvpDataSchema.pre('save', function(next){
    var now = new Date();
    this.update_at = now;
    next();
});

mongoose.model('MvpData', mvpDataSchema);