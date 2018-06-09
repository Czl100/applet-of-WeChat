var timer = require('../../utils/timer.js')
var exp = require('../../utils/exception.js')
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    allow:true,
    start: false,
    Image: "/pages/icon/camera.png",
    resign_chooseFiles: app.globalData.chooseFiles,
    dis: "",
    useKeyboardFlag: true,  //默认是键盘输入类型的输入框
  },
  onpre: function () {
    wx.setStorageSync('active', true);
  //  timer.timer();
    var ig = wx.getStorageSync('_save_img')
    console.log('缓存图片_save_img', ig);
    if (this.data.start) {
      console.log('start的标记，说明当前图已经注册好了', this.data.start);
      if (wx.getStorageSync('_save_img') == "") {
        wx.previewImage({
          current: 'app.global.chooseFiles', // 当前显示图片的http链接
          urls: [app.globalData.chooseFiles],
        })
        console.log('图片还没有注册，预览的图片是没有注册的')
      }
      else {
        //如果已经绑定了

        wx.previewImage({
          current: 'ig', // 当前显示图片的http链接
          urls: [wx.getStorageSync('_save_img')],
        })
        console.log('图片已经注册，预览的图片是有注册的')
      }
    }
    else {
      wx.showModal({
        title: '温馨提示',
        mask: true,
        content: '请准确注册图片',
        confirmText: '我知道了',
        showCancel:false
      });
    }
  },
  Input: function (e) {
    wx.setStorageSync('active', true);
   // timer.timer();
    this.setData({
      dis: e.detail.value
    })
    //   console.log(this.data.dis);
  },
  oncancel: function () {
    wx.setStorageSync('active', true);
  //  timer.timer();
    /*
    console.log('start', this.data.start);
    if (this.data.start) {
      //如果图片已经绑定了就可以存到手机相册
      if (!wx.getStorageSync('_save_img') == "") //如果缓存不是空的 
      {
        console.log('图片绑定_缓存不是空的，_sava_img', wx.getStorageSync('_save_img'))
        wx.saveImageToPhotosAlbum({
          filePath: wx.getStorageSync('_save_img'),
          success(res) {
            wx.showToast({
              title: '已保存至手机相册',
            })
          }
        })
      }
    }
    else {
      wx.showToast({
        title: '请先绑定图片',
        icon: 'none',
        duration: 2000
      })
    }
    */
    wx.navigateBack({
      delta: 1,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setStorageSync('active', true);
  //  timer.timer();
    this.setData({
      resign_chooseFiles: app.globalData.chooseFiles
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
    wx.setStorageSync('active', true);
  //  timer.timer();
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

  },

  onsure: function () {
    if(this.data.allow){
    this.setData({
      allow:false //点击了绑定之后就不允许点击了
    })
    
    wx.setStorageSync('active', true);
  //  timer.timer();
    //   if (!this.data.dis == "") {
      wx.showLoading({
        title: '正在处理',
        mask:true
      });
  
    var that = this;
    var sessionId = wx.getStorageSync('sessionId');
    wx.uploadFile({
      url: 'https://crp.shakeel.cn/img-bind',
      filePath: that.data.resign_chooseFiles,  //将图片上传
      name: 'img',
      method: 'POST',
      formData: {
        'sessionId': sessionId,   //附带用户的ID,图片隐藏的信息，发送到服务器
        'imgtitle': that.data.dis
      },
      success: function (res) {
        wx.hideLoading();
        res.data = JSON.parse(res.data);

        if (res.data.errcode == 1) {
          wx.showModal({
            title: '温馨提示',
            mask: true,
            content: '服务器遇到了异常，请稍后再试',
            confirmText: '我知道了',
            showCancel: false
          });
          return
        }
        if (res.data.errcode == 0) {
          console.log("图片上传成功", res.data);
          wx.setStorageSync('_save_img', res.data.img);
          //  console.log("图片上传成功", res.fg);
          app.globalData.userimages.push(that.data.resign_chooseFiles),//将这张图片放在全局变量中（数组—）
            wx.setStorageSync('userimages', app.globalData.userimages); //数组放进缓存
            /*
          wx.showToast({
            title: '图片绑定成功',
            icon: 'success',
            duration: 3000
          });
          */
          wx.showModal({
            title: '温馨提示',
            mask:true,
            content: '图片已经注册成功，请选择预览或者返回',
            confirmText:'预览',
            cancelText:'取消',
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
                if (!wx.getStorageSync('_save_img') == "") //如果缓存不是空的 
                {
                  console.log('图片注册_缓存不是空的，_sava_img', wx.getStorageSync('_save_img'))
                  wx.previewImage({
                    current: wx.getStorageSync('_save_img'),
                    urls: [wx.getStorageSync('_save_img')],
                  })
                }
                else{
                  console.log('图片上传的时候出现意外情况，请用户重新注册');
                  wx.showModal({
                    title: '温馨提示',
                    mask: true,
                    content: '图片上传的时候出现意外情况，请用户重新注册',
                    confirmText: '我知道了',
                    showCancel: false
                  });
                }
               
              } else if (res.cancel) {
                console.log('用户点击取消')
                
              }
            }
          })
          //绑定成功
          that.setData({
            start: true,
          })
          return
        }
        else {
          {
            exp.exception(res.data.errcode);
          }
        }
      },
      fail: function (res) {
        wx.hideLoading();
        console.log("图片上传失败");
        wx.showModal({
          title: '温馨提示',
          mask: true,
          content: '注册失败',
          confirmText: '我知道了',
          showCancel: false
        });
      },
      complete:function(){
        wx.hideLoading();
        that.setData({
          allow:true
        })
      }
    })
    //   }
    /*
        else {//如果输入没有东西
          wx.showToast({
            title: '绑定信息不能为空',
            icon: 'none',
            duration: 2000
          })
        }
        */
  }

  }
})