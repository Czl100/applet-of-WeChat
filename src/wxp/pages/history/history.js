var app = getApp();
var List_;
var pages=1;
Page({

  /**
   * 页面的初始数据
   */
  data: {
   // pages:1,//初始值总页数是1
   mypage: 1,//默认查找第一页
    
    postList:[{
      datetime:'',
      finish: '',
      img: "",
      imgtitle: '暂无标题',
      imgtype:''
    }]
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
    console.log('点击上一页',this.data.mypage)
    wx.request({
      url: 'http://localhost:5000/query-history',
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        'sessionId': wx.getStorageSync('sessionId'),
        'page': that.data.mypage
      },
      success: function (res) {
        console.log('发送查询历史信息请求', res.data),
          List_ = res.data.list
        console.log(List_)  //打印出来看看
        //总页数
        pages = res.data.pages
        that.setData({
          postList: List_
        })
        console.log('总页数pages', pages);
        console.log('服务器上的总页数', res.data.pages);
      }
    })
  },
  onafter: function () { //点击下一页
    console.log(this.data.mypage, pages);
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
    console.log('点击下一页', this.data.mypage)
    wx.request({
      url: 'http://localhost:5000/query-history',
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        'sessionId': wx.getStorageSync('sessionId'),
        'page': that.data.mypage
      },
      success: function (res) {
        console.log('发送查询历史信息请求', res.data),
          List_ = res.data.list
        console.log(List_)  //打印出来看看
        //总页数
        pages = res.data.pages
        that.setData({
          postList: List_
        })
        console.log('总页数pages', pages);
        console.log('服务器上的总页数', res.data.pages);
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */

  onShow: function () {
    var that = this;
    var sessionId=wx.getStorageSync('sessionId');
    
    console.log('发送到服务器的页数',that.data.mypage)
wx.request({ 
  url: 'http://localhost:5000/query-history',
  method:'GET',
  header: {
    'content-type': 'application/x-www-form-urlencoded' // 默认值
  },
  data:{
      'sessionId':sessionId,
      'page':that.data.mypage
  },
  success:function(res){
    console.log('发送查询历史信息请求',res.data),
    List_=res.data.list
    console.log(List_)  //打印出来看看
    //总页数
      pages=res.data.pages
      that.setData({
        postList:List_  
      })
     console.log('总页数pages',pages);
     console.log('服务器上的总页数',res.data.pages);
  }
})
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
        console.log('打开历史记录时查询未邀请个数', res.data)
        wx.setStorageSync('_number', res.data.number);
        wx.setTabBarBadge({
          index: 3,
          text: 'number',
        })
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