# 在线辩论网站 #

## 运行 ##
（安装nodejs、npm和mongodb）
- 运行mongodb
- 进入文件夹，运行npm i下载package.json中的依赖模块
- 运行npm start启动
- localhost:3000/进入登录页

## 技术点 ##
- jQuery, Bootstrap
- nodeJS(express), WebSocket
- 评论接入多说：http://duoshuo.com/
- nodejs + express + mongodb 项目：http://cnodejs.org/topic/535601a20d7d0faf140303d8
- nodejs资料：https://github.com/alsotang/node-lessons

## Todo ##
- [√] 前台登录注册/切换
- [√] Mongodb数据库的使用
- [×]数据库、接口设计
- [×] socket.io的使用

## 知识点 ##
- 【 middleware 】每一个 middleware 相当于一个加工步骤，当出现一个 http 请求的时候，http 请求会挨着每个 middleware 执行下去。
express 里处理一个请求的过程基本上就是请求通过 middleware stack 的过程：  * -> middlewares -> 路由 -> controllers -> errorhandlering。判断用户是否登录就可以用 middleware 实现
- 【 eventproxy 】eventproxy 模块解决异步回调

