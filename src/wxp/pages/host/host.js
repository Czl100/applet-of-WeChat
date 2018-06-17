var timer = require('../../utils/timer.js')
var exp = require('../../utils/exception.js')
var inter = require('../../utils/interface.js')
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
    //  timer.timer();
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
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('host页面打开')
  },


  onJump_host_visible: function (event) {

    wx.setStorageSync('active', true);
    // timer.timer();
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
      inter.Toast_Remind('请先选择图片','none')
    }
  },
  onJump_host_invisible: function (event) {
    wx.setStorageSync('active', true);

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
      inter.Toast_Remind('请先选择图片','none')
    }
  },
  onJump_host_resign: function (event) {
    wx.setStorageSync('active', true);
    // timer.timer();
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
      inter.Toast_Remind('请先选择图片', 'none')
    }
  }
})