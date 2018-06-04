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

   img_unfinish:"/pages/icon/unfinished.png" ,//如果是未完成时的图片
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
        if(res.data.errcode==1000){
          console.log('历史记录界面',res.data.errmsg);
          wx.showModal({
            title: '提示',
            content: res.data.errmsg,
            success: function (res1) {
              if (res1.confirm) {
                console.log('用户点击确定')
              } else if (res1.cancel) {
                console.log('用户点击取消')
              }
            }
          })
          return
        }
        if(res.data.errcode==1){
          wx.showToast({
            title: '服务器遇到了异常，请稍后再试',
            icon: 'none',
            duration: 2000
          })
          return
        }
        else{
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
        return 
        }
      },
      fail:function(res){
        wx.showToast({
          title: '请保持网络通畅',
          icon:'none',
          duration:2000
        })
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
        if (res.data.errcode == 1000) {
          console.log('历史记录界面', res.data.errmsg);
          wx.showModal({
            title: '提示',
            content: res.data.errmsg,
            success: function (res1) {
              if (res1.confirm) {
                console.log('用户点击确定')
              } else if (res1.cancel) {
                console.log('用户点击取消')
              }
            }
          })
          return
        }
        if (res.data.errcode == 1) {
          wx.showToast({
            title: '服务器遇到了异常，请稍后再试',
            icon: 'none',
            duration: 2000
          })
          return
        }
        else{
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
      },
      fail:function(res){
        wx.showToast({
          title: '请保持网络通畅',
          icon: 'none',
          duration: 2000
        })
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
 
    if (res.data.errcode == 1000) {
      console.log('历史记录界面', res.data.errmsg);
      wx.showModal({
        title: '提示',
        content: res.data.errmsg,
        success: function (res1) {
          if (res1.confirm) {
            console.log('用户点击确定')
          } else if (res1.cancel) {
            console.log('用户点击取消')
          }
        }
      })
      return
    }
    if (res.data.errcode == 1) {
      wx.showToast({
        title: '服务器遇到了异常，请稍后再试',
        icon: 'none',
        duration: 2000
      })
      return
    }
    else{
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
  },fail:function(res){
    wx.showToast({
      title: '请保持网络通畅',
      icon: 'none',
      duration: 2000
    })
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
        if (res.data.errcode == 1000) {
          console.log('历史记录界面', res.data.errmsg);
          wx.showModal({
            title: '提示',
            content: res.data.errmsg,
            success: function (res1) {
              if (res1.confirm) {
                console.log('用户点击确定')
              } else if (res1.cancel) {
                console.log('用户点击取消')
              }
            }
          })
          return
        }
        if (res.data.errcode == 1) {
          wx.showToast({
            title: '服务器遇到了异常，请稍后再试',
            icon: 'none',
            duration: 2000
          })
          return
        }
        else{
        console.log('打开历史记录时查询未邀请个数', res.data)
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
      return
      }
      },fail:function(res){
        wx.showToast({
          title: '请保持网络通畅',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
onpre:function(e){
  wx.previewImage({
    current: e.detail.image, // 当前显示图片的http链接
    urls: ['e.image'],// 需要预览的图片http链接列表
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