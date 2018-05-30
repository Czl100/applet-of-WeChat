var pages=1;//总页数初始值
var remind_List;
Page({

  /**
   * 页面的初始数据
   */
  data: { 
    mypage: 1,//默认查找第一页
    postList :[{
      inviteId:'',
      uread: '',
      inviter: '',
      imgtitle: '',
      img: "",
     date: '',
      content: ''
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
    if (this.data.mypage < pages) {
      this.setData({
        mypage: this.data.mypage + 1
      })
    }
    else {
      this.setData({
        mypage: pages
      })
    }
  },
  onget:function(){ //点击全部已读
wx.request({
  url: 'http://localhost:5000/read-all-invites',
  method:'POST',
  header: {
    'content-type': 'application/x-www-form-urlencoded' // 默认值
  },
  data:{
    'sessionId':wx.getStorageSync('sessionId')
  },
  success:function(res){
    console.log('全部已读发送到服务端',res.data)
  },
  fail:function(res){
    console.log('失败')
  }
})
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
    wx.setNavigationBarTitle({
      title: '消息提醒',
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that=this;
    var sessionId=wx.getStorageSync('sessionId');
    wx.request({
      url: 'http://localhost:5000/query-invites',
      method:'GET',
      data:{
        'sessionId':sessionId,
        'page':1
      },
      success:function(res){
        console.log('查询成功',res.data);
        //将服务器反馈回来的数据存在数组当中
        remind_List:res.data.lists;
        pages:res.data.pages
        that.setData({
          postList: remind_List
        })
      },
      fail:function(res){
        console.log('查询失败')
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