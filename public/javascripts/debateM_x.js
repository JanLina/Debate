$(function() {
    var page = {
        data: {
            compId: window.location.search.split('=')[1],//分割url，获取辩论赛id
            compData: null,
            progress: {
                type: -1,
                stage: '',
                userId: '',
                stand: -1,
                num: 0
            },
            /*sessionStorage 以标签页作为一个单位，新建一个会话，存储会话于浏览器端，登陆的时候
            localStorage 保存期限长，除非手动删掉，关掉浏览器也不影响。
            */currentUser: { ...JSON.parse(sessionStorage.getItem('user')), ...{ order: -1 } }
        },
        socket: null,
        timer: null,
        els: {
            $typeBtn: $('.type-button').eq(0),
            $startBtn: $('#start'),
            $editContent: $('.edit-content').eq(0),
            $liveContent: $('.live-content').eq(0),
            $publishBtn: $('.edit-publish-button').eq(0),
            $debateProgress: $('.debate-progress').eq(0),
            $editCountDown: $('#edit-count-down'),
            $liveCountDown: $('#live-count-down'),
            $debaterSwitch: $('.debater-switch').eq(0),
            $liveContentFrees: $('.live-content-free')
        },
        init: function() {
            var that = this;//回调函数里面的this不是辩论赛，要创建一个永久辩论赛的this
            // 获取辩论赛信息
            this.initCompInfo();
            // 设置websocket监听函数
            this.setSocket();
            // 开始比赛
            this.els.$startBtn.click(function() {
                that.socket.emit('begin');
            });
            // 辩手发表言论
            this.els.$publishBtn.click(function() {
                that.publish();
            });
            // 自由辩论阶段，切换直播区
            this.els.$debaterSwitch.click(function(ev) {
                that.switch(ev);
            });
            // 切换发言类型
            this.els.$typeBtn.click(function(ev) {
                that.switchType(ev);
            });
        },
        switchType: function(ev) {
            var $target = $(ev.target);
            var c = '';
            var el = '';
            var $el = null;
            switch ($target.val()) {
                case '总结':
                    c = 'conclude';
                    break;
                case '分点':
                    c = 'point';
                    break;
                case '例子':
                    c = 'example';
                    break;
                case '反驳':
                    c = 'argue';
                    break;
                default:
                    break;
            }
            el = `<p class="${c}" contenteditable="true">·</p>`;
            $el = $(el);
            this.els.$editContent.append($el);
            $el.focus();
        },
        initCompInfo: function() {//拿到辩论赛信息，存在data里面
            var that = this;
            $.post(config.prefixPath + '/competition/getDetail', {compId: that.data.compId}, function(res) {
                that.data.compData = res.data;
                // 初始化比赛进程
                that.initProgress();
                $('.title-font').eq(0).html(res.data.title);
                // 比赛未开始，初始化比赛
                if (!res.data.recordId) {
                    $.post(config.prefixPath + '/debate/initComp', {compId: that.data.compId}, function(res) {
                        // 获取排序后的一二三辩，比赛记录id
                        that.data.compData.proDebaters = res.newRecord.proDebaters;
                        that.data.compData.conDebaters = res.newRecord.conDebaters;
                        that.data.compData.recordId = res.newRecord._id;
                    });
                }
            });
        },
        initProgress: function() {
            var progress = this.data.progress;
            progress.type = 0;
            progress.stage = 'point';
            // progress.userId = this.data.compData.proDebaters[0];
            // progress.stand = 1;
            // progress.num = 1;
            // [begin] 自由辩论测试
            progress.userId = this.data.compData.conDebaters[2];
            progress.stand = 2;
            progress.num = 3;
            // [end] 自由辩论测试
        },
        countDown: function() {
            // 是否当前用户发言时间
            var that = this;
            var turn = false;
            var progress = this.data.progress;
            var temp = '';
            if (progress.stage === 'point') {
                turn = this.data.currentUser.id === progress.userId._id;
            } else {
                temp = progress.stand === 1 ? 'proDebaters' : 'conDebaters';
                this.data.compData[temp].forEach(function(user, index) {
                    if (user._id === that.data.currentUser.id) {
                        turn = true;
                    }
                });
            }
            console.log('当前用户发言', turn, 'x0002');
            this.els.$publishBtn.attr('disabled', !turn);  // 只有当前辩手可以发言
            this.els.$typeBtn.find('input').attr('disabled', !turn);
            if (turn) {
                this.timer = this.els.$editCountDown.timeCountDown(90);
            } else {
                this.timer = this.els.$liveCountDown.timeCountDown(90);
            }
        },
        publish: function() {
            // 参数：compId, userId, stand, num, type, stage, content
            var msg = this.els.$editContent.html();
            msg = msg.replace(' contenteditable="true"', '');  // 传递的内容应是不可编辑的
            var progress = this.data.progress;
            if (msg.trim().length != 0) {
                this.socket.emit('postMsg', {
                    compId: this.data.compId,
                    userId: progress.userId,
                    stand: progress.stand,
                    num: progress.num,
                    type: progress.type,
                    stage: progress.stage,
                    content: msg,
                    order: this.data.currentUser.order
                });
            };
            this.els.$editContent.html('');
            this.els.$publishBtn.attr('disabled', false);
        },
        setSocket: function() {//function里面有function都要记录原来的page
            var that = this;
            var progress = that.data.progress;
            that.socket = io.connect();
            that.socket.on('connect', function(socket) {
                console.log('connect success  x0000');//测试用的
                that.socket.emit('initRoom', {comp: true});//comp是用于记录用户有没有进入辩论赛房间
            });
            
            // 比赛开始
            that.socket.on('begin', function(data) {//每一轮发言开始
                console.log('begin  x0001');
                that.countDown();  // 开始第一轮的倒计时
            });

            // 直播
            that.socket.on('realTimeMsg', function(res) {
                if (res.data.order !== -1) {  // 自由辩论，用于判断是哪一个辩手
                    that.els.$liveContentFrees.eq(res.data.order).html(res.data.msg);
                } else {
                    that.els.$liveContent.html(res.data.msg);
                }
            });
            that.els.$editContent.keyup(function() {
                var msg = that.els.$editContent.html();
                msg = msg.replace(' contenteditable="true"', '');  // 传递的内容应是不可编辑的
                if (msg.trim().length != 0) {
                    that.socket.emit('realTimeMsg', { userId: progress.userId, order: that.data.currentUser.order, msg });
                    return;
                };
            });

            // 接收新发言
            that.socket.on('newMsg', function(res) {
                that.handleNewMsg(res);
            });
        },
        handleNewMsg: function(res) {
            var that = this;
            var data = res.data;
            if (data.stage === 'free') {
                data.content = '';
                res.statements.forEach(function(statement, index) {
                    var order = index === 0 ? '一辩' : (index === 1 ? '二辩' : '三辩');
                    data.content += '<p class="order">' + order + '：</p>' + statement;
                });
            }

            //判断消息气泡显示内容
            var statement = `<div class="${data.stand === 1 ? 'positive' : 'negative'}-debate clearfix">
                                <div class="debater-info song-font">
                                    <span class="name">${data.stage === 'point' ? data.userId.userName : ''}</span>
                                    <span class="dot"></span>
                                    <span class="role">${data.stand === 1 ? '正方' : '反方'}${ data.stage === 'point' ? (data.num === 1 ? '一辩' : (data.num === 2 ? '二辩' : '三辩')) : ''}</span>
                                    <span class="dot"></span>
                                    <span class="stage">${data.stage === 'point' ? '立论' : '自由辩论'}</span>
                                </div>
                                <div class="debate-content">
                                    <div class="${data.stand === 1 ? 'debater-avatar-blue ' : 'debater-avatar-orange '}${ data.stand === 1 ? 'fl' : 'fr'}">
                                        <div class="debater-avatar-blank">
                                            <img src="images/icon_avatar.jpg" alt="">
                                        </div>
                                    </div>
                                    <div class="content-block${data.stand === 1 ? ' content-bk-blue ' : ' content-bk-orange '}${data.stand === 1 ? 'fl' : 'fr'}">
                                        <div class="content">
                                            ${data.content}
                                        </div>
                                    </div>
                                </div>
                            </div>`;
            that.els.$debateProgress.append($(statement));
            clearTimeout(that.timer);  // 关闭倒计时
            that.els.$editCountDown.html('倒计时：--');  // 将两个倒计时置空
            that.els.$liveCountDown.html('倒计时：--');
            that.els.$liveContent.html('');  // 将直播区的内容清空
            that.els.$liveContentFrees.each(function(index, free) {
                free.innerHTML = '';
            });
            // 更新progress
            // progress: { type: -1, stage: '', userId: '', stand: -1, num: 0 }
            var progress = that.data.progress;
            var progressNew = JSON.parse(JSON.stringify(that.data.progress));//生拷贝
            if (progress.stage === 'point') {  // 立论阶段
                progressNew.userId = progress.stand === 1 ? that.data.compData.conDebaters[progress.num - 1] : that.data.compData.proDebaters[progress.num];
                progressNew.num = progress.stand === 2 ? progress.num + 1 : progress.num;
                progressNew.stand = progress.stand === 1 ? 2 : 1;
                if (progress.num === 3 && progress.stand === 2) { // 下一个发言是自由辩论
                    console.log('free  x0001');
                    that.els.$debaterSwitch.removeClass('hide');
                    that.els.$liveContent.addClass('hide');
                    that.els.$liveContentFrees.eq(0).removeClass('hide');
                    progressNew.type = 0;
                    progressNew.stage = 'free';
                    progressNew.stand = 1;
                    progressNew.userId = '';
                    progressNew.num = 1;  // 记录这是第几个循环
                    var freeHeader = `<div class="free-debate">
                                        <div class="line free-sign-line fl"></div>
                                        <span class="sign-font">立论结束，自由辩论开始</span>
                                        <div class="line free-sign-line fr"></div>
                                    </div>`;
                    setTimeout(() => {
                        that.els.$debateProgress.append($(freeHeader));
                    }, 2000);
                    that.data.compData.proDebaters.forEach(function(user, index) {
                        if (user._id === that.data.currentUser.id) {
                            that.data.currentUser.order = index;
                        }
                    });
                    that.data.compData.conDebaters.forEach(function(user, index) {
                        if (user._id === that.data.currentUser.id) {
                            that.data.currentUser.order = index;
                        }
                    });
                }
            } else {  // 自由辩论
                console.log(progress.stand, progress.num, 'x0003');
                // if (progress.stand === 2 && progress.num === 3) {  // 自由辩论结束，取比赛结果
                if (progress.stand === 2 && progress.num === 1) {
                    $.post(config.prefixPath + '/debate/getResult', {compId: that.data.compId}, function(res) {
                        console.log(res, 'x00111');
                    });
                    return;
                }
                progressNew.num = progress.stand === 2 ? progress.num + 1 : progress.num;
                progressNew.stand = progress.stand === 1 ? 2 : 1;
            }
            that.data.progress = progressNew;
        },
        switch: function(ev) {
            var $target = $(ev.target);
            var idx = $target.index();
            $target.addClass('active').siblings().removeClass('active');
            this.els.$liveContentFrees.eq(idx).removeClass('hide').siblings('.live-content-free').addClass('hide');
        }
    };
    page.init();
});

/*
    调用方法：$(显示倒计时的DOM).timeCountDown(倒计时初始秒数);
 */
var liveCount = 0;  // 右上角直播框的倒计时
var editCount = 0;  // 右下角编辑框的倒计时
var timeCountLeft = 10;  // 用于记录倒计时的剩余值
var timeEnd = false;  // 用于记录倒计时是否提前结束
$.fn.timeCountDown = function (timeNeed, timer){  //timeNeed用于记录倒计时的初始值
    var that = this;
    timeCountLeft = timeNeed;
    return setInterval(function() {  //每隔1秒自调用1次
        setTime(that);
    }, 1000);
    function setTime(obj){
        if ((timeCountLeft != 0) && (timeEnd == false)) {  //当还有剩余时间，而且倒计时没有提前结束的话
            obj.text("倒计时" + timeCountLeft + "s");
            timeCountLeft--;
        } else {
            timeCountLeft = 0;
            obj.text("倒计时: --");
            return;
        }
    }
}