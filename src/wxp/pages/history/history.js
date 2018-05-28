var app = getApp();
var List_;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mypage: 1//默认查找第一页
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
var postList=[{
  finish:true,
  img:"/pages/icon/camera.png",
  title:'我的标题',
  date:'2018 09 01'
}]
this.setData({
  postList:List_  //数据刷新
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
    var sessionId=wx.getStorageSync('sessionId');
wx.request({
  url: 'http://localhost:5000/query-history',
  method:'GET',
  data:{
      'sessionId':sessionId,
      'page':this.data.mypage
  },
  success:function(res){
    console.log('发送查询历史信息请求',res.data),
    List_=res.data.lists
    console.log(List_)  //打印出来看看
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