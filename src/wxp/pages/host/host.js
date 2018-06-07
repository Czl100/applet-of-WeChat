var timer = require('../../utils/timer.js')
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

    start: false,       //默认是不能开始的
    Image: "/pages/icon/camera.png",//这是原始的icon
    imageWidth: 0,
    imageHeight: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setStorageSync('active', true);
    timer.timer();
  },
  chooseImage: function (event) {
    wx.setStorageSync('active', true);
    timer.timer();
    var that = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: 'original', // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {

        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        that.setData({
          chooseFiles: res.tempFilePaths[0],
          start: true
        });
        app.globalData.chooseFiles = res.tempFilePaths[0]
        //获取图片的宽高
        wx.getImageInfo({
          src: res.tempFilePaths[0],
          success: function (res) {
            that.setData({
              imageWidth: res.width,
              imageHeight: res.height
            })
            //console.log(res.width)
            //  console.log(res.height)
          }
        })
      }

    })


  },

  imageLoad: function (e) {
    wx.setStorageSync('active', true);
    timer.timer();
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

    if (!wx.getStorageSync('sessionId') == "") {
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
          console.log('host界面的消息提醒', res.data.errcode, res.data.errmsg);
          if (res.data.errcode == 0) {
            console.log('打开的时候消息提醒的个数', res.data.number)
            wx.setStorageSync('_number', res.data.number);
            var number = wx.getStorageSync('_number');
            console.log(number);
            if (number == 0) {
              wx.removeTabBarBadge({
                index: 3
              });
            }
            else {
              wx.setTabBarBadge({
                index: 3,
                text: number + "",
              })
            }
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
          else {
            console.log(res.data.errmsg);
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
          }
        },
        fail: function (res) {

        }
      })
    } //如果sessionId存在
    else {
      wx.showToast({
        title: '用户正进行登录并授权',
        icon: 'loading',
        duration: 3000
      })

      // 检验是否授权
      wx.getSetting({
        success: function (res) {
          wx.hideToast();
          if (!res.authSetting['scope.userInfo']) {  //如果还没有授权的话
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

    }
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


  onJump_host_visible: function (event) {

    wx.setStorageSync('active', true);
    timer.timer();
    if (this.data.start) //如果选择了图片
    {
      var that = this;
      wx.navigateTo({
        url: '../host_visible/host_visible?imgw=' + that.data.imageWidth + '&imgh=' + that.data.imageHeight,
        //将数据传送过去
        success: function () {
          console.log("可见水印页面", "jump succcess")
        },
        fail: function () {
          console.log("可见水印页面", "jump failed")
        },
        complete: function () {
          console.log("可见水印页面", "jump complete")
        }
      });
      console.log(that.data.imageWidth, that.data.imageHeight);
    }
    else {
      //如果没有选择
      wx.showToast({
        title: '请先选择图片',
        icon: 'none',
        duration: 2000
      })
    }
  },
  onJump_host_invisible: function (event) {
    wx.setStorageSync('active', true);
    timer.timer();
    if (this.data.start) {
      wx.navigateTo({
        url: '../host_invisible/host_invisible',
        success: function () {
          console.log("不可见水印页面", "jump succcess")
        },
        fail: function () {
          console.log("jump failed")
        },
        complete: function () {
          console.log("不可见水印页面", "jump complete")
        }
      });
    }
    else {
      //如果没有选择
      wx.showToast({
        title: '请先选择图片',
        icon: 'none',
        duration: 2000
      })
    }
  },
  onJump_host_resign: function (event) {
    wx.setStorageSync('active', true);
    timer.timer();
    if (this.data.start) {
      wx.navigateTo({
        url: '../host_resign/host_resign',
        success: function () {
          console.log("注册绑定", "jump succcess")
        },
        fail: function () {
          console.log("注册绑定", "jump failed")
        },
        complete: function () {
          console.log("注册绑定", "jump complete")
        }
      });
    }
    else {
      //如果没有选择
      wx.showToast({
        title: '请先选择图片',
        icon: 'none',
        duration: 2000
      })
    }
  }
})