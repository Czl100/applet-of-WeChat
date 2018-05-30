var app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    Image: "/pages/icon/camera.png",//这是原始的icon
    imageWidth: 0,
    imageHeight: 0  
  },
 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },
  chooseImage: function (event) {
     var that = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: 'original', // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        that.setData({
         chooseFiles:res.tempFilePaths[0]
        });
        app.globalData.chooseFiles=res.tempFilePaths[0]
      }

    })
    
   
  },
  
  imageLoad: function (e) {
    //获取图片的原始宽度和高度  
    let originalWidth = e.detail.width;
    let originalHeight = e.detail.height;

    this.setData({
      imageWidth: originalWidth,
      imageHeight: originalHeight
    });
    
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
    wx.request({
      url: 'http://localhost:5000/query-unread-number',
      method: 'GET',
      data: {
        'sessionId': wx.getStorageSync('sessionId'),
      },
      success: function (res) {
        console.log('打开图片版权页面的时候未邀请个数', res.data)
        wx.setStorageSync('_number', res.data.number);
        wx.setTabBarBadge({
          index: 3,
          text: 'number',
        })
      }
    })
    // 检验是否授权
    wx.getSetting({
      success: function (res) {
        if (!res.authSetting['scope.userInfo']) {
          wx.navigateTo({
            url: '/pages/index/index',
          })
        } else {
         
          wx.getUserInfo({
            success: function (res) {
             // console.log(res.userInfo)
             
            }
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
   // console.log(this.data.imageWidth)
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
    
  },

 
  onJump_host_visible:function(event){
    var that=this;
    wx.navigateTo({
      url: '../host_visible/host_visible?imgw=' + that.data.imageWidth + '&imgh=' + that.data.imageHeight,  
      //将数据传送过去
      success: function () {
        console.log("可见水印页面","jump succcess")
      },
      fail: function () {
        console.log("可见水印页面","jump failed")
      },
      complete: function () {
        console.log("可见水印页面","jump complete")
      }
    });
    console.log(that.data.imageWidth, that.data.imageHeight);
  },
  onJump_host_invisible: function (event) {
    wx.navigateTo({
      url: '../host_invisible/host_invisible',
      success: function () {
        console.log("不可见水印页面","jump succcess")
      },
      fail: function () {
        console.log("jump failed")
      },
      complete: function () {
        console.log("不可见水印页面","jump complete")
      }
    });
  },
  onJump_host_resign: function (event) {
    wx.navigateTo({
      url: '../host_resign/host_resign',
      success: function () {
        console.log("注册绑定","jump succcess")
      },
      fail: function () {
        console.log("注册绑定","jump failed")
      },
      complete: function () {
        console.log("注册绑定","jump complete")
      }
    });
  }
})