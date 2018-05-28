var app=getApp();

Page({
  data: {
    files: [], //这个文件用来放这个界面的图片
   
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    this.setData({
      files: (wx.getStorageSync('userimages')),

    })
  //  console.log(this.data.files)
  },
  
  previewImage: function (e) {
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.files // 需要预览的图片http链接列表
    })
  }
});