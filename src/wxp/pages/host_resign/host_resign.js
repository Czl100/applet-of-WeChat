var app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    Image: "/pages/icon/camera.png",
    resign_chooseFiles: app.globalData.chooseFiles, 
    dis: "",
    useKeyboardFlag: true,  //默认是键盘输入类型的输入框
  },
  onpre: function () {
    wx.previewImage({
      current: 'app.global.chooseFiles', // 当前显示图片的http链接
      urls: [app.globalData.chooseFiles],
    })
  },
  Input: function (e) {
    this.setData({
      dis: e.detail.value
    })
 //   console.log(this.data.dis);
  },
  oncancel:function(){
wx.navigateBack()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      resign_chooseFiles: app.globalData.chooseFiles
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  },

  onsure:function(){
    wx.showToast({
      title: '正在处理',
      icon: 'loading',
      duration: 10000
    });
   var  that=this;
   var  sessionId = wx.getStorageSync('sessionId');
    wx.uploadFile({
      url: 'http://localhost:5000/img-bind',
      filePath: that.data.resign_chooseFiles,  //将图片上传
      name:'img',   
      method:'POST',
      formData: {
        'sessionId': sessionId,   //附带用户的ID,图片隐藏的信息，发送到服务器
        'imgtitle': that.data.dis
      },
      success: function (res) {
        wx.hideToast();
        res.data = JSON.parse(res.data);
        if(res.data.errcode==1000){
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
        if(res.data.errcode==1){
          wx.showToast({
            title: '服务器遇到了异常，请稍后再试',
            icon: 'none',
            duration: 2000
          })
          return
        }
        else{
        console.log("图片上传成功", res.data);
      //  console.log("图片上传成功", res.fg);
        app.globalData.userimages.push(that.data.resign_chooseFiles),//将这张图片放在全局变量中（数组—）
        wx.setStorageSync('userimages', app.globalData.userimages); //数组放进缓存
        wx.showToast({
          title: '图片绑定成功',
          icon: 'success',
          duration: 3000
        });
        return
        }
      },
      fail: function (res) {
        wx.hideToast();
        console.log("图片上传失败");
        wx.showToast({
          title: '绑定失败',
          icon: 'none',
          duration: 2000
        });
      }
    })
  }
})