//app.js
//var timer = require('../../utils/timer.js')
var exp = require('utils/exception.js')
App({
  onUnload: function () {
    console.log("app.js - onload")
    wx.request({
      url: 'https://crp.shakeel.cn/session-destroy',
      method: 'GET',
      data: {
        sessionId: wx.getStorageSync('sessionId')
      },
      success: function (res) {
        if (res.data.errcode == 1000) {
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
        if (res.data.errcode == 1) {
          wx.showToast({
            title: '服务器遇到了异常，请稍后再试',
            icon: 'none',
            duration: 2000
          })
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
  },


  onLaunch: function () {
    console.log('进入小程序')
    if(!wx.getStorageSync('sessionId')==""){
   wx.request({
     url: 'https://crp.shakeel.cn/session-keep',
     method:'GET',
     data:{
       'sessionId':wx.getStorageSync('sessionId'),
     },
     success:function(res){
       if(res.data.errcode==0)
       {
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
               console.log('打开时刷新未邀请个数', res.data)
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
         return 
       }
       if(res.data.errcode==1002){
         wx.showModal({
           title: '提示',
           content: '请选择登录或者离线使用',
           confirmText:'同意登录',
           cancelText:'离线使用',
           success: function (res) {
             if (res.confirm) {
               console.log('用户点击确定')
               wx.showLoading({
                 title: '正在登录',
                 mask:true,
               })
               //设备id获取，sessionId获取
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
                     //这个时候会话创建
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
                   wx.showToast({
                     title: '获取设备ID失败',
                     icon: 'none',
                     duration: 2000
                   });
                 },
                 complete: function (res) {
                   console.log('获取设备的did', wx.getStorageSync('did'))
                   if (!wx.getStorageSync('did') == "")  //如果已经获取了设备的ID，那么就登录
                   {
                     console.log('index-js登录', wx.getStorageSync('sessionId'))
                     // 登录
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
                             console.log('index.js文件', res1.data)
                             wx.setStorageSync('sessionId', res1.data.sessionId);
                             console.log('=================session success=================')
                             // console.log(res.data.fg)
                             if (res1.data.errcode == 0) {  //如果登录成功
                               console.log(res1.data.sessionId);
                               wx.showToast({
                                 title: '登录成功',
                                 icon: 'success',
                                 duration: 2000
                               })
                               return
                             }
                             if (res1.data.errcode == 1) {
                               wx.showToast({
                                 title: '服务器遇到了异常，请稍后再试',
                                 icon: 'none',
                                 duration: 2000
                               })
                               return
                             }

                             else {
                               exp.exception(res.data.errcode)
                             }

                           },
                           fail: function (res) {
                             console.log('=================session fail=================')
                             wx.showToast({
                               title: '请连接服务器',
                               icon: 'none',
                               duration: 2000
                             })
                           },
                           complete: function (res) {
                             console.log('app登录完成')
                           }
                         })
                       }

                     })
                     // 获取用户信息
                  

                   }

                   else {
                     wx.hideLoading();
                     //如果没有获取到设备的信息did{}
                     wx.showModal({
                       title: '注意',
                       content: '服务器无法获取设备的唯一ID，请重新授权',
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
                     })
                   }
                 }
               })

             } else if (res.cancel) {
               wx.hideLoading();
               console.log('用户点击取消')
             }
           }
         })
        
return
       }
else{
  exp.exception(res.data.errcode);
}
     },
     fail:function(res){
       wx.showToast({
         title: '请保持网络通畅',
         icon:'none',
         duration:2000
       })
     }
   })
    }
    else{
      //这个时候会话是不存在的
      wx.showModal({
        title: '提示',
        content: '请选择登录或者离线使用',
        confirmText: '同意登录',
        cancelText: '离线使用',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
            wx.showLoading({
              title: '正在登录',
              mask: true,
            })
            //设备id获取，sessionId获取
            wx.request({
              url: 'https://crp.shakeel.cn/did',
              method: 'GET',
              header: {
                'content-type': 'application/x-www-form-urlencoded' // 默认值
              },
             
              success: function (res) {
                if (res.data.errcode == 0) {
                  //这个时候会话创建
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
                wx.showToast({
                  title: '获取设备ID失败',
                  icon: 'none',
                  duration: 2000
                });
              },
              complete: function (res) {
                console.log('获取设备的did', wx.getStorageSync('did'))
                if (!wx.getStorageSync('did') == "")  //如果已经获取了设备的ID，那么就登录
                {
                  console.log('app-js登录', wx.getStorageSync('sessionId'))
                  // 登录
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
                            console.log(res1.data.sessionId);
                            wx.showToast({
                              title: '登录成功',
                              icon: 'success',
                              duration: 2000
                            })
                            return
                          }
                          if (res1.data.errcode == 1) {
                            wx.showToast({
                              title: '服务器遇到了异常，请稍后再试',
                              icon: 'none',
                              duration: 2000
                            })
                            return
                          }

                          else {
                            exp.exception(res.data.errcode)
                          }

                        },
                        fail: function (res) {
                          console.log('=================session fail=================')
                          wx.showToast({
                            title: '请连接服务器',
                            icon: 'none',
                            duration: 2000
                          })
                        },
                        complete: function (res) {

                          console.log('app登录完成')
                        }
                      })
                    }

                  })
                  // 获取用户信息


                }

                else {
                  wx.hideLoading();
                  //如果没有获取到设备的信息did{}
                  wx.showModal({
                    title: '注意',
                    content: '服务器无法获取设备的唯一ID，请重新授权',
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
                  })
                }
              }
            })

          } else if (res.cancel) {
            wx.hideLoading();
            console.log('用户点击取消')
          }
        }
      })
    }

    //  wx.setStorageSync('active', true);
    // 展示本地存储能力
    var that = this
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

  },


  globalData: {  //全局变量
    userInfo: wx.getStorageSync('user'),  //记录用户信息
    chooseFiles: null,//保存已经选择的图片
    userimages: [],  //用于作为该用户的本地缓存

  }
})