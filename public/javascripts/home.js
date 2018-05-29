$(function() {
    var page = {
        init: function() {
            // this.getHot();
            // Testing
            $('.enter-button').eq(0).click(function() {
                var compId = '5b014c3bf32b5b13845294a5';  // 手动设置比赛id
                $.post(config.prefixPath + '/competition/getDetail', {compId: compId}, function(result, staus) {
                    window.location.href = 'http://localhost:3000/debate?compId=' + result.compId;
                });
            });
        },
        getHot() {
            // 夭折的本周热点
            $.get(config.prefixPath + '/competition/getHot', function(result) {
                console.log(result, 'x0000');
                var comps = result.data;
                var compEl = '';
                var proDebaters = '';
                var conDebaters = '';
                comps.forEach(function(comp, index) {
                    compEl = `<li class="single-hot-debate">
                                <div class="single-debate-title fl">
                                    <img src="images/single-debate-background.png" alt="">
                                    <div class="title-font title-font-right">${comp.title}</div>
                                    <div class="title-font title-font-left"></div>
                                </div>
                                <div class="debate-condition fr">
                                    <img src="images/debate-info-tie.png" alt="">
                                    <div class="debate-condition-font">${comp.status === 0 ? '即将开场' : (comp.status === 1 ? '正在进行' : '已结束')}</div>
                                </div>

                                <div class="debate-info fl">
                                    <div class="debate-time">${comp.time}</div>
                                    <div class="debater-info-box">
                                        <div class="side-font blue fl">正方</div>
                                        <div class="verticle-line debater-info-line "></div>
                                        <div class="debater-box fr">
                                            <div id="blue-first" class="debater">
                                                <div class="debater-avatar fl">
                                                    <div class="debater-avatar-blank">
                                                    <img src="images/icon_avatar.jpg" alt="">
                                                    </div>
                                                </div>
                                                <div class="dot bkblue fl"></div>
                                                <div class="debater-intro">
                                                    <div class="debater-name">${proDebaters[0]}</div>
                                                    <div class="debater-introduce">占有欲是人类保护情感投入的本能</div>
                                                </div>
                                            </div>
                                            <div id="blue-second" class="debater">
                                                <div class="debater-avatar fl">
                                                    <div class="debater-avatar-blank">
                                                    <img src="images/icon_avatar.jpg" alt="">
                                                    </div>
                                                </div>
                                                <div class="dot bkblue fl"></div>
                                                <div class="debater-intro">
                                                    <div class="debater-name">成长的樱桃树</div>
                                                    <div class="debater-introduce">占有欲是人类保护情感投入的本能</div>
                                                </div>
                                            </div>
                                            <div id="blue-third" class="debater">
                                                <div class="debater-avatar fl">
                                                    <div class="debater-avatar-blank">
                                                    <img src="images/icon_avatar.jpg" alt="">
                                                    </div>
                                                </div>
                                                <div class="dot bkblue fl"></div>
                                                <div class="debater-intro">
                                                    <div class="debater-name">成长的樱桃树</div>
                                                    <div class="debater-introduce">占有欲是人类保护情感投入的本能</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="debater-info-box">
                                        <div class="side-font orange fl">反方</div>
                                        <div class="verticle-line debater-info-line "></div>
                                        <div class="debater-box debater-box-orange fr">
                                            <div id="orange-first" class="debater">
                                                <div class="debater-avatar fl">
                                                    <div class="debater-avatar-blank">
                                                    <img src="images/icon_avatar.jpg" alt="">
                                                    </div>
                                                </div>
                                                <div class="dot bkorange fl"></div>
                                                <div class="debater-intro">
                                                    <div class="debater-name">成长的樱桃树</div>
                                                    <div class="debater-introduce">占有欲是人类保护情感投入的本能</div>
                                                </div>
                                            </div>
                                            <div id="orange-second" class="debater">
                                                <div class="debater-avatar fl">
                                                    <div class="debater-avatar-blank">
                                                    <img src="images/icon_avatar.jpg" alt="">
                                                    </div>
                                                </div>
                                                <div class="dot bkorange fl"></div>
                                                <div class="debater-intro">
                                                    <div class="debater-name">成长的樱桃树</div>
                                                    <div class="debater-introduce">占有欲是人类保护情感投入的本能</div>
                                                </div>
                                            </div>
                                            <div id="orange-third" class="debater">
                                                <div class="debater-avatar fl">
                                                    <div class="debater-avatar-blank">
                                                    <img src="images/icon_avatar.jpg" alt="">
                                                    </div>
                                                </div>
                                                <div class="dot bkorange fl"></div>
                                                <div class="debater-intro">
                                                    <div class="debater-name">成长的樱桃树</div>
                                                    <div class="debater-introduce">占有欲是人类保护情感投入的本能</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <input type="button" value="入场" class="enter-button fr">
                            </li>`
                });
                
            });
        }
    };
    page.init();
});