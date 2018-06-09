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
    console.log('host页面打开')
   // wx.setStorageSync('active', true);
  // timer.timer();
    console.log('进入小程序')
    if (!wx.getStorageSync('sessionId') == "") {
      console.log('会话已经存在，有sessionId')
      wx.request({
        url: 'https://crp.shakeel.cn/session-keep',
        method: 'GET',
        data: {
          'sessionId': wx.getStorageSync('sessionId'),
        },
        success: function (res) {
          if (res.data.errcode == 0) {
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
            return
          }
          if (res.data.errcode == 1002) {
            wx.showModal({
              title: '提示',
              content: '请选择登录或者离线使用',
              confirmText: '同意登录',
              cancelText: '离线使用',
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                  wx.showLoading({
                    title: '正在登录',
                    mask: true,
                  })
                  //设备id获取，sessionId获取
                  wx.request({
                    url: 'https://crp.shakeel.cn/did',
                    method: 'GET',
                    header: {
                      'content-type': 'application/x-www-form-urlencoded' // 默认值
                    },
                    data: {

                    },
                    success: function (res) {
                      if (res.data.errcode == 0) {
                        //这个时候会话创建
                        console.log('获取设备成功', res.data.did);
                        wx.setStorageSync('did', res.data.did);//将设备的id存入缓存中
                      }
                      else {
                        wx.hideLoading();
                        exp.exception(errcode);
                      }
                    },
                    fail: function (res) {
                      wx.hideLoading();
                      console.log('获取设备ID失败,服务器无法进行处理');
                      wx.hideLoading();
                      wx.showToast({
                        title: '获取设备ID失败',
                        icon: 'none',
                        duration: 2000
                      });
                    },
                    complete: function (res) {
                      console.log('获取设备的did', wx.getStorageSync('did'))
                      if (!wx.getStorageSync('did') == "")  //如果已经获取了设备的ID，那么就登录
                      {
                        console.log('index-js登录', wx.getStorageSync('sessionId'))
                        // 登录
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
                              success: function (res1) {
                                console.log('index.js文件', res1.data)
                                wx.setStorageSync('sessionId', res1.data.sessionId);
                                console.log('=================session success=================')
                                // console.log(res.data.fg)
                                if (res1.data.errcode == 0) {  //如果登录成功
                                  wx.hideLoading();
                                  console.log(res1.data.sessionId);
                                  wx.showToast({
                                    title: '登录成功',
                                    icon: 'success',
                                    duration: 2000
                                  })
                                  return
                                }
                                if (res1.data.errcode == 1) {
                                  wx.hideLoading();
                                  wx.showToast({
                                    title: '服务器遇到了异常，请稍后再试',
                                    icon: 'none',
                                    duration: 2000
                                  })
                                  return
                                }

                                else {
                                  wx.hideLoading();
                                  exp.exception(res.data.errcode)
                                }

                              },
                              fail: function (res) {
                                console.log('=================session fail=================')
                                wx.hideLoading();
                                wx.showToast({
                                  title: '请连接服务器',
                                  icon: 'none',
                                  duration: 2000
                                })
                              },
                              complete: function (res) {
                                console.log('app登录完成')
                              }
                            })
                          }

                        })
                        // 获取用户信息


                      }

                      else {
                        wx.hideLoading();
                        //如果没有获取到设备的信息did{}
                        wx.showModal({
                          title: '注意',
                          content: '服务器无法获取设备的唯一ID，请重新授权',
                          confirmText: "确定",
                          cancelText: "取消",
                          success: function (res) {
                            console.log(res);
                            if (res.confirm) {
                              console.log('确定')
                              wx.navigateBack();
                            } else {
                              console.log('取消')
                              wx.navigateBack();
                            }
                          }
                        })
                      }
                    }
                  })

                } else if (res.cancel) {
                  wx.hideLoading();
                  console.log('用户点击取消')
                }
              }
            })

            return
          }
          else {
            wx.hideLoading();
            exp.exception(res.data.errcode);
          }
        },
        fail: function (res) {
          wx.hideLoading();
          wx.showToast({
            title: '请保持网络通畅',
            icon: 'none',
            duration: 2000
          })
        }
      })
    }
    else {
      //这个时候会话是不存在的

      wx.showModal({
        title: '提示',
        content: '请选择登录或者离线使用',
        confirmText: '同意登录',
        cancelText: '离线使用',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
            wx.showLoading({
              title: '正在登录',
              mask: true,
            })
            //设备id获取，sessionId获取
            wx.request({
              url: 'https://crp.shakeel.cn/did',
              method: 'GET',
              header: {
                'content-type': 'application/x-www-form-urlencoded' // 默认值
              },

              success: function (res) {
                if (res.data.errcode == 0) {
                  //这个时候会话创建
                  console.log('获取设备成功', res.data.did);
                  wx.setStorageSync('did', res.data.did);//将设备的id存入缓存中
                }
                else {
                  wx.hideLoading();
                  exp.exception(errcode);
                }
              },
              fail: function (res) {
                wx.hideLoading();
                console.log('获取设备ID失败,服务器无法进行处理');
                wx.showToast({
                  title: '获取设备ID失败',
                  icon: 'none',
                  duration: 2000
                });
              },
              complete: function (res) {
                console.log('获取设备的did', wx.getStorageSync('did'))
                if (!wx.getStorageSync('did') == "")  //如果已经获取了设备的ID，那么就登录
                {
                  console.log('app-js登录', wx.getStorageSync('sessionId'))
                  // 登录
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
                        success: function (res1) {
                          wx.hideLoading();
                          console.log('app.js文件', res1.data)
                          wx.setStorageSync('sessionId', res1.data.sessionId);
                          console.log('=================session success=================')
                          // console.log(res.data.fg)
                          if (res1.data.errcode == 0) {  //如果登录成功
                            console.log(res1.data.sessionId);
                            wx.showToast({
                              title: '登录成功',
                              icon: 'success',
                              duration: 2000
                            })
                            if (!wx, wx.getStorageSync('sessionId') == "") {
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
                            }
                            return
                          }
                          if (res1.data.errcode == 1) {
                            wx.showToast({
                              title: '服务器遇到了异常，请稍后再试',
                              icon: 'none',
                              duration: 2000
                            })
                            return
                          }

                          else {
                            exp.exception(res1.data.errcode)
                          }

                        },
                        fail: function (res) {
                          wx.hideLoading();
                          console.log('=================session fail=================')
                          wx.showToast({
                            title: '请连接服务器',
                            icon: 'none',
                            duration: 2000
                          })
                        },
                        complete: function (res) {

                          console.log('app登录完成')
                        }
                      })
                    }

                  })
                  // 获取用户信息


                }

                else {
                  wx.hideLoading();
                  //如果没有获取到设备的信息did{}
                  wx.showModal({
                    title: '注意',
                    content: '服务器无法获取设备的唯一ID，请重新授权',
                    confirmText: "确定",
                    cancelText: "取消",
                    success: function (res) {
                      console.log(res);
                      if (res.confirm) {
                        console.log('确定')
                        wx.navigateBack();
                      } else {
                        console.log('取消')
                        wx.navigateBack();
                      }
                    }
                  })
                }
              }
            })

          } else if (res.cancel) {
            wx.hideLoading();
            console.log('用户点击取消')
          }
        }
      })
    }
    console.log('未读个数host',wx, wx.getStorageSync('sessionId'))
  

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