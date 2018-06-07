var timer = require('../../utils/timer.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    Image: "/pages/icon/yes.png",
    title: '暂无标题',
  },
  onno: function () {
    wx.setStorageSync('active', true);
    timer.timer();
    wx.navigateBack();
  },
  onyes: function () {  //如果点击了粉丝留言
    wx.setStorageSync('active', true);
    timer.timer();
    var that = this;
    wx.navigateTo({
      url: 'resource_msg?imgid' + that.data.imgid
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setStorageSync('active', true);
    timer.timer();
    console.log(options)
    this.setData({
      imgid: options.imgid
    })
    if (!options.title)  //如果title不是空的话
    {
      this.setData({
        title: options.title,
      })
    }
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