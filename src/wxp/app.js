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
      title: '正在检验授权',
      mask: true
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