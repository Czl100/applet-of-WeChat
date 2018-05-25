var Jmd5 = require('../../utils/md5.js')
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    invisible_chooseFiles: app.globalData.chooseFiles,
    dis: null,     //这个是水印的文字信息
    ser: null,     //这是嵌入的密码
    useKeyboardFlag: true,  //默认是键盘输入类型的输入框
  },
  Input_dis: function (e) {
    this.setData({
      dis: e.detail.value
    })
    console.log(this.data.dis);
  },
  Input_ser: function (e) {
    this.setData({
      ser: e.detail.value
    })
  },
  oncancel:function(){
    wx.navigateBack()
  },
  onsure: function () {
    var that=this;
    var key = Jmd5.hexMD5(this.data.ser);
    console.log(key);
   var sessionId=wx.getStorageSync('sessionId');
    wx.uploadFile({  //用户点击确定，那么就上传到服务器，进行不可见信息的嵌入
      url: 'http://localhost:5000/ih',
      //      method:'POST',
      filePath: that.data.invisible_chooseFiles,
      name: 'file',
      formData: {
        'sessionId': sessionId,   //附带用户的ID,图片隐藏的信息，发送到服务器
        'key':key,
        'secret': that.data.dis
      },
      success:function(res){
        console.log("嵌入水印成功",res.fg)
        app.globalData.userimages.push(that.data.invisible_chooseFiles);//当用户点击确定之后，将图片保存在本地缓存
       var ss= wx.setStorageSync('userimages',app.globalData.userimages);
        console.log(ss);
        wx.showToast({
          title: '嵌入成功,',
          icon: 'success',
          duration: 3000
        });
      },
      fail:function(){
        console.log("嵌入水印失败",res.msg),
        wx.showToast({
          title: '数据加载中',
          icon: 'loading',
          duration: 3000
        });
      }
    })
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