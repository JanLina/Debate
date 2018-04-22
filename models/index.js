var mongoose = require('mongoose');
var config = require('../config');
var dburl = 'mongodb://127.0.0.1:27017/nodejs';

mongoose.connect(dburl);
mongoose.connection.on('connected', function() {
    console.log('connect ' + dburl + ' success');
});
mongoose.connection.on('error', function() {
    console.log('connect ' + dburl + ' error');
});
mongoose.connection.on('disconnected', function() {
    console.log('disconnected');
});

// models
require('./user');
require('./competition');
require('./record');
require('./statement');
require('./comment');
require('./mvpData');

exports.User = mongoose.model('User');
exports.Competition = mongoose.model('Competition');
exports.Record = mongoose.model('Record');
exports.Statement = mongoose.model('Statement');
exports.Comment = mongoose.model('Comment');
exports.MvpData = mongoose.model('MvpData');
