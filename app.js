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
io.sockets.on('connection', function(socket) {
    // 如果comp为true，表示用户进入了一场辩论赛，加入房间competition，由于同一时间只有一场辩论赛在进行，所以统一为“competition”房间即可
    socket.on('initRoom', function(data) {
        if (data.comp) {
            socket.join('competition');
        }
    });
    
    // 比赛开始
    socket.on('begin', function() {
        // 到达比赛开始时间，向比赛相关的所有客户端广播“比赛开始”
        // testing -- 客户端传来比赛开始的信号，向比赛相关的所有客户端广播“比赛开始”，即正方第一辩手开始发言
        io.sockets.in('competition').emit('begin');
    });

    // 辩手发表言论  参数：compId, userId, stand, num, type, stage, content
    socket.on('postMsg', function(data) {
        // 调用controllers/debate.js的publish方法
        debate.publish(data);
        var room = Object.keys(socket.rooms)[1];
        var delay = 0;
        if (data.stage === 'point') {  // 立论阶段
            io.sockets.in(room).emit('newMsg', { code: 1, data: data });
            if (data.num === 3 && data.stand === 2) {  // 这个发言后，将是自由辩论
                delay = 5000;
            } else {
                delay = 3000;
            }
            // 通知客户端开始下一轮倒计时
            setTimeout(() => {
                io.sockets.in(room).emit('begin');
            }, delay);
        } else {  // 自由辩论阶段
            statements[data.order] = data.content;
            counter ++;
            // if (counter === 3) {
                statements.forEach(function(statement, index) {
                    if (!statement) {
                        statements[index] = ' ';
                    }
                });
                io.sockets.in(room).emit('newMsg', { counter: counter, code: 1, data: data, statements: statements });
                counter = 0;
                statements = [];
                // 通知客户端开始下一轮倒计时
                setTimeout(() => {
                    io.sockets.in(room).emit('begin');
                }, 3000);
            // }
        }
    });
    
    // 直播辩手编辑，实时更新给同一房间所有用户
    socket.on('realTimeMsg', function(data) {
        var room = Object.keys(socket.rooms)[1];
        io.sockets.in(room).emit('realTimeMsg', { code: 1, data: data, room: room });
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
