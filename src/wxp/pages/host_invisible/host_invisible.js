var Jmd5 = require('../../utils/md5.js')
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    co_get:false,
    start:false,
    invisible_chooseFiles: app.globalData.chooseFiles,
    imgtitle:"",
    dis: "",     //这个是水印的文字信息
    ser: "",     //这是嵌入的密码
    useKeyboardFlag: true,  //默认是键盘输入类型的输入框
  },
  onsave: function () {
    console.log('保存到手机的图片路径', wx.getStorageSync('save_img'))
    if(wx.getStorageSync('save_img')=="")//如果没有图片的话，
    {
      wx.showToast({
        title: '由于不可抗因素，信息嵌入失败',
        icon:'none',
        duration:2000
      })
    }
    else{
      console.log('保存到手机的图片路径', wx.getStorageSync('save_img'))
    wx.saveImageToPhotosAlbum({
      filePath:wx.getStorageSync('save_img'),
      success(res) {
        wx.showToast({
          title: '已保存至手机相册',
          icon: 'none',
          duration: 2000
        })
      }
    })
    }
  },
  Input_title:function(e){
this.setData({
imgtitle:e.detail.value
})
  },
  Input_dis: function (e) {
    this.setData({
      dis: e.detail.value
    })
  //  console.log(this.data.dis);
  },
  Input_ser: function (e) {
    this.setData({
      ser: e.detail.value
    })
  },
  onpre:function(){
    if(wx.getStorageSync(save_img)==""){
      wx.previewImage({
        current: 'app.global.chooseFiles', // 当前显示图片的http链接
        urls: [app.globalData.chooseFiles],
      })
    }
    else{
      //如果已经嵌入了
      wx.previewImage({
        current: 'wx.getStorageSync(save_img)', // 当前显示图片的http链接
        urls: [wx.getStorageSync(save_img)],
      })
    }
  },
  onget:function(){  //提取水印信息
    wx.showToast({
      title: '正在处理',
      icon: 'loading',
      duration: 10000
    });
 //   wx.navigateBack()
 var that=this;
 var key = Jmd5.hexMD5(that.data.ser);
 //var sessionId=wx.getStorageSync(sessionId);
 console.log('提取水印',key);
 var file=app.globalData.chooseFiles;
 wx.uploadFile({
   url: 'http://localhost:5000/ix',
   method:'POST',
   filePath: that.data.invisible_chooseFiles,
   name: 'img',
   formData:{
     'sessionId': wx.getStorageSync('sessionId'),
     'key':key //输入的密码
   },
   success:function(res){
     wx.hideToast();
     res.data = JSON.parse(res.data);
     if(res.data.errcode==1000){
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
     console.log('获取水印信息',res.data);
     console.log('获取水印信息', res.data.secret);
     wx.showModal({
       title: '水印信息',
       content: res.data.secret,
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
     });
     return
     }
   },
   fail:function(res){
     wx.hideToast();
     console.log('获取失败，服务器无法进行处理');
     wx.showToast({
       title: '提取失败',
       icon: 'none',
       duration: 2000
     });
   }
 })
  },

  onsure: function () {
    this.setData({
      start:true,
      co_get:true
    })
    
    if((!this.data.ser=="")&&(!this.data.dis=="") ) //这个时候没有输入水印
    {
      
    wx.showToast({
      title: '正在处理',
      icon:'loading',
      duration:6000
    })
    var that=this;

  console.log('图片标题', that.data.imgtitle);
    var key = Jmd5.hexMD5(that.data.ser);
    console.log('嵌入水印',key);
   var sessionId=wx.getStorageSync('sessionId');
   console.log(that.data.invisible_chooseFiles);
    wx.uploadFile({ //用户点击确定，那么就上传到服务器，进行不可见信息的嵌入
      url: 'http://localhost:5000/ih',
       method:'POST',
      filePath: that.data.invisible_chooseFiles,
      name: 'img',
      formData: {
        'sessionId': sessionId,     //附带用户的ID,图片隐藏的信息，发送到服务器
        'key':key, //这个通过md5加密过之后的key(用户输入的密码)
        'secret': that.data.dis,     //这个是嵌入水印的密文信息
        'imgtitle':that.data.imgtitle
      },
      success:function(res){
        wx.hideToast();
        res.data = JSON.parse(res.data);
        console.log('嵌入的反馈',res.data.errcode);
        if (res.data.errcode == 1) {
          wx.showToast({
            title: '服务器遇到了异常，请稍后再试',
            icon: 'none',
            duration: 2000
          })
          return
        }
        if(res.data.errcode==1000){
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
return
        }
       else{
          console.log("嵌入成功", res.data)
        console.log("嵌入成功",res.data.img)
        wx.setStorageSync('save_img', res.data.img);
        console.log('缓存的照片',wx.getStorageSync('save_img'))
        app.globalData.userimages.push(that.data.invisible_chooseFiles);//当用户点击确定之后，将图片保存在本地缓存
       var ss= wx.setStorageSync('userimages',app.globalData.userimages);
        console.log(ss);
        wx.showToast({
          title: '嵌入成功,',
          icon: 'success',
          duration: 3000
        });
        return
        }

      },
      fail:function(){
        wx.hideToast();
        console.log("嵌入水印失败"),
        wx.showToast({
          title: '数据加载中',
          icon: 'none',
          duration: 2000
        });
      }
    })
    }
    else{
      wx.showToast({
        title: '嵌入的不可见水印信息和密码不得为空',
        icon:'none',

        duration:2000
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      invisible_chooseFiles: app.globalData.chooseFiles
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