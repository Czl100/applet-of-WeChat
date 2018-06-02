var app=getApp();
var context;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    useKeyboardFlag:true,  //默认是键盘输入类型的输入框
    visible_chooseFiles:app.globalData.chooseFiles,
    dis:null,
   imgw:null,
   imgh:null
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   this.setData({
      visible_chooseFiles:app.globalData.chooseFiles,
      imgw:options.imgw,
      imgh:options.imgh
    })
   console.log(this.data.imgw, this.data.imgh)
  },

   Input: function(e){
    this.setData({
      dis:e.detail.value
    })
 //console.log(this.data.dis);

  },
   onsave: function () {
     //点击保存图片的时候
     wx.canvasToTempFilePath({
       canvasId: 'canvas',
       success: function (res1) {
         console.log(res1.tempFilePath);
         //把水印放进去之后，保存在手机相册
         wx.saveImageToPhotosAlbum({
           success(res) {
             console.log('保存相册成功')
             wx.showToast({
               title: '已保存于手机相册,',
               icon: 'success',
               duration: 3000
             });
           }
         })
       }
     })

    
     },
onsure:function(){
  context.drawImage(this.data.visible_chooseFiles, 0, 0, this.data.imgw, this.data.imgh);
  context.fillText(this.data.dis, 265, 350);
  context.setFontSize('50rpx');
  context.setFillStyle('#FFFFFF');
  context.draw()
  //console.log(this.data.imgw,this.data.imgh)
  

},
/*
oncancel:function(){
  wx.navigateBack()
},
*/
 
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (e) {
    context = wx.createCanvasContext('canvas');
    context.drawImage(this.data.visible_chooseFiles, 0, 0, this.data.imgw, this.data.imgh);
    context.draw()
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