var timer = require('../../utils/timer.js')
var pages = 1;//总页数初始值
var _re_list = [];
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mypage: 1,//默认查找第一页
    _number: 0,//未邀请个数
    //  onread:false,//这是设置数据是否已读，默认是未读
    postList: [{
      messageId: '',
      unread: false,
      sender: '',
      imgtitle: '',
      img: "",
      datetime: '',
      content: ''
    }]
  },
  onbefore: function () { //点击上一页
    wx.setStorageSync('active', true);
    timer.timer();
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
    var that = this;
    wx.setStorageSync('re_mypage', that.data.mypage);   //将当前的页数存入缓存
    wx.request({
      url: 'http://localhost:5000/query-messages',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      method: 'GET',
      data: {
        'sessionId': wx.getStorageSync('sessionId'),
        'page': that.data.mypage
      },
      success: function (res) {
        if (res.data.errcode == 1000) {
          wx.showModal({
            title: '信息提示',
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
        else {
          console.log('查询成功', res.data.list);
          //将服务器反馈回来的数据存在数组当中
          //   remind_List:res.data.list;
          pages: res.data.pages
          wx.setStorageSync('re_pages', res.data.pages);  //将总页数存放在缓存当中
          _re_list[wx.getStorageSync('re_mypage') - 1] = res.data.list;  //存放在这一页的数组中
          wx.setStorageSync('re_list', _re_list); //然后再放入缓存中

        }
        return
      },
      fail: function (res) {
        console.log('查询失败')
        wx.showToast({
          title: '请保持网络通畅',
          icon: 'none',
          duration: 2000
        })
      },
      complete: function (res) {
        var p = wx.getStorageSync('re_mypage');
        that.setData({
          postList: wx.getStorageSync('re_list')[p - 1]
          //  postList: res.data.list
        })
      }
    })
  },
  onafter: function () { //点击下一页
    wx.setStorageSync('active', true);
    timer.timer();
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
    var that = this;
    wx.setStorageSync('re_mypage', that.data.mypage);   //将当前的页数存入缓存
    wx.request({
      url: 'http://localhost:5000/query-messages',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      method: 'GET',
      data: {
        'sessionId': wx.getStorageSync('sessionId'),
        'page': that.data.mypage
      },
      success: function (res) {
        if (res.data.errcode == 1000) {
          wx.showModal({
            title: '信息提示',
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
        else {
          console.log('查询成功', res.data.list);
          //将服务器反馈回来的数据存在数组当中
          //   remind_List:res.data.list;
          pages: res.data.pages
          wx.setStorageSync('re_pages', res.data.pages);
          _re_list[wx.getStorageSync('re_mypage') - 1] = res.data.list;
          wx.setStorageSync('re_list', _re_list);

          return
        }
      },
      fail: function (res) {
        wx.showToast({
          title: '请保持网络通畅',
          icon: 'none',
          duration: 2000
        })
        console.log('查询失败')
      },
      complete: function (res) {
        var p = wx.getStorageSync('re_mypage');
        that.setData({
          postList: wx.getStorageSync('re_list')[p - 1]
        })
      }
    })
  },
  oncatch: function (e) {       //当点击的时候,说明这个是已经读了
    wx.setStorageSync('active', true);
    timer.timer();
    console.log(e);
    console.log('id', e.currentTarget.id);
    var that = this;
    that.setData({
      unread: true
    });
    wx.request({
      url: 'http://localhost:5000/read-message',
      method: 'POSt',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        sessionId: wx.getStorageSync('sessionId'),
        messageId: e.currentTarget.id
      },
      success: function (res) {
        if (res.data.errcode == 1000) {
          wx.showModal({
            title: '信息提示',
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
        else {
          console.log('标记某个为已读反馈')
          var number = wx.getStorageSync('_number'); //这是消息提醒的个数
          if (number == 1) {
            wx.removeTabBarBadge({
              index: 3
            });
          }
          else {
            wx.setTabBarBadge({
              index: 3,
              text: number - 1 + "",
            })
          }
          return
        }
      }, fail: function (res) {
        wx.showToast({
          title: '请保持网络通畅',
          icon: 'none',
          duration: 2000
        })
      }
    });
    wx.request({   //一进来消息提醒界面的服务端请求，意思是缓存一些新的数据
      url: 'http://localhost:5000/query-messages',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      method: 'GET',
      data: {
        'sessionId': wx.getStorageSync('sessionId'),
        'page': that.data.mypage
      },
      success: function (res) {
        if (res.data.errcode == 1000) {
          wx.showModal({
            title: '信息提示',
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
        else {
          console.log('查询成功', res.data.list);
          //将服务器反馈回来的数据存在数组当中
          //   remind_List:res.data.list;
          pages: res.data.pages
          wx.setStorageSync('re_pages', pages);
          //固定放在某一页
          _re_list[wx.getStorageSync('re_mypage') - 1] = res.data.list;
          wx.setStorageSync('re_list', _re_list);
          return
        }
      },
      fail: function (res) {
        wx.showToast({
          title: '请保持网络通畅',
          icon: 'none',
          duration: 2000
        })
        console.log('查询失败')
      },
      complete: function (res) {
        var p = wx.getStorageSync('re_mypage');
        that.setData({
          postList: wx.getStorageSync('re_list')[p - 1]
        })
      }
    })
  },
  onget: function () { //点击全部已读,意思就是说告诉后台，这些数据用户已经读了
    wx.setStorageSync('active', true);
    timer.timer();
    var that = this;
    wx.request({
      url: 'http://localhost:5000/read-all-messages',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        'sessionId': wx.getStorageSync('sessionId')
      },
      success: function (res) {
        if (res.data.errcode == 1000) {
          wx.showModal({
            title: '信息提示',
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
        else {
          console.log('全部已读发送到服务端', res.data)   //发送后台全部已读，发送成功
          if (res.data) {//如果成功
            that.setData({
              unread: true //将onread设置为true
            })
            //将消息提醒那里设置为0
            wx.removeTabBarBadge({
              index: 3
            });
          }
          wx.request({
            url: 'http://localhost:5000/query-messages',
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
          return
        }
      },
      fail: function (res) {
        console.log('失败')
        wx.showToast({
          title: '请保持网络通畅',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setStorageSync('active', true);
    timer.timer();
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
    var that = this;
    var sessionId = wx.getStorageSync('sessionId');
    wx.setStorageSync('re_mypage', that.data.mypage);
    wx.request({     //未读个数的请求
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
          wx.showModal({
            title: '信息提示',
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
        else {
          console.log('打开消息提醒时未邀请个数', res.data)
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
        }
        return
      },
      fail: function (res) {
        wx.showToast({
          title: '请保持网络通畅',
          icon: 'none',
          duration: 2000
        })
      }
    })
    wx.request({
      url: 'http://localhost:5000/query-messages',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      method: 'GET',
      data: {
        'sessionId': sessionId,
        'page': that.data.mypage
      },
      success: function (res) {
        if (res.data.errcode == 1000) {
          wx.showModal({
            title: '信息提示',
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
        else {
          console.log('查询成功', res.data.list);
          //将服务器反馈回来的数据存在数组当中
          //   remind_List:res.data.list;
          pages = res.data.pages
          wx.setStorageSync('re_pages', pages);
          //固定放在某一页
          _re_list[wx.getStorageSync('re_mypage') - 1] = res.data.list;
          wx.setStorageSync('re_list', _re_list);

          console.log('总页数pages', pages);
          console.log('服务器上的总页数', res.data.pages);

          return
        }
      },
      fail: function (res) {
        console.log('查询失败')

        wx.showToast({
          title: '请保持网络通畅',
          icon: 'none',
          duration: 2000
        })
      },

      complete: function () {
        var p = wx.getStorageSync('re_mypage');
        console.log('re_p', p);

        // var that=this;
        that.setData({
          postList: wx.getStorageSync('re_list')[p - 1],
        })
        console.log('postlist', wx.getStorageSync('re_list')[p - 1])
      }

    })



  },
  onpre: function (e) {
    wx.setStorageSync('active', true);
    timer.timer();
    var n = wx.getStorageSync('re_mypage');
    console.log('re进入', n)
    console.log('re当前的id', e.currentTarget.id)
    var img_ = wx.getStorageSync('re_list')[n - 1][e.currentTarget.id].img;

    console.log('re当前的id', e.currentTarget.id)
    console.log('re当前图片的路径', img_);
    var url = [];

    for (var j = 0; j <= 10; j++) {
      if (!wx.getStorageSync('re_list')[n - 1][j] == "")  //如果图片存在的话
        url.push(wx.getStorageSync('re_list')[n - 1][j].img)  //把一页中图片放在这个数组中
    };
    wx.previewImage({
      current: img_, // 当前显示图片的http链接

      urls: url// 需要预览的图片http链接列表
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