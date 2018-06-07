//app.js
//var timer = require('../../utils/timer.js')

App({
  onUnload:function(){
wx.request({
  url: 'http://localhost:5000/session-destroy',
  method: 'GET',
  data: {
    sessionId: wx.getStorageSync('sessionId')
    },
    success:function(res){
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
    fail:function(res){
      console.log('销毁失败')
    }
})
  },
  onLaunch: function () {
    wx.setStorageSync('active', true);
    // 展示本地存储能力
    var that=this
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs) 
    
if(wx.getStorageSync('sessionId')){
  console.log('app.js-登录')
  // 登录
  wx.login({
    success: res => {
      // 发送 res.code 到后台换取 openId, sessionKey, unionId
      var did = wx.getStorageSync('did');
      var requrl = 'http://localhost:5000/session-build?code=' + res.code + "&did=" + did
      console.log(requrl)
      wx.request({
        url: 'http://localhost:5000/session-build/',
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
          // console.log('登陆返回', res.data)
          /*
          if (res.data.fg == false) { 
            console.log(res.data.msg)
            return
          }
          */
          console.log(res.data)
          wx.setStorageSync('sessionId', res.data.sessionId);


          //   console.log(res.data)
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
            wx.showModal({
              title: '注意',
              content: res.data.errmsg,
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }
            })
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
}

  },


  globalData: {  //全局变量
    userInfo:wx.getStorageSync('user'),  //记录用户信息
    chooseFiles:null,//保存已经选择的图片
   userimages:[],  //用于作为该用户的本地缓存
  
  }
})