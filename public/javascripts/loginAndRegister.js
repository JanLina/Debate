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
            this.handleConfirm(this, $('.login-wrapper').eq(0), this.els.$loginContent, config.prefixPath + '/user/login', config.prefixPath + '/home');  // 登录成功后跳转到首页
        },
        confirmRegister: function() {
            this.handleConfirm(this, $('.register-wrapper').eq(0), this.els.$registerContent, config.prefixPath + '/user/register', config.prefixPath + '/login');  // 注册成功后跳转到登录页
        },
        handleConfirm: function(self, $wrapper, $content, postUrl, toUrl) {
            var $alert = $wrapper.find('.alert-warning').eq(0);
            $alert.hide();
            var phone = $content.find('.phone').eq(0).val();
            var password = $content.find('.password').eq(0).val();
            $.post(postUrl, { phone: phone, password: password }, function(result, status) {
                console.log(result);
                if (!result.code && result.data.message) {
                    $alert.show().find('.text').eq(0).html(result.data.message);
                } else if (result.code) {
                    // window.location.href = toUrl;
                }
            });
        }
    };
    page.init();
});