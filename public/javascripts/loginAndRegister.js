$(function() {
    var page = {
        els: {
            $login: $('#loginBtn'),
            $register: $('#registerBtn'),
            $loginContent: $('.login-content').eq(0),
            $registerContent: $('.register-content').eq(0)
        },
        init: function() {
            var self = this;
            $('input:first').focus();
            this.els.$login.click(function() {
                self.confirmLogin();
            });
            this.els.$register.click(function() {
                self.confirmRegister();
            });
        },
        confirmLogin: function() {
            this.handleConfirm(this, $('.login-wrapper').eq(0), this.els.$loginContent, config.prefixPath + '/user/login', config.prefixPath + '/manage');
        },
        confirmRegister: function() {
            this.handleConfirm(this, $('.register-wrapper').eq(0), this.els.$registerContent, config.prefixPath + '/user/register', config.prefixPath + '/login');
        },
        handleConfirm: function(self, $wrapper, $content, postUrl, toUrl) {
            var $alert = $wrapper.find('.alert-warning').eq(0);
            $alert.hide();
            var userName = $content.find('.userName').eq(0).val();
            var password = $content.find('.password').eq(0).val();
            $.post(postUrl, { userName: userName, password: password }, function(result, status) {
                console.log(result);
                if (!result.code && result.data.message) {
                    $alert.show().find('.text').eq(0).html(result.data.message);
                } else if (result.code) {
                    // 如果是登录，保存用户信息到sessionStorage
                    sessionStorage.setItem('user', JSON.stringify({
                        id: result.data._id,
                        name: result.data.userName
                    }));
                    window.location.href = toUrl;
                }
            });
        }
    };
    page.init();
});