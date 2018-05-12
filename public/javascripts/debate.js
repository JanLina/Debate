$(function(){
    
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

$(".conclude-button").click(function(){//首次点击右下角编辑框
    if(initCondition == true){
        var elConclude = '\<p class="conclude" contenteditable="true">--</p>\
        ';
        $(".edit-content").append(elConclude);
        // var $content = $(".edit-content").eq(0);
        // var $conclude = $content.find('.conclude').eq(0);
        // $conclude.focus();
        var elContent = document.getElementsByClassName('edit-content')[0];
        var elConcludes = elContent.getElementsByClassName('conclude');
        placeCaretAtEnd(elConcludes[elConcludes.length - 1]);
    }
});

function placeCaretAtEnd(el) {
    if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el, -1);  // 选择节点el的子节点
        range.collapse(false);  // 指明范围的开始点和结束点不在同一位置，不折叠
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
}


$(".conclude-button").click(function(){
    if(recentInputType != "concludeType"){
        
    }
});

$(".point-button").click(function(){
    if(recentInputType != "pointType"){

    }
});

$(".example-button").click(function(){
    if(recentInputType != "exampleType"){

    }
});

$(".argue-button").click(function(){
    if(recentInputType != "argueType"){

    }
});

window.onload = function(){
    var debate = new Debate();
    debate.init();
};

var Debate = function(){
    this.socket = null;
};

Debate.prototype = {
    init: function(){
        this.socket = io.connect();//连接服务器

        //$(".live-content").html(liveContent);

        /*右上角的辩论直播框*/
        
        this.socket.on('opponent-content',function(liveContent){ //显示对方辩手的文字直播
            $(".live-content").html(liveContent);
        });

        /*右下角的编辑框*/


    }
};



});