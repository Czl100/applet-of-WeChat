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
   imgh:null,
   text_length:null
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
      dis:e.detail.value,
      text_length:e.detail.value.length  //获取水印文字的长度
    })
     

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
           },
           fail:function(res){
             wx.showToast({
               title: '不可抗因素导致保存失败',
               icon:'none',
               duration:2000
             })
           }
         })
       }
     })

    
     },

onsure:function(){
  var that=this;
 
  var w;
  var h;
  //this.data.imgw和imgh分别是图片的宽高
  if(this.data.imgw>this.data.imgh) 
  //如果图片的宽度比高度大的话，那么大小是由高度来决定，宽度和画布大小一样
    {
      w=350;
      h = this.data.imgh * w/this.data.imgw;
      console.log('宽度>高度',w,h);
     var start_y = (350 - h) / 2;
     var text_x=w-this.data.text_length*11-50;
     var text_y=(350-h)/2+h-20;
    }  
  else{
    h = 350;
    w = this.data.imgw * h/this.data.imgh;
    console.log('宽度<高度', w, h);
   var start_x = (350 - w) / 2;
   var text_y=h-20;
   var text_x=(350-w)/2+w-this.data.text_length*11-50;
  }
  if (that.data.text_length > 10) {
    //如果离线水印的长度大于10
    wx.showModal({
      title: '温馨提示',
      content: '用户最多可以输入10个字',
      confirmText: "确定",
      cancelText: "取消",
      success: function (res) {
        console.log(res);
        if (res.confirm) {
          console.log('确定');
          //    wx.navigateBack({})
          that.setData({

          })
        }
        else {
          console.log('取消');
          //   wx.navigateBack({})
        }
      }
    })
  }
  else{
  context.drawImage(this.data.visible_chooseFiles, start_x, start_y, w,h);
  context.setFontSize(20);
  context.fillText(this.data.dis, text_x, text_y);
  console.log(text_x,text_y);
  context.setFillStyle('#FFFFFF');
/*
  context.setStrokeStyle("#00ff00")
 
  context.stroke()
  context.setStrokeStyle("#ff0000")

  context.stroke()
*/
  context.draw()
  //console.log(this.data.imgw,this.data.imgh)
  
  }
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
    var w;
    var h;
    //this.data.imgw和imgh分别是图片的宽高
    if (this.data.imgw > this.data.imgh)
    //如果图片的宽度比高度大的话，那么大小是由高度来决定，宽度和画布大小一样
    {
      w = 350;
      h = this.data.imgh * w / this.data.imgw;
      console.log('宽度>高度', w, h)
      var start_y = (350 - h) / 2
    }
    else {
      h = 350;
      w = this.data.imgw * h / this.data.imgh;
      console.log('宽度>高度', w, h);
      var start_x = (350 - w) / 2
    }
    context = wx.createCanvasContext('canvas');
    context.drawImage(this.data.visible_chooseFiles, start_x, start_y, w, h);
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