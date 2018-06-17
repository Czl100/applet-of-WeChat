var app = getApp();
var timer = require('../../utils/timer.js')
var exp = require('../../utils/exception.js')
var inter = require('../../utils/interface.js')
var Request = require('../../utils/request.js')

var List_;
var his_list = [];  //声明一个数组用于缓存
var pages = 1; //初始值总页数是1
Page({
  data: {
    mypage: 1,//默认查找第一页
    img_unfinish: "/pages/icon/unfinished.png",//如果是未完成时的图片
    postList: [{
      datetime: '',
      finish: '',
      img_small: "",
      imgtitle: '暂无标题',
      imgtype: ''
    }]
  },

  onLoad: function (options) {
    wx.setStorageSync('active', true);
  },

  onReady: function () {

  },

  onbefore: function () { //点击上一页
    wx.setStorageSync('active', true);
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
    this.his_request();

  },
  onafter: function () { //点击下一页
    wx.setStorageSync('active', true);

    console.log(this.data.mypage, pages);
    pages = wx.getStorageSync('history_pages', pages);
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
      mypage: 1
    }

    this.his_request();

  },
  onReady: function () {
    wx.setNavigationBarTitle({
      title: '历史记录',
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */

  onShow: function () {
    wx.setStorageSync('active', true);

    this.his_request();

    Request.Unread_Number();//历史界面未读个数的请求
  },
  onpre: function (e) {
    wx.setStorageSync('active', true);

    var n = wx.getStorageSync('mypage');
    var img_ = wx.getStorageSync('history_list')[n - 1][e.currentTarget.id].img;

    console.log('当前的id', e.currentTarget.id)
    console.log('当前图片的路径', img_);
    var url = [];

    for (var j = 0; j <= 10; j++) {
      if (!wx.getStorageSync('history_list')[n - 1][j] == "")  //如果图片存在的话
        url.push(wx.getStorageSync('history_list')[n - 1][j].img)  //把一页中图片放在这个数组中
    };
    wx.previewImage({
      current: img_, // 当前显示图片的http链接

      urls: url// 需要预览的图片http链接列表
    })
  },


  his_request: function () {
    wx.setStorageSync('active', true);
    //  timer.timer();
    var that = this;

    var sessionId = wx.getStorageSync('sessionId');
    wx.setStorageSync('mypage', that.data.mypage);  //这个是当前的页数，将这个页数发送给服务器
    console.log('发送到服务器的页数', that.data.mypage)

    wx.request({                                               //发送到服务器获取相关页数的信息
      url: 'https://crp.shakeel.cn/query-history',
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        'sessionId': sessionId,
        'page': wx.getStorageSync('mypage'),
      },
      success: function (res) {
        if (res.data.errcode == 0) {

          //固定放在某一页
          his_list[wx.getStorageSync('mypage') - 1] = res.data.list;
          //因为his_list是一个数组，从0开始，而mypage是从1开始

          //这一页的数组长度
          var len = his_list[wx.getStorageSync('mypage') - 1].length;
          var k = wx.getStorageSync('mypage') - 1

          for (var i = 0; i < len; i++) {
            if (his_list[k][i].imgtitle == "") {
              console.log('his_list[k][i]', his_list[k][i])
              his_list[k][i].imgtitle = "暂无标题";

            }
          }


          wx.setStorageSync('history_list', his_list);  //将这个列表存放在缓存中

          //总页数
          pages = res.data.pages
          wx.setStorageSync('history_pages', pages);
        }
        else {
          console.log('历史记录界面', res.data.errmsg);
          exp.exception(res.data.errcode);

        }
      }, fail: function (res) {
        inter.Toast_Remind('请保持网络通畅', 'none')

      },
      complete: function (res) {
        if (wx.getStorageSync('history_pages') == 0) {
          inter.Toast_Remind('暂无记录', 'none')
        }
        else {
          var p = wx.getStorageSync('mypage');
          console.log('第几页', p)

          that.setData({
            postList: wx.getStorageSync('history_list')[p - 1],
          })
        }
      }
    })
  }
})