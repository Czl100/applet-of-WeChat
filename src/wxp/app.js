//app.js
//var timer = require('../../utils/timer.js')
var exp = require('utils/exception.js')
App({
  onUnload: function () {
    wx.request({
      url: 'https://crp.shakeel.cn/session-destroy',
      method: 'GET',
      data: {
        sessionId: wx.getStorageSync('sessionId')
      },
      success: function (res) {
        if (res.data.errcode == 1000) {
          wx.showModal({
            title: '提示',
            content: res.data.errmsg,
            success: function (res1) {
              if (res1.confirm) {
                console.log('用户点击确定')
              } else if (res1.cancel) {
                console.log('用户点击取消')
              }
            }
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
          console.log('成功销毁')
        }
      },
      fail: function (res) {
        console.log('销毁失败')
      }
    })
  },


  onLaunch: function () {
    wx.showLoading({
      title: '正在检验授权情况',
      mask: true
    })
    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，说明缓存中已经获取了用户的信息
          //获取设备
          wx.request({
            url: 'https://crp.shakeel.cn/did',
            method: 'GET',
            data: {

            },
            header: {
              'content-type': 'application/x-www-form-urlencoded' // 默认值
            },
            success: function (res) {
              if (res.data.errcode == 0) {
                wx.setStorageSync('did', res.data.did);
                console.log('appjs，当进入检验已经授权的时候，获取设备的did', res.data.res);
              }
              else {
                exp.exception(res.data.errcode);
              }
            },
            fail:function(){
              wx.showToast({
                title: '获取设备的ID失败',
                icon:'none',
                duration:2000
              })
            },
            complete:function(){
              wx.hideLoading();
              console.log('获取设备结束')
            }
          })  //获取设备结束

          //下面会话
           // / 获取用户的信息之后，发送给后台，这个时候进行登录：
          // 登录,直接登录即可
          wx.login({
            success: res => {
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
                  console.log('在检验出小城授权成功之后，app登录完成')
                }
              })
            }

          })

        }
        else{
          //如果是没有授权的话
        //跳转到index进行授权
          wx.navigateTo({
            url: 'pages/index/index',
          })
        }
      }
    })

    //  wx.setStorageSync('active', true);
    // 展示本地存储能力
    var that = this
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

  },


  globalData: {  //全局变量
    userInfo: wx.getStorageSync('user'),  //记录用户信息
    chooseFiles: null,//保存已经选择的图片
    userimages: [],  //用于作为该用户的本地缓存

  }
})