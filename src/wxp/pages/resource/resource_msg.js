Page({

  /**
   * 页面的初始数据
   */
  data: {
    showTopTips: false,
    isAgree: false  //用来后面的错误提示
  },

  showTopTips: function () {    //这个就是点击确定按键的时候
    var that = this;
    this.setData({
      showTopTips: false 
    });
    setTimeout(function () {
      that.setData({
        showTopTips: false
      });
    }, 3000);
    wx.navigateBack();
  },

  bindAgreeChange: function (e) {
    this.setData({
      isAgree: !!e.detail.value.length
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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
    
  }
})