var timer = require('../../utils/timer.js')
var content;
var nick;
var nick_length;
var content_length;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showTopTips: false,//用来后面的错误提示
 //   isAgree: false,
    // content:null  //用来进行相关的文本，字数是140个
    //  imgid=null
  },
  Input_content: function (e) {  //获取留言框中的信息content
    wx.setStorageSync('active', true);
    timer.timer();
    content = e.detail.value
   content_length=e.detail.value.length;
  },
  Input_nick: function (e) {  //获取留言框中的信息content
    wx.setStorageSync('active', true);
    timer.timer();
    nick = e.detail.value
    // console.log(content)
   nick_length=e.detail.value;
  },
  showTopTips: function () {    //这个就是点击确定按键的时候
    if (content_length >140) {
      wx.showModal({
        title: '注意',
        content: '用户输入字数已经超过140，请控制好留言的字数。',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
    if (nick_length >10) {
      wx.showModal({
        title: '温馨提示',
        content: '联系人的名字不得超过5个字',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
    var that = this;
    var imgid = wx.getStorageSync('imgid');     //从缓存中吧imgid取出来
    var sessionId = wx.getStorageSync('sessionId');
    //如果留言不是空的话：
    if (!content == '') {
     
      //将用户的id,imgid,content都发送到服务器上
      wx.request({
        url: 'https://crp.shakeel.cn/send-message',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded' // 默认值
        },
        data: {
          'sessionId': sessionId,
          'nick': nick,
         // 'imgid': imgid,

          'imgid': 'de0112fcac8a94819bd6edcad7a070df',
          'content': content //留言信息发送到服务器
        },
        success: function (res) {
        
          if (res.data.errcode == 1) {
            wx.showToast({
              title: '服务器遇到了异常，请稍后再试',
              icon: 'none',
              duration: 2000
            })
            return
          }
          if(res.data.errcode==0) {
            console.log('发送邀请成功', res.data);
         wx.showToast({
              title: '发送邀请成功',
              icon: 'success',
              duration: 2000
            });
            content=null;
            nick=null;
         setTimeout(function () {
           wx.navigateBack({})
         }, 700)
         return 
          }
else
            {
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
        },
        fail: function (res) {
          wx.showToast({
            title: '请保持网络通畅',
            icon: 'none',
            duration: 2000
          })
          console.log('发送邀请失败')
        }
      })


    }//=====如果留言不是空的话
    else //如果留言是空的话
    //   if(!this.data.isAgree){  //如果不同意，那么显示顶部栏错误提示
    {
      
      
      this.setData({
        showTopTips: true
      });
      
      console.log('留言是空的')
      setTimeout(function () {
        that.setData({
          showTopTips: false
        });
      }, 3000);
    }


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

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
wx.showModal({
  title: '温馨提示',
  content: '为了便于作者与您联系，建议您留下联系方式',
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