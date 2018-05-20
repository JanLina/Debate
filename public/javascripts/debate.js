
$(function(){
    
    /**常用元素 */
    $editContent: $(".edit-content")

    var liveContent = '\
<p class="argue">嫉妒可能分为3种紧密关联的情感：羡慕/嫉妒、吃醋以及羞耻。它们都是由于不安全感引起的，在一定程度以内时，都是人正常的天性，是直接在两个个体间发生的情绪，一个人因为某种原因envy另一方。</p>\
                            <p class="conclude">这其实也是我们在看到自己不如他人的时候，为了防止羞耻感而产生的防御机制。</p>\
                            <p class="point">\
                                <1> 羡慕/嫉妒（envy）是直接在两个个体间发生的情绪，一个人因为某种原因envy另一方。</p>\
                            <p class="point">\
                                <2> 吃醋（jealousy）则是在三个个体之间发生的情绪，A因为在意B，而对C产生了吃醋（jealousy）的情绪。</p>\
                            <div class="example">\
                                <div class="example-line fl"></div>\
                                <p class="example-content">孩子从生下来就会希望爸爸和妈妈的注意力都在自己身上，但是又时常感觉自己并不是父母婚姻情感中的一部分。一般来说，异性恋父母养育的孩子，会将与自己同，会将自己与。</p>\
                            </div>\
';

/*右上角直播框*/

/*右下角编辑框*/

/**按钮设置 */
var inputType = new Array("concludeType","pointType","exampleType","argueType");
var recentInputType = inputType[0];
var initCondition = true;
var position = 0;//记录当前编辑中的段落编号
var range = document.createRange();//光标
var selection = window.getSelection();//记录选择区域
var preInputObj = $(".edit-content");

$.fn.setInputPosition = function (styleType){//根据按钮确定新段落的样式类型
    this.attr("contenteditable","false");//把上一个可编辑元素的编辑属性关闭

    var inputName = 'editPara'+position.toString();//新段落id
    var paraHtml = '\<p id="'+inputName+'"></p>\
    ';//新段落html
    $(".edit-content").append(paraHtml);//把新段落加入到编辑框中

    /**编辑新段落的属性 */
    var inputId = '#'+inputName;
    $(inputId).addClass(styleType);//根据按钮类型确定新段落样式
    $(inputId).attr("contenteditable","true");//把新段落设置为可编辑元素
    $(inputId).css("outline","none");//取消输入边框
    $(inputId).focus();//把输入焦点确定到新段落上

    preInputObj = $(inputId);
    position++;
    
    if(styleType == "conclude"){
        recentInputType = inputType[0];
    }else if(styleType == "point"){
        recentInputType = inputType[1];
    }else if(styleType == "example"){
        recentInputType = inputType[2];
    }else{
        recentInputType = inputType[3];
    }
}

$(".edit-content").click(function(){//首次点击右下角编辑框

    if(initCondition == true){

        $(".edit-content").setInputPosition("conclude");

        /**倒计时的调用方式
        $("#edit-count-down").timeCountDown(90);
         */
        initCondition = false;
    }
});

$("#editcon").on('click','p',function(){//监测点击p的事件，假如点击了p，则把可编辑属性重定位
    preInputObj.attr("contenteditable","false");
    $(this).attr("contenteditable","true");
    $(this).focus();

    preInputObj = $(this);
});

$(".conclude-button").click(function(){
    if(recentInputType != "concludeType"){
        preInputObj.setInputPosition("conclude");
    }
});

$(".point-button").click(function(){
    if(recentInputType != "pointType"){
        preInputObj.setInputPosition("point");
    }
});

$(".example-button").click(function(){
    if(recentInputType != "exampleType"){
        preInputObj.setInputPosition("example");
    }
});

$(".argue-button").click(function(){
    if(recentInputType != "argueType"){
        preInputObj.setInputPosition("argue");
    }
});

/**设置右下角编辑框输入位置 */
function setCursorPosition(){

}

});



// 这是我加的
// window.onload = function() {
//     var debate = new Debate();
//     debate.init();
// };
// var Debate = function() {
//     this.socket = null;
// };
// Debate.prototype = {
//     init: function() {
//         var that = this;
//         var userId = '5ae1d6392dd2bb14ac1e4c7b'
//         var $editContent = $('.edit-content').eq(0);
//         var $liveContent = $('.live-content').eq(0);
//         var $publishBtn = $('.edit-publish-button').eq(0);
//         this.socket = io.connect();
//         this.socket.on('connect', function() {
//             console.log('connect success    x0000');
//         });

//         // [begin] 直播
//         // 接收消息，后端传来的数据结构为{ code: 1, data: data }
//         this.socket.on('realTimeMsg', function(res) {
//             console.log(res.data);
//             console.log(res.data.msg);
//             $liveContent.html(res.data.msg);
//         });
//         // 发送消息
//         $editContent.keyup(function() {
//             var msg = $editContent.html();
//             if (msg.trim().length != 0) {
//                 that.socket.emit('realTimeMsg', { userId, msg });
//                 return;
//             };
//         });
//         // [end] 直播

//         // [begin] 辩手发表言论
//         $publishBtn.click(function() {
//             var msg = $editContent.html();
//             if (msg.trim().length != 0) {
//                 that.socket.emit('postMsg', { userId, msg });
//                 return;
//             };
//         });
//         this.socket.on('newMsg', function(res) {
//             console.log(res.data);
//             console.log(res.data.msg);
//         });
//         // [end] 辩手发表言论
//     }
// };