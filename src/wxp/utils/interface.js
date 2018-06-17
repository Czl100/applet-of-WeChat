

function Toast_Remind(n,icon){
  wx.showToast({
    title:n ,
    icon: icon,
    duration: 2000,
    mask:true
  })
}

function Know_Modal(n){
  wx.showModal({
    title: '温馨提示',
    content: n,
    showCancel: false,
    mask: true,
    confirmText: "我知道了"
  })
}

function S_C(n,know,cancel){
  wx.showModal({
    title: '温馨提示',
    mask: true,
    content: n,
    confirmText:know,
    cancelText:cancel,
    success: function (res) {
      if (res.confirm) {
        console.log('用户点击确定')
        wx.navigateBack();
      } else if (res.cancel) {
        console.log('用户点击取消')
        wx.navigateBack();
      }
    }
  })  
}

module.exports = {
 Toast_Remind:Toast_Remind,
 Know_Modal:Know_Modal,
 S_C:S_C
}