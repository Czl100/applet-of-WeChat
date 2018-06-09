var timer = require('../../utils/timer.js')
var exp = require('../../utils/exception.js')
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

  /*

    // 查看是否授权
    wx.getSetting({
      
      success: function (res) {
        console.log('加载host')
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，说明缓存中已经获取了用户的信息
          wx.hideLoading();
          //获取设备
          wx.request({
            url: 'https://crp.shakeel.cn/did',
            method: 'GET',
            data: {

            },
            header: {
              'content-type': 'application/x-www-form-urlencoded' // 默认值
            },
            success: function (res) {
              if (res.data.errcode == 0) {
                wx.setStorageSync('did', res.data.did);
                console.log('hostjs，当进入检验已经授权的时候，获取设备的did', res.data.res);
              }
              else {
                exp.exception(res.data.errcode);
              }
            },
            fail: function (res) {
              wx.showToast({
                title: '获取设备的ID失败',
                icon: 'none',
                duration: 2000
              })
            },
            complete: function (res) {
              wx.hideLoading();
              console.log('获取设备结束')
            }
          })  //获取设备结束

          //下面会话
          // / 获取用户的信息之后，发送给后台，这个时候进行登录：
          // 登录,直接登录即可
          wx.login({
            success: res => {
              // 发送 res.code 到后台换取 openId, sessionKey, unionId
              var did = wx.getStorageSync('did');
              var requrl = 'https://crp.shakeel.cn/session-build?code=' + res.code + "&did=" + did
              console.log(requrl)
              wx.request({
                url: 'https://crp.shakeel.cn/session-build/',
                url: requrl,
                header: {
                  'content-type': 'application/x-www-form-urlencoded' // 默认值
                },
                data: {
                  //将用户信息发送上服务器
                  'code': res.code,
                  'did': did
                },
                header: {
                  'content-type': 'application/json' // 默认值
                },
                success: function (res) {
                  console.log('host.js文件', res.data)
                  wx.setStorageSync('sessionId', res.data.sessionId);
                  console.log('=================session success=================')
                  // console.log(res.data.fg)
                  if (res.data.errcode == 0) {  //如果登录成功
                    console.log(res.data.sessionId);
                    wx.showToast({
                      title: '登录成功',
                      icon: 'success',
                      duration: 2000
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

                  else {
                    exp.exception(res.data.errcode)
                  }

                },
                fail: function (res) {
                  console.log('=================session fail=================')
                  wx.showToast({
                    title: '请连接服务器',
                    icon: 'none',
                    duration: 2000
                  })
                },
                complete: function (res) {
                  console.log('在检验出小城授权成功之后，app登录完成')
                }
              })
            }

          })

        }
        //如果没有授权的话，提醒用户没有授权，因为本身不能跳转
        else {
          console.log('加载host')
          wx.navigateTo({
            url: '../index/index',
         //   success: function (res) { },
          //  fail: function (res) { },
          //  complete: function (res) { },
          })
        }
      }
    })
    */
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
    // timer.timer();
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
    wx.setStorageSync('active', true);
   timer.timer();
    wx.request({
      url: 'https://crp.shakeel.cn/query-unread-number',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      method: 'GET',
      data: {
        'sessionId': wx.getStorageSync('sessionId'),
      },
      success: function (res) {

        if (res.data.errcode == 1) {
          wx.showToast({
            title: '服务器遇到了异常，请稍后再试',
            icon: 'none',
            mask: true,
            duration: 2000
          })
          return
        }
        if (res.data.errcode == 0) {
          console.log('打开时刷新未邀请个数', res.data)
          wx.setStorageSync('_number', res.data.number);
          var number = wx.getStorageSync('_number');
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
        else {
          exp.exception(res.data.errcode);
        }
      },
      fail: function (res) {
        wx.showToast({
          title: '请保持网络通畅',
          icon: 'none',
          mask: true,
          duration: 2000
        })
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