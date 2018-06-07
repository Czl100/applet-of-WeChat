function timer(){

setTimeout(function () {
  
  if(wx.getStorageSync('active'))
  {
    console.log('计时器打开')
    //如果1分钟active是true的话，那么就发送请求告诉服务器，将会话合并，只要aging设备有活动
    wx.setStorageSync('active', false);
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
              console.log('定时器里登录',res.data.sessionId);
             
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
  }
}, 10000)

}
module.exports = {
  timer: timer
}  