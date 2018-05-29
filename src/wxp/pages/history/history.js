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
      finish: '',
      img: "",
      imgtitle: '',
      date: '',
      imgtype:''
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
  if(this.data.mypage<pages){
    this.setData({
      mypage: this.data.mypage + 1
    })}
else{
    this.setData({
      mypage: pages
    })
}
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
    this.setData({
      postList: List_  //数据刷新
    })
    var sessionId=wx.getStorageSync('sessionId');
wx.request({
  url: 'http://localhost:5000/query-history',
  method:'GET',
  header: {
    'content-type': 'application/x-www-form-urlencoded' // 默认值
  },
  data:{
      'sessionId':sessionId,
      'page':this.data.mypage
  },
  success:function(res){
    console.log('发送查询历史信息请求',res.data),
    List_=res.data.lists
    console.log(List_)  //打印出来看看
    //总页数
   
      pages:res.data.pages
  
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