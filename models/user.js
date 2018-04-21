var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;
var utility   = require('utility');

var UserSchema = new Schema({
  phone: Number,
  password: String
});

// .pre 表示每次存储数据之前都先调用这个方法
UserSchema.pre('save', function(next){
  var now = new Date();
  this.update_at = now;
  next();
});

mongoose.model('User', UserSchema);
