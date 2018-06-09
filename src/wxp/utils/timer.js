
var exp = require('../utils/exception.js')
function timer() {
  setInterval(function () {

    //循环执行代码  
    if (wx.getStorageSync('active')) {
      console.log('打开定时器')
      console.log('定时器的keep请求')
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
        success: function (res) {
          if (res.data.errcode == 0) {
            console.log('定时器，会话已经存在')
            return
          }
          if (res.data.errcode == 1002) {  //登陆过期
            wx.showModal({
              title: '温馨提示',
              content: '登录已经过期',
              confirmText: '重新登录',
              cancelText: '暂不登陆',
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定')
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
                          console.log('会话过期，1min在定时器登录成功', res.data)
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
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }
            })

            return
          }

          else {
            exp.exception(res.data.errcode);
          }
        },
        fail: function (res) {

        },
        complete: function (res) {

        }
      })
    }
    wx.setStorageSync('active', false);
  }, 10000) //循环时间 这里是1分钟




}
module.exports = {
  timer: timer
}  