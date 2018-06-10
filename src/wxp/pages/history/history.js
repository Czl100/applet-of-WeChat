var timer = require('../../utils/timer.js')
var exp = require('../../utils/exception.js')
var app = getApp();
var List_;
var his_list = [];  //生命一个数组用于缓存
var pages = 1;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // pages:1,//初始值总页数是1
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setStorageSync('active', true);
  //  timer.timer();
    //   timer.timer();
    //  wx.setStorageSync('history_list', List_);  //将这个列表存放在缓存中
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  onbefore: function () { //点击上一页
    wx.setStorageSync('active', true);
   // timer.timer();
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
    wx.setStorageSync('mypage', that.data.mypage);  //当前页数存入缓存
    console.log('点击上一页', that.data.mypage)
    wx.request({
      url: 'https://crp.shakeel.cn/query-history',
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        'sessionId': wx.getStorageSync('sessionId'),
        // 'page': that.data.mypage
        'page': wx.getStorageSync('mypage')
      },

      success: function (res) {
        if (res.data.errcode == 1) {
       //   exp(res.data.errcode);
          wx.showToast({
            title: '服务器遇到了异常，请稍后再试',
            icon: 'none',
            duration: 2000
          })
          return
        }
        if (res.data.errcode == 0) {
         // exp.exception(res.data.errcode);
          console.log('发送查询历史信息请求', res.data),
            console.log('当前的页数是', wx.getStorageSync('mypage')),
            //固定放在某一页
            his_list[wx.getStorageSync('mypage') - 1] = res.data.list;
          for (var i = 0; i < i < his_list[wx.getStorageSync('re_mypage') - 1].length; i++) {
            if (his_list[wx.getStorageSync('mypage') - 1][i].imgtitle == "") {
              his_list[wx.getStorageSync('mypage') - 1][i].imgtitle = '暂无标题'
            }
          }
          
          wx.setStorageSync('history_list', his_list);
          
          //总页数
          pages = res.data.pages
          wx.setStorageSync('history_pages', pages);
        
          console.log('总页数pages', pages);
          console.log('服务器上的总页数', res.data.pages);
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
          duration: 2000
        })
      },
      complete: function () {
        if (wx.getStorageSync('history_pages') == 0) {
          wx.showToast({
            title: '暂无记录',
            icon: 'none',
            duration: 2000
          })
        }
        else{
         
        var p = wx.getStorageSync('mypage');
        console.log('上一页的p', p)
        // var that=this;
        if (!wx.getStorageSync('history_list')[p - 1] == "") {
          if (wx.getStorageSync('history_list')[p - 1].imgtitle==""){
            
          }
          that.setData({
            postList: wx.getStorageSync('history_list')[p - 1],
          })
        }
        }
      }
    })
  },
  onafter: function () { //点击下一页
    wx.setStorageSync('active', true);
  //  timer.timer();
    console.log(this.data.mypage, pages);
    pages = wx.getStorageSync('history_pages', pages);
    if (!pages == "") {
      if (this.data.mypage < pages) {
        this.setData({
          mypage: this.data.mypage + 1
        })

        // wx.setStorageSync('history_mypage', this.data.mypage);  //当前页数存入缓存
      }
      else {
        this.setData({
          mypage: pages
        })
        //   wx.setStorageSync('history_mypage', this.data.mypage);  //当前页数存入缓存
      }
    }
    else {
      mypage: 1
    }
    var that = this;
    wx.setStorageSync('mypage', that.data.mypage);  //当前页数存入缓存
    console.log('点击下一页', that.data.mypage)
    wx.request({
      url: 'https://crp.shakeel.cn/query-history',
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        'sessionId': wx.getStorageSync('sessionId'),
        'page': that.data.mypage
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
        if (res.data.errcode == 0) {
          console.log('发送查询历史信息请求', res.data),
            console.log('当前的页数是', wx.getStorageSync('mypage')),
            //固定放在某一页
            his_list[wx.getStorageSync('mypage')] = res.data.list;
          console.log('当前页面', his_list[wx.getStorageSync('mypage')])
          var len = his_list[wx.getStorageSync('mypage')].length;
          var k = wx.getStorageSync('mypage') - 1
          console.log('下一页的list长度', his_list[wx.getStorageSync('mypage')].length);

          for (var i = 0; i < len; i++) {
            console.log('k')
            if ((his_list[k][i].imgtitle == "")) {
              console.log('his_list[k][i]', his_list[k][i])
              his_list[k][i].imgtitle = "暂无标题";
              console.log('k2')
            }
          }
          wx.setStorageSync('history_list', his_list);
          //     List_ = res.data.list
          //   console.log(List_)  //打印出来看看
          //总页数
          pages = res.data.pages;
          wx.setStorageSync('history_pages', pages);
          /*
          that.setData({
            postList: List_
          })
          */
          console.log('总页数pages', pages);
          console.log('服务器上的总页数', res.data.pages);
        }
        else {
          console.log('历史记录界面', res.data.errmsg);
          exp.exception(res.data.errcode);
       
        }
        
      },
      fail: function (res) {
        wx.showToast({
          title: '请保持网络通畅',
          icon: 'none',
          duration: 2000
        })
      },
      complete: function (res) {
        if (wx.getStorageSync('history_pages') == 0) {
          wx.showToast({
            title: '暂无记录',
            icon: 'none',
            duration: 2000
          })
        }
        else{
        var p = wx.getStorageSync('mypage');
        console.log('下一页的p', p)
        // var that=this;
        that.setData({
          postList: wx.getStorageSync('history_list')[p - 1],
        })
        console.log('点击下一页的数据动态渲染结果', wx.getStorageSync('history_list')[p - 1])
        /*
        var len = that.data.postList.length;
        console.log('这个一页的图片长度', len)
        for (var i = 0; i < len; i++) {
          if (that.data.postList[i].imgtitle == "") {
            //     console.log('图片标题空',that.data.postList[0].imgtitle)
            that.data.postList[i].imgtitle = '暂无标题'

          }
        }
        */
      }
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */

  onShow: function () {
    wx.setStorageSync('active', true);
  //  timer.timer();
    var that = this;

    var sessionId = wx.getStorageSync('sessionId');
    wx.setStorageSync('mypage', that.data.mypage);
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
        // 'page':that.data.mypage
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
        if (res.data.errcode == 0) {
          console.log('发送查询历史信息请求', res.data),
            console.log('onshow当前的页数是', wx.getStorageSync('mypage')),
            //固定放在某一页
            his_list[wx.getStorageSync('mypage') - 1] = res.data.list;
         var len = his_list[wx.getStorageSync('re_mypage') - 1].length;
          var k = wx.getStorageSync('mypage') - 1
          console.log('onshow的list长度', his_list[wx.getStorageSync('re_mypage') - 1].length);
         
          for (var i = 0; i < len;i++){
          console.log('k')
           if (his_list[k][i].imgtitle=="")
           {
             console.log('his_list[k][i]', his_list[k][i])
             his_list[k][i].imgtitle="暂无标题";
             console.log('k2')
           }
         }
         
          console.log('k3',his_list[0][0].imgtitle)
          wx.setStorageSync('history_list', his_list);  //将这个列表存放在缓存中
          console.log('his_list', his_list)  //打印出来看看
          //总页数
          pages = res.data.pages
          wx.setStorageSync('history_pages', pages);

          console.log('数据缓存', wx.getStorageSync('history_list'))
          console.log('总页数pages', pages);
          console.log('服务器上的总页数', res.data.pages);
        }
        else {
          console.log('历史记录界面', res.data.errmsg);
          exp.exception(res.data.errcode);
         
        }
      }, fail: function (res) {
        wx.showToast({
          title: '请保持网络通畅',
          icon: 'none',
          duration: 2000
        })

      },
      complete: function (res) {
        if (wx.getStorageSync('history_pages')==0){
          wx.showToast({
            title: '暂无记录',
            icon:'none',
            duration:2000
          })
        }
        else{
        var p = wx.getStorageSync('mypage');
        console.log('p', p)
       // console.log('历史记录的1', wx.getStorageSync('history_list')[p - 1][1].imgtitle)
      
        that.setData({
          postList: wx.getStorageSync('history_list')[p - 1],
        })
        /*
        var len=that.data.postList.length;
        console.log('这个一页的图片长度', len)
        for (var i = 0; i < len; i++) {
          if (that.data.postList[i].imgtitle == "") {
            //     console.log('图片标题空',that.data.postList[0].imgtitle)
       //     that.data.postList[i].imgtitle = '暂无标题'
       
          }
        }
        */
        }
      }
    })
    wx.request({
      url: 'https://crp.shakeel.cn/query-unread-number',
      method: 'GET',
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      data: {
        'sessionId': wx.getStorageSync('sessionId'),
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
        if (res.data.errcode == 0) {
          console.log('打开历史记录时查询未邀请个数', res.data)
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
          console.log('历史记录界面', res.data.errmsg);
          exp.exception(res.data.errcode);
         
        }
      }, fail: function (res) {
        wx.showToast({
          title: '请保持网络通畅',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  onpre: function (e) {
    wx.setStorageSync('active', true);
  //  timer.timer();
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