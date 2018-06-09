
var exp = require('../utils/exception.js')
function timer() {

  setTimeout(function () {

    for (var i = 0; i < 5; i++) {
      if (wx.getStorageSync('active')) {
        //如果active是true，那么保持请求
        wx.request({
          url: 'https://crp.shakeel.cn/session-keep',
          method: 'GET',
          header: {
            'content-type': 'application/x-www-form-urlencoded' // 默认值
          },
          data: {
            'sessionId': wx.getStorageSync('sessionId')
          },
          success: function (res1) {
            if (res1.data.errcode == 0) {
              console.log('定时器，会话已经存在')
              return
            }
            if (res1.data.errcode == 1002) {
              wx.showLoading({
                title: '正在连接',
                mask: true
              })
              // 登录
              wx.login({
                success: res => {
                  wx.hideLoading()
                  // 发送 res.code 到后台换取 openId, sessionKey, unionId
                  var did = wx.getStorageSync('did');
                  var requrl = 'https://crp.shakeel.cn/session-build?code=' + res.code + "&did=" + did
                  console.log(requrl)
                  wx.request({
                    url: 'https://crp.shakeel.cn/session-build/',
                    url: requrl,
                    header: {
                      'content-type': 'application/x-www-form-urlencoded' // 默认值
                    },
                    data: {
                      //将用户信息发送上服务器
                      'code': res.code,
                      'did': did
                    },
                    header: {
                      'content-type': 'application/json' // 默认值
                    },

                    success: function (res) {
                      console.log('index.js文件', res.data)
                      wx.setStorageSync('sessionId', res.data.sessionId);
                      console.log('=================session success=================')
                      // console.log(res.data.fg)
                      if (res.data.errcode == 0) {  //如果登录成功
                        console.log(res.data.sessionId);
                        wx.showToast({
                          title: '登录成功',
                          icon: 'success',
                          duration: 2000
                        })
                        return
                      }
                      if (res.data.errcode == 1) {
                        wx.showToast({
                          title: '服务器遇到了异常，请稍后再试',
                          icon: 'none',
                          duration: 2000
                        })
                        return
                      }

                      else {
                        exp.exception(res.data.errcode)
                      }

                    },
                    fail: function (res) {
                      console.log('=================session fail=================')
                      wx.showToast({
                        title: '请连接服务器',
                        icon: 'none',
                        duration: 2000
                      })
                    },
                    complete: function (res) {
                      console.log('index登录完成')
                    }
                  })
                }

              })
              return
            }

            else {
              exp.exception(res.data.errcode);
            }
          },
          fail:function(res1){

          },
          complete:function(res1){
            
          }
        })
      }
      wx.setStorageSync('active', false);
    }
  }, 10000)//持续一分钟

}
module.exports = {
  timer: timer
}  