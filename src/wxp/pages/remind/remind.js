
Page({

  /**
   * 页面的初始数据
   */
  data: { 
    mypage: 1,//默认查找第一页
    postList :[{
      inviter: "邀请人",
      image: "../icon/camera.png",
      title:"图片",
      date: "2018 09 09",
      comment: "你好早上好呀"
    },
    {
      inviter: "邀请人",
      title: "图片",
      image: "../icon/camera.png",
      date: "2018 09 09",
      comment: "你好早上好呀"
    }]
  },
  onbefore: function () { //点击上一页
    if (this.data.mypage > 1) {
      this.setData({
        mypage: this.data.mypage - 1
      })
    }
    else {
      //如果页数小于0
      this.setData({
        mypage: 1
      })
    }
  },
  onafter: function () { //点击下一页
    this.setData({
      mypage: this.data.mypage + 1
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      postList:postList
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.setNavigationBarTitle({
      title: '消息提醒',
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var sessionId=wx.getStorageSync('sessionId');
    wx.request({
      url: 'http://localhost:5000/query-invites',
      method:'POST',
      data:{
        'sessionId':sessionId,
        'page':1
      },
      success:function(res){
        console.log('查询成功',res.data.fg)
        //将服务器反馈回来的数据存在数组当中
      },
      fail:function(res){
        console.log('查询失败',res.data.msg)
      }
    })
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