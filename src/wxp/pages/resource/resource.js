var timer = require('../../utils/timer.js')
var exp = require('../../utils/exception.js')
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    start: false,
    Image: "/pages/icon/add.png",//这是原始的icon
    resource_chooseFiles: null,
    title: '暂无标题',  //追溯到的图片的标题
    imgid: null
  },
  chooseImage: function (event) {
    wx.setStorageSync('active', true);
 //   timer.timer();
    var that = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: 'original', // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        that.setData({
          resource_chooseFiles: res.tempFilePaths[0],
          start: true
        });
      }
    })

  },

  onstart: function () {
    if (!wx.getStorageSync('un-line')) {//如果是离线的话
      wx.showModal({
        title: '注意',
        content: '请进行用户登录方可使用',
        showCancel: false,
        confirmText: '我知道了',
        success: function (res) {
          if (res.confirm) {
            console.log('我知道了')
          }
        }
      })
    }
    else{
    wx.setStorageSync('active', true);
   // timer.timer();
    if (this.data.start) {
      wx.showLoading({
        "title": '正在追溯',
        "mask": true
      });
      var that = this;
      var sessionId = wx.getStorageSync('sessionId');
      console.log('开始追溯的sessionId', sessionId, wx.getStorageSync('sessionId'))
      wx.uploadFile({
        url: 'https://crp.shakeel.cn/query-author',
        method: 'POST',
        filePath: that.data.resource_chooseFiles,
        name: 'img',
        formData: {
          'sessionId': sessionId
        },
        success: function (res) {
          wx.hideLoading()
          res.data = JSON.parse(res.data)

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
            console.log("图片可开始追溯", res.data)
            //如果图片可以开始进行追溯，那么就将信息放在缓存中

            console.log('追溯图片是', that.data.resource_chooseFiles)

            //    imgid=res.data.imgid;//这个是图片的id，用于作者溯源
            if (!res.data.exists) {  //如果作者信息没有找到，那么服务器上返回exit=false
              wx.showModal({
                title: '温馨提醒',
                content: '该图片没有追溯成功',
                confirmText: "我知道了",
                showCancel: false
              });
            }
            else {  //这个时候，作者信息找到
              wx.navigateTo({
                url: 'resource_success?title=' + res.data.imgtitle + '&imgid=' + res.data.imgid,
              })
              //如果作者的信息可以找到，那么可以把这个图片的id放在缓存中，
              wx.setStorageSync('imgid', res.data.imgid);
            }
            return
          }
          else {
            exp.exception(res.data.errcode);
          }
        },
        fail: function (res) {
          wx.hideLoading()
          console.log("图片追溯上传失败")
          wx.showToast({
            title: '请保持网络通畅',
            icon: 'none',
            mask: true,
            duration: 2000
          })
        }
      })
    }
    else {
      //如果没有选择
      wx.showToast({
        title: '请先选择图片',
        icon: 'none',
        mask: true,
        duration: 2000
      })
    }
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setStorageSync('active', true);
 //   timer.timer();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.setNavigationBarTitle({
      title: '图片查询',
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.setStorageSync('active', true);
//   timer.timer();
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
          console.log('打开追溯界面时刷新未邀请个数', res.data)
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