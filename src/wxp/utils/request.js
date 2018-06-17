
var exp = require('../utils/exception.js')
var inter = require('../utils/interface.js')
var timer = require('../utils/timer.js')

//获取设备的ID和登录
function Get_did(){  
  wx.request({
    url: 'https://crp.shakeel.cn/did',
    method: 'GET',
    header: {
      'content-type': 'application/x-www-form-urlencoded' // 默认值
    },
    data: {

    },
    success: function (res) {
      if (res.data.errcode == 0) {
        console.log('获取设备成功', res.data.did);
        wx.setStorageSync('did', res.data.did);//将设备的id存入缓存中
      }
      else {
        wx.hideLoading();
        exp.exception(errcode);
      }
    },
    fail: function (res) {
      wx.hideLoading();
      console.log('获取设备ID失败,服务器无法进行处理');
      wx.hideLoading();
      inter.Toast_Remind('请保持网络通畅', 'none')
    },
    complete: function (res) {
      console.log('获取设备的did', wx.getStorageSync('did'))
      if (!wx.getStorageSync('did') == "")  //如果已经获取了设备的ID，那么就登录
      {
        console.log('index-js登录', wx.getStorageSync('sessionId'))
        // 登录
       Login();


      }

      else {
        wx.hideLoading();
        //如果没有获取到设备的信息did{}
        inter.S_C('服务器无法获取设备的唯一ID，请重新授权', '确定’，‘取消')
      }
    }
  })
}
//登录
function Login(){
  console.log('request.js开始登陆')
  wx.login({
    success: res => {
      // 发送 res.code 到后台换取 openId, sessionKey, unionId
      var did = wx.getStorageSync('did');
      var requrl = 'https://crp.shakeel.cn/session-build?code=' + res.code + "&did=" + did
      console.log(requrl)
      wx.request({
        url: 'https://crp.shakeel.cn/session-build/',
        url: requrl,
        header: {
          'content-type': 'application/x-www-form-urlencoded' // 默认值
        },
        data: {
          //将用户信息发送上服务器
          'code': res.code,
          'did': did
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res1) {
          console.log('app.js文件', res1.data)
          wx.setStorageSync('sessionId', res1.data.sessionId);
          console.log('=================session success=================')
          // console.log(res.data.fg)
          if (res1.data.errcode == 0) {  //如果登录成功
            wx.setStorageSync('active', true);
            console.log('登录成功，打开定时器')
            timer.timer();

            wx.hideLoading();
            console.log(res1.data.sessionId);
            inter.Toast_Remind('登录成功', 'success')
          
            if (!wx, wx.getStorageSync('sessionId') == "") {
              Unread_Number();
            }
            return
          }

          else {
            wx.hideLoading();
            exp.exception(res.data.errcode)
          }

        },
        fail: function (res) {
          console.log('=================session fail=================')
          wx.hideLoading();
          inter.Toast_Remind('请保持网络通畅','none')
          console.log('登录失败')
         
        },
        complete: function (res) {
          console.log('request.js登录完成')
        }
      })
    }

  })

}
//获取未读个数
function Unread_Number(){
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
      if (res.data.errcode == 0) {
        console.log('’request.js‘刷新未邀请个数', res.data)
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
      inter.Toast_Remind('请保持网络通畅', 'none')
    }
  })
}
//请求服务器销毁会话
function Destory(){
  wx.request({
    url: 'https://crp.shakeel.cn/session-destroy',
    method: 'GET',
    data: {
      sessionId: wx.getStorageSync('sessionId')
    },
    success: function (res) {
      if (res.data.errcode == 1000) {
        inter.S_C(res.data.errmsg, '确定', '取消')
        return
      }

      else {
        console.log('成功销毁')
      }
    },
    fail: function (res) {
      console.log('销毁失败')
    }
  })
}

module.exports = {
  Get_did:Get_did,
  Unread_Number:Unread_Number,
  Login:Login,
  Destory:Destory,
}