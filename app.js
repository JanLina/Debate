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

//  
io.sockets.on('connection', function(socket) {
    // if (Math.random() > 0.5) {
    //     socket.join('room1');
    // } else {
    //     socket.join('room2');
    // }
    socket.join('room1');
    // 辩手发表言论
    socket.on('postMsg', function(data) {
        // 调用controllers/debate.js的publish方法
        debate.publish(data);
        var room = Object.keys(socket.rooms)[1];
        io.sockets.in(room).emit('newMsg', { code: 1, data: data });
    });
    // 直播辩手编辑，实时更新给同一房间所有用户
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
