//index.js
//获取应用实例
//var timer = require('../../utils/timer.js')
var exp = require('../../utils/exception.js')
const app = getApp()

Page({
  data: {
    motto: '欢迎使用',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs',
    })
  },
  onLoad: function () {
    console.log(app.globalData.userInfo);
    if (app.globalData.userInfo) {  //如果已经获取了用户的信息
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })

    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })

      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo;
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })

        }
      })
    }
  },

  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo
    //  console.log(app.globalData.userInfo)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true

    })

  },

  /**
   * 授权事件
   */
  getUserInfo: function (e) {
wx.showLoading({
  title: '正在授权',
  mask:true
})
    //授权成功
    if (e.detail.errMsg == "getUserInfo:ok") {
      wx.hideLoading();
      wx.showToast({
        title: '授权成功',
      });
      console.log('已经授权,(app.globalData.userInfo)是', app.globalData.userInfo);
      //授权成功就是获取设备ID
      wx.request({
        url: 'https://crp.shakeel.cn/did',
        method: 'GET',
        header: {
          'content-type': 'application/x-www-form-urlencoded' // 默认值
        },
        data: {

        },
        success: function (res) {

          if (res.data.errcode == 1) {
            wx.showToast({
              title: '服务器遇到了异常，请稍后再试',
              icon: 'none',
              duration: 2000
            })
            return
          }

          if (res.data.errcode == 0) {
            //这个时候会话创建成功
            console.log('获取设备成功', res.data.did);
            wx.showToast({
              title: '设备ID获取成功',
              icon: 'none',
              duration: 1500
            });
            wx.setStorageSync('did', res.data.did);//将设备的id存入缓存中
          }
          else {
            exp.exception(errcode);
          }
        },
        fail: function (res) {
          wx.hideToast();
          console.log('获取设备ID失败,服务器无法进行处理');
          wx.showToast({
            title: '获取设备ID失败',
            icon: 'none',
            duration: 2000
          });
        },
        complete: function () {
          console.log('获取设备的did', wx.getStorageSync('did'))
          if (!wx.getStorageSync('did') == "")  //如果已经获取了设备的ID，那么就登录
          {
            console.log('index-js登录', wx.getStorageSync('sessionId'))
            // 登录
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
                    console.log('index登录完成')
                  }
                })
              }

            })
            // 获取用户信息
            wx.getSetting({
              success: res => {
                if (res.authSetting['scope.userInfo']) {
                  // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框

                  wx.getUserInfo({  //如果获取了用户的信息
                    success: res => {

                      // 可以将 res 发送给后台解码出 unionId
                      wx.setStorageSync('user', res.userInfo);//存进缓存
                      console.log('用户信息',app.globalData.userInfo);
                      // this.globalData.userInfo = res.userInfo;
                      //  console.log(res.userInfo)

                      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                      // 所以此处加入 callback 以防止这种情况
                      if (this.userInfoReadyCallback) {
                        this.userInfoReadyCallback(res)
                      }
                    }
                  })
                }
              }
            })

            setTimeout(function () {
              wx.navigateBack({})
            }, 700)

            console.log('index-js登录后', wx.getStorageSync('sessionId'))
          }

          else {
            //如果没有获取到设备的信息did{}
            wx.showModal({
              title: '注意',
              content: '服务器无法获取设备的唯一ID，请重新授权',
              confirmText: "确定",
              cancelText: "取消",
              success: function (res) {
                console.log(res);
                if (res.confirm) {
                  console.log('确定')
                  wx.navigateBack();
                } else {
                  console.log('取消')
                  wx.navigateBack();
                }
              }
            })
          }
        }
      })


    }
    else {
      wx.hideLoading();
      wx.showToast({
        title: '授权后才可以使用该小程序',
        icon: 'none',
        duration: 2000
      })
    }
  },
  onReady:function(res){
    
  }


})
