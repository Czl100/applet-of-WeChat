//app.js

App({
  onLaunch: function () {
    // 展示本地存储能力
    var that=this
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs) 

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        var requrl = 'http://localhost:5000/sessionBuild/' + res.code
        console.log(requrl)
       wx.request({
         url: 'http://localhost:5000/sessionBuild/' + res.code,
         url: requrl,
         data: {
          //将用户信息发送上服务器
         },
         header: {
           'content-type': 'application/json' // 默认值
         },
         success: function (res) {
           // console.log('登陆返回', res.data)
           if (res.data.fg == false) {
             console.log(res.data.msg)
             return
           }
           console.log(res.data)
           wx.setStorageSync('sessionId', res.data.sessionId);


        //   console.log(res.data)
           console.log('=================session success=================')
          console.log(res.data.fg)
          if (res.data.fg) {
            console.log(res.data.sessionId)
          } else {
            console.log(res.data.msg)
          }

         },
         fail:function(res){
           console.log('=================session fail=================')
         },
         complete:function(res){
         
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
              this.globalData.userInfo = res.userInfo;
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
   
  },

  globalData: {  //全局变量
    userInfo:null,  //记录用户信息
    chooseFiles:null,//保存已经选择的图片
   userimages:[]  //用于作为该用户的本地缓存
  }
})