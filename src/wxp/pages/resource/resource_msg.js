var content;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showTopTips: false,//用来后面的错误提示
    isAgree: false,  
   // content:null  //用来进行相关的文本，字数是140个
  //  imgid=null
  },
  Input_content: function (e) {  //获取留言框中的信息content
    content = e.detail.value
    // console.log(content)
  },
  showTopTips: function () {    //这个就是点击确定按键的时候
    var that = this;
    var imgid=wx.getStorageSync('imgid');     //从缓存中吧imgid取出来
    var sessionId=wx.getStorageSync('sessionId');
    //将用户的id,imgid,content都发送到服务器上
    wx.request({
      url: 'http://localhost:5000/invite',
      method:'POST',
    
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data:{
        'sessionId':sessionId,
        'imgid':imgid,
        'content':content //留言信息发送到服务器
      },
      success:function(res){
        console.log('发送邀请成功',res.data.fg)
      },
      fail:function(res){
        console.log('发送邀请失败',res.data.msg)
      }     
    })
    if(!this.data.isAgree){  //如果不同意，那么显示顶部栏错误提示
    this.setData({
      showTopTips: true 
    });
    setTimeout(function () {
      that.setData({
        showTopTips: false
      });
    }, 3000);
    }
    else  //如果符合条件的输入，那么则返回，这个时候可以给用户一个提示
    {
      wx.showToast({
        title: '留言已经发送,',
        icon: 'success',
        duration: 3000
      });
      wx.navigateBack();
    }
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