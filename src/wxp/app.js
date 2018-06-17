//app.js
var timer = require('utils/timer.js')
var exp = require('utils/exception.js')
var inter = require('utils/interface.js')
var Request = require('utils/request.js')
App({
  onHide: function () {
    // console.log('关闭定时器')
    // wx.setStorageSync('active', false);
  },
  onUnload: function () {

    console.log("app.js - onload")
    //请求销毁
   Request.Destory();
  },

  onLaunch: function () {
    wx.setStorageSync('un-line', true);
    console.log('进入小程序')
    if (!wx.getStorageSync('sessionId') == "") {  //找sessionId是否存在
      console.log('会话已经存在，有sessionId')
      wx.request({
        url: 'https://crp.shakeel.cn/session-keep',
        method: 'GET',
        data: {
          'sessionId': wx.getStorageSync('sessionId'),
        },
        success: function (res) {
          if (res.data.errcode == 0) {
            Request.Unread_Number();
            return
          }
          if (res.data.errcode == 1002) {
            wx.showModal({
              title: '提示',
              content: '请选择登录或者离线使用',
              confirmText: '同意登录',
              cancelText: '离线使用',
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                  wx.showLoading({
                    title: '正在登录',
                    mask: true,
                  })
                  //设备id获取，sessionId获取
                  //获取设备ID并且进行登录
                  Request.Get_Did();

                } else if (res.cancel) {
                  wx.hideLoading();
                  console.log('用户点击取消')
                }
              }
            })

            return
          }
          else {
            wx.hideLoading();
            exp.exception(res.data.errcode);
          }
        },
        fail: function (res) {
          wx.hideLoading();
          inter.Toast_Remind('请保持网络通畅','none')
        }
      })
    }
    else {
      //这个时候会话是不存在的

      wx.showModal({
        title: '提示',
        content: '请选择登录或者离线使用',
        confirmText: '同意登录',
        cancelText: '离线使用',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
            wx.showLoading({
              title: '正在登录',
              mask: true,
            })
            //设备id获取，sessionId获取
            Request.Get_did();

          } else if (res.cancel) {
            wx.hideLoading();
            console.log('用户点击取消')
            //如果是离线使用
            wx.setStorageSync('un-line', false);
          }
        }
      })
    }

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