function exception(n){
  if(n==1012){
wx.showModal({
  title: '提醒',
  content: '设置消息为已读时，系统获取不到该消息',
  showCancel: false,
  confirmText: "我知道了"
})
return
  }
  if (n == 1011){
    wx.showModal({
      title: '提醒',
      content: '发送邀请时，找不到该图片',
      showCancel: false,
      confirmText: "我知道了"
    })
    return
  }
  if (n == 1010){
    wx.showModal({
      title: '温馨提示',
      content: '该图片未曾嵌入过不可见水印',
      showCancel: false,
      confirmText: "我知道了"
    })
    return
  }
  if(n==1009){
    wx.showModal({
      title: '温馨提示',
      content: '密码错误',
      showCancel: false,
      confirmText: "我知道了"
    })
    return
  }
  if(n==1008){
    wx.showModal({
      title: '温馨提示',
      content: '微信小程序登录时，采用的临时凭证有问题',
      showCancel: false,
      confirmText: "我知道了"
    })
    return
  }
  
  if(n==1007){
    wx.showModal({
      title: '温馨提示',
      content: '内容长度过长',
      showCancel: false,
      confirmText: "我知道了"
    })
    return
  }
  
  if(n==1006){
    wx.showModal({
      title: '温馨提示',
      content: '所采用的图像已经在该平台中嵌入了相关的水印或者已经注册过',
      showCancel: false,
      confirmText: "我知道了"
    })
    return
  }

  if (n == 1005) {
    wx.showModal({
      title: '温馨提示',
      content: '嵌入/提取算法进程运行异常，请联系开发者',
      showCancel: false,
      confirmText: "我知道了"
    })
    return
  }
  if (n == 1004) {
    wx.showModal({
      title: '温馨提示',
      content: '已经有不同的设备用此账号在登录，请检查个人信息',
      showCancel: false,
      confirmText: "我知道了"
    })
    return
  }
  if (n == 1003) {
    wx.showModal({
      title: '温馨提示',
      content: '服务器请求过程中缺少必需的数据',
      showCancel: false,
      confirmText: "我知道了"
    })
    return
  }
  if (n == 1) {
    wx.showToast({
      title: '服务器遇到了异常，请稍后再试',
      icon: 'none',
      duration: 2000
    })
    return
  }
  if (n == 1002) {
    /*
    wx.showModal({
      title: '温馨提示',
      content: '未登录或登录已经过期，请退出重新登录',
      showCancel: false,
      confirmText: "我知道了"
    })
    */
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
                  console.log('会话过期，登录成功', res.data)
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
                  console.log('登录完成')
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
  if (n == 1001) {
    wx.showModal({
      title: '温馨提示',
      content: '登录过程中出现异常，请退出重新登录',
      showCancel: false,
      confirmText: "我知道了"
    })
    return
  }
  if(n==1){
    wx.showToast({
      title: '服务器异常，请稍后重试',
      icon:'none',
      duration:2000,
      mask:true
    })
  }
  if (n == 1000) {
    wx.showToast({
      title: '系统出现异常',//出现Crp平台预期的异常
      icon: 'none',
      duration: 2000,
      mask:true
    })
    return
  }
  else{
    wx.showToast({
      title: '出现了不可预测的异常，请联系小程序开发者',//出现Crp平台预期的异常
      icon: 'none',
      duration: 2000,
      mask:true
    }) 
    return
  }
}

module.exports = {
  exception: exception
}  