var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var debate = require('./controllers/debate');

var app = express();
var server = app.listen(3000);
var io = require('socket.io').listen(server);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var router = require('./router.js');
require('./models');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


var statements = [];
var counter = 0;
var refuteStatement = [];
io.sockets.on('connection', function(socket) {
    // 如果comp为true，表示用户进入了一场辩论赛，加入房间debater，由于同一时间只有一场辩论赛在进行，所以统一为“debater”房间即可
    socket.on('initRoom', function(data) {
        if (data.comp) {
            if (data.isDebater) {
                socket.join('debater');
            } else {
                socket.join('audience');
            }
        }
    });
    
    // 比赛开始
    socket.on('begin', function() {
        // 到达比赛开始时间，向比赛相关的所有客户端广播“比赛开始”
        // testing -- 客户端传来比赛开始的信号，向比赛相关的所有客户端广播“比赛开始”，即正方第一辩手开始发言
        io.sockets.in('debater').emit('begin');
        io.sockets.in('audience').emit('begin');
        // io.sockets.in('debater').in('audience').emit('begin');
    });

    // 辩手发表言论  参数：compId, userId, stand, num, order, type, stage, content
    socket.on('postMsg', function(data) {
        debate.publish(data);  // 调用controllers/debate.js的publish方法
        var delay = 0;
        if (data.completed) {  // 观众的评论
            io.sockets.in('debater').emit('comment', { code: 1, data: data });
            io.sockets.in('audience').emit('comment', { code: 1, data: data });
        }
        if (data.stage === 'point') {  // 立论阶段
            io.sockets.in('debater').emit('newMsg', { code: 1, data: data });
            io.sockets.in('audience').emit('newMsg', { code: 1, data: data });
            // io.sockets.in('debater').in('audience').emit('newMsg', { code: 1, data: data });
            // ...
            if (data.num === 3 && data.stand === 2) {  // 这个发言后，将是自由辩论
                // delay = 5000;
                delay = 0;
            } else {
                // delay = 3000;
                delay = 0;
            }
            setTimeout(() => {
                io.sockets.in('debater').in('audience').emit('begin');
            }, delay);
        } else if (data.stage === 'free') {  // 自由辩论阶段
            if (data.refute) {
                refuteStatement[data.order] = data.content;
                io.sockets.in('debater').in('audience').emit('test', { counter: counter, data: data, statements: statements, refuteStatement: refuteStatement });
                return;
            }
            statements[data.order] = data.content;
            counter ++;
            io.sockets.in('debater').in('audience').emit('test', { counter: counter, data: data, statements: statements, refuteStatement: refuteStatement });
            if (counter === 3) {
            // if (counter === 1) {
                statements.forEach(function(statement, index) {
                    if (!statement) {
                        statements[index] = ' ';
                    }
                });
                io.sockets.in('debater').emit('newMsg', { code: 1, counter: counter, data: data, statements: statements, refuteStatement: refuteStatement });
                io.sockets.in('audience').emit('newMsg', { code: 1, counter: counter, data: data, statements: statements, refuteStatement: refuteStatement });
                counter = 0;
                statements = [];
                refuteStatement = [];
                if (data.num === 3 && data.stand === 2) {
                    // delay = 5000;
                    delay = 0;
                } else {
                    // delay = 3000;
                    delay = 0;
                }
                setTimeout(() => {
                    io.sockets.in('debater').emit('begin');
                    io.sockets.in('audience').emit('begin');
                }, delay);
            }
        } else {  // 结辩
            io.sockets.in('debater').emit('newMsg', { code: 1, data: data });
            io.sockets.in('audience').emit('newMsg', { code: 1, data: data });
            if (data.stand === 2) {
                return;
            }
            setTimeout(() => {
                io.sockets.in('debater').emit('begin');
                io.sockets.in('audience').emit('begin');
            // }, 3000);
            }, 0);
        }
    });
    
    // 直播辩手编辑，实时更新给同一房间所有辩手
    socket.on('realTimeMsg', function(data) {
        var room = Object.keys(socket.rooms)[1];
        io.sockets.in(room).emit('realTimeMsg', { code: 1, data: data });
    });
});

// error handler
// app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  // res.status(err.status || 500);
  // res.render('error');
// });

module.exports = app;
