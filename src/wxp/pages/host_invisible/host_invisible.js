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
  //  console.log(this.data.dis);
  },
  Input_ser: function (e) {
    this.setData({
      ser: e.detail.value
    })
  },
  onget:function(){  //提取水印信息
 //   wx.navigateBack()
 var that=this;
 //var sessionId=wx.getStorageSync(sessionId);
 var file=app.globalData.chooseFiles;
 wx.request({
   url: 'http://localhost:5000/ix',
   method:'POST',
   data:{
     'sessionId': wx.getStorageSync(sessionId),
      'file':file,
      'key':that.data.ser  //输入的密码
   },
   success:function(res){
     console.log('获取水印信息',res.data);
     wx.showModal({
       title: '水印信息',
       content: res.data.secret,
       confirmText: "确定",
       cancelText: "取消",
       success: function (res) {
         console.log(res);
         if (res.confirm) {
           console.log('确定')
           wx.navigateBack();
         } else {
           console.log('取消')
           wx.navigateBack();
         }
       }
     });
   },
   fail:function(res){
     console.log('获取失败，服务器无法进行处理')
   }
 })
  },
  onsure: function () {
    var that=this;
    var key = Jmd5.hexMD5(this.data.ser);
    console.log(key);
   var sessionId=wx.getStorageSync('sessionId');
   console.log(that.data.invisible_chooseFiles);
    wx.uploadFile({ //用户点击确定，那么就上传到服务器，进行不可见信息的嵌入
      url: 'http://localhost:5000/ih',
       method:'POST',
      filePath: that.data.invisible_chooseFiles,
      name: 'file',
      formData: {
        'sessionId': sessionId,     //附带用户的ID,图片隐藏的信息，发送到服务器
        'key':key, //这个通过md5加密过之后的key(用户输入的密码)
        'secret': that.data.dis     //这个是嵌入水印的密文信息
      },
      success:function(res){
        res.data = JSON.parse(res.data);
        console.log("嵌入成功",res.data)

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
        console.log("嵌入水印失败"),
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