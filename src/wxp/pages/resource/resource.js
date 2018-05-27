var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    Image: "/pages/icon/add.png",//这是原始的icon
    resource_chooseFiles:null,
    title:null,  //追溯到的图片的标题
    imgid:null
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
           resource_chooseFiles: res.tempFilePaths[0]
        });
      }
    })

  },
  
  onstart:function(){
    var that=this;
    var sessionId = wx.getStorageSync('sessionId');
        wx.uploadFile({
          url: 'http://localhost:5000/query-author',
          method:'POST',
          filePath: that.data.resource_chooseFiles,
          name: 'file',
          formData: {
            'sessionId': sessionId
          },
          success: function (res) {
            console.log("图片可开始追溯", res.data.fg)
            //如果图片可以开始进行追溯，那么就将信息放在缓存中
      
            console.log('追溯图片是',that.data.resource_chooseFiles)

        //    imgid=res.data.imgid;//这个是图片的id，用于作者溯源
            if(!res.exist){  //如果作者信息没有找到，那么服务器上返回exit=false
            wx.showModal({
              title: '温馨提醒',
              content: '该图片没有追溯成功',
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
            }
            else{  //这个时候，作者信息找到
              wx.navigateTo({
                url: 'resource_success?title='+res.data.title +'& imgid='+res.data.imgid,
              })
              //如果作者的信息可以找到，那么可以把这个图片的id放在缓存中，
              wx.setStorageSync('imgid',res.data.imgid);
            }
        
            /*
            wx.showToast({
              title: '已完成,',
              icon: 'success',
              duration: 3000
            });
            */
          },
          fail: function (res) {
            console.log("图片追溯上传失败", res.data.msg)         
              wx.showToast({
                title: '数据加载中',
                icon: 'loading',
                duration: 3000
              });
          
          }
        })
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
      wx.setNavigationBarTitle({
        title: '图片查询',
      })
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