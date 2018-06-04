var pages=1;//总页数初始值
Page({

  /**
   * 页面的初始数据
   */
  data: { 
    mypage: 1,//默认查找第一页
    _number:0,//未邀请个数
  //  onread:false,//这是设置数据是否已读，默认是未读
    postList :[{
      inviteId:'',
      unread: false,
      inviter: '',
      imgtitle: '',
      img: "",
      datetime: '',
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
    var that=this;
    wx.request({
      url: 'http://localhost:5000/query-invites',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      method: 'GET',
      data: {
        'sessionId': wx.getStorageSync('sessionId'),
        'page': that.data.mypage
      },
      success: function (res) {
        console.log('查询成功', res.data.list);
        //将服务器反馈回来的数据存在数组当中
        //   remind_List:res.data.list;
        pages: res.data.pages
        that.setData({
          //    postList: remind_List
          postList: res.data.list
        })
      },
      fail: function (res) {
        console.log('查询失败')
      }
    })
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
    var that=this;
    wx.request({
      url: 'http://localhost:5000/query-invites',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      method: 'GET',
      data: {
        'sessionId': wx.getStorageSync('sessionId'),
        'page': that.data.mypage
      },
      success: function (res) {
        console.log('查询成功', res.data.list);
        //将服务器反馈回来的数据存在数组当中
        //   remind_List:res.data.list;
        pages: res.data.pages
        that.setData({
          //    postList: remind_List
          postList: res.data.list
        })
      },
      fail: function (res) {
        console.log('查询失败')
      }
    })
  },
  oncatch:function(e){ //当点击的时候,说明这个是已经读了
  console.log(e);
    console.log('id', e.currentTarget.id);
var that=this;
that.setData({
  unread:true
});
wx.request({
  url: 'http://localhost:5000/read-invite',
  mothod:'POST',
  header: {
    'content-type': 'application/x-www-form-urlencoded' // 默认值
  },
  data:{
    sessionId:wx.getStorageSync('sessionId'),
    inviteId: e.currentTarget.id
  },
  success:function(res){
    console.log('标记某个为已读'.res.data)
  }
});
    wx.request({
      url: 'http://localhost:5000/query-invites',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      method: 'GET',
      data: {
        'sessionId': wx.getStorageSync('sessionId'),
        'page': that.data.mypage
      },
      success: function (res) {
        console.log('查询成功', res.data.list);
        //将服务器反馈回来的数据存在数组当中
        //   remind_List:res.data.list;
        pages: res.data.pages
        that.setData({
          //    postList: remind_List
          postList: res.data.list
        })
      },
      fail: function (res) {
        console.log('查询失败')
      }
    })
  },
  onget:function(){ //点击全部已读,意思就是说告诉后台，这些数据用户已经读了
  var that=this;
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
    if(res.data)
  {//如果成功
    that.setData({
      unread:true //将onread设置为true
    })
    //将消息提醒那里设置为0
    wx.removeTabBarBadge({
      index:3
    });
  }
    wx.request({
      url: 'http://localhost:5000/query-invites',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      method: 'GET',
      data: {
        'sessionId': wx.getStorageSync('sessionId'),
        'page': that.data.mypage
      },
      success: function (res) {
        console.log('查询成功', res.data.list);
        //将服务器反馈回来的数据存在数组当中
        //   remind_List:res.data.list;
        pages: res.data.pages
        that.setData({
          //    postList: remind_List
          postList: res.data.list
        })
      },
      fail: function (res) {
        console.log('查询失败')
      }
    })
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
      url: 'http://localhost:5000/query-unread-number',
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        'sessionId': wx.getStorageSync('sessionId'),
      },
      success: function (res) {
        console.log('打开消息提醒时未邀请个数', res.data)
        wx.setStorageSync('_number', res.data.number);
        var number = wx.getStorageSync('_number');
        if (number == 0) {
          wx.removeTabBarBadge({
            index: 3
          });
        }
        else{
        wx.setTabBarBadge({
          index: 3,
          text: number+"",
        })
      }
      }
    })
    wx.request({
      url: 'http://localhost:5000/query-invites',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      method:'GET',
      data:{
        'sessionId':sessionId,
        'page':that.data.mypage
      },
      success:function(res){
        console.log('查询成功',res.data.list);
        //将服务器反馈回来的数据存在数组当中
     //   remind_List:res.data.list;
       pages=res.data.pages
       
        console.log('总页数pages', pages);
        console.log('服务器上的总页数', res.data.pages);
        that.setData({
      //    postList: remind_List
          postList: res.data.list
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