var timer = require('../../utils/timer.js')
var exp = require('../../utils/exception.js')
var Request=require('../../utils/request.js')
var inter=require('../../utils/interface.js')

var pages = 1;//总页数初始值
var _re_list = [];
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mypage: 1,//默认查找第一页
    _number: 0,//未邀请个数
    postList: [{
      messageId: '',
      unread: false,
      sender: '',
      imgtitle: '',
      img_small: "",
      datetime: '',
      content: ''
    }]
  },
  onbefore: function () { //点击上一页

    wx.setStorageSync('active', true);
   
  
      if (this.data.mypage > 1) {
        this.setData({
          mypage: this.data.mypage - 1
        })
      }

      else {
        //如果页数小于=1
        this.setData({
          mypage: 1
        })
      }
    
    this.re_request();

  },
  onafter: function () { //点击下一页
    console.log('点击下一页', this.data.mypage, pages)
    wx.setStorageSync('active', true);
    //  timer.timer();
    if (!pages == "") {
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
    }
    else {
      this.setData({
        mypages: 1
      })
    }
    this.re_request();
  },
  oncatch: function (e) {       //当点击的时候,说明这个是已经读了
    wx.setStorageSync('active', true);
    
    var that = this;
    that.setData({
      unread: true
    });
    wx.request({
      url: 'https://crp.shakeel.cn/read-message',
      method: 'POSt',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        sessionId: wx.getStorageSync('sessionId'),
        messageId: e.currentTarget.id
      },
      success: function (res) {
        if (res.data.errcode == 0) {
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
        else {
          exp.exception(res.data.errcode);
        }
      }, fail: function (res) {
        inter.Toast_Remind('请保持网络通畅','none')
      },
      complete:function(res){
        that.re_request();
      }
    });
  },
  onget: function () { //点击全部已读,意思就是说告诉后台，这些数据用户已经读了
    wx.setStorageSync('active', true);

    var that = this;
    wx.request({
      url: 'https://crp.shakeel.cn/read-all-messages',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        'sessionId': wx.getStorageSync('sessionId')
      },
      success: function (res) {
        if (res.data.errcode == 0) {
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
          that.re_request();
          return
        }
        else {
          exp.exception(res.data.errcode);
        }
      },
      fail: function (res) {
        console.log('失败')
        inter.Toast_Remind('请保持网络通畅', 'none')
      },
       complete: function () {
        if (wx.getStorageSync('re_pages') == 0) {
          inter.Toast_Remind('暂无消息', 'none')

        } else {
          that.re_request();
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setStorageSync('active', true);
  
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
    wx.setStorageSync('active', true);
    Request.Unread_Number();

    this.re_request();


  },
  onpre: function (e) {
    wx.setStorageSync('active', true);
   
    var n = wx.getStorageSync('re_mypage');
    
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
,
re_request:function(){
  var that = this;
  var sessionId = wx.getStorageSync('sessionId');
  wx.setStorageSync('re_mypage', that.data.mypage);
  wx.request({
    url: 'https://crp.shakeel.cn/query-messages',
    header: {
      'content-type': 'application/x-www-form-urlencoded' // 默认值
    },
    method: 'GET',
    data: {
      'sessionId': wx.getStorageSync('sessionId'),
      'page': that.data.mypage
    },
    success: function (res) {
      if (res.data.errcode == 0) {
        console.log('查询成功', res.data.list);
        //将服务器反馈回来的数据存在数组当中

        pages = res.data.pages
        wx.setStorageSync('re_pages', pages);
        //固定放在某一页
        _re_list[wx.getStorageSync('re_mypage') - 1] = res.data.list;

        for (var i = 0; i < _re_list[wx.getStorageSync('re_mypage') - 1].length; i++) {
          console.log('render1联系人', _re_list[wx.getStorageSync('re_mypage') - 1][0].sender)
          if (_re_list[wx.getStorageSync('re_mypage') - 1][i].sender == null) {
            _re_list[wx.getStorageSync('re_mypage') - 1][i].sender = '匿名用户'
          //  console.log('render1', _re_list[wx.getStorageSync('re_mypage') - 1][0].sender)
          }
          if (_re_list[wx.getStorageSync('re_mypage') - 1][i].imgtitle == "") {
            _re_list[wx.getStorageSync('re_mypage') - 1][i].imgtitle = '暂无标题'

          }
        }

        wx.setStorageSync('re_list', _re_list);

        return
      }
      else {
        exp.exception(res.data.errcode);
      }
    },
    fail: function (res) {
      console.log('查询失败')
      inter.Toast_Remind('请保持网络通畅', 'none')
    },

    complete: function () {
      if (wx.getStorageSync('re_pages') == 0) {
        inter.Toast_Remind('暂无消息', 'none')

      }
      else {
        var p = wx.getStorageSync('re_mypage');
        console.log('re_p', p);

        // var that=this;
        that.setData({
          postList: wx.getStorageSync('re_list')[p - 1],
        })
        console.log('postlist', wx.getStorageSync('re_list')[p - 1])
      }
    }
  })

}
})