var app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    invisible_chooseFiles: app.globalData.chooseFiles,
    dis: null,
    useKeyboardFlag: true,  //默认是键盘输入类型的输入框
  },
  Input: function (e) {
    this.setData({
      dis: e.detail.value
    })
    console.log(this.data.dis);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      invisible_chooseFiles: app.globalData.chooseFiles
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
    
  }
})