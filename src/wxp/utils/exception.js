function exception(n){
  if(n==1012){
wx.showModal({
  title: '提醒',
  content: '设置消息为已读时，系统获取不到该消息',
  success: function (res) {
    if (res.confirm) {
      console.log('用户点击确定')
    } else if (res.cancel) {
      console.log('用户点击取消')
    }
  }
})
return
  }
  if (n == 1011){
    wx.showModal({
      title: '提醒',
      content: '发送邀请时，找不到该图片',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    return
  }
  if (n == 1010){
    wx.showModal({
      title: '温馨提示',
      content: '该图片未曾嵌入过不可见水印',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    return
  }
  if(n==1009){
    wx.showModal({
      title: '温馨提示',
      content: '密码错误',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    return
  }
  if(n==1008){
    wx.showModal({
      title: '温馨提示',
      content: '微信小程序建立会话时，采用的临时凭证code有问题导致的异常',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    return
  }
  
  if(n==1007){
    wx.showModal({
      title: '温馨提示',
      content: '内容长度过长',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    return
  }
  
  if(n==1006){
    wx.showModal({
      title: '温馨提示',
      content: '所采用的图像已经在该平台中嵌入了相关的水印或者已经注册过',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    return
  }

  if (n == 1005) {
    wx.showModal({
      title: '温馨提示',
      content: '嵌入/提取算法进程运行异常，请联系开发者',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    return
  }
  if (n == 1004) {
    wx.showModal({
      title: '温馨提示',
      content: '已经有不同的设备用此账号在登录，请检查个人信息',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    return
  }
  if (n == 1003) {
    wx.showModal({
      title: '温馨提示',
      content: '服务器请求过程中缺少必需的数据',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    return
  }
  if (n == 1002) {
    wx.showModal({
      title: '温馨提示',
      content: '未登录或登录已经过期，请退出重新登录',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
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
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    return
  }
  if(n==1){
    wx.showToast({
      title: '服务器异常，请稍后重试',
      icon:'none',
duration:2000
    })
  }
  if (n == 1000) {
    wx.showToast({
      title: '出现Crp平台预期的异常',
      icon: 'none',
      duration: 2000
    })
  }
}

module.exports = {
  exception: exception
}  