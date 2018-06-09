//logs.js
const util = require('../../utils/util.js')
var timer = require('../../utils/timer.js')
Page({
  data: {
    logs: []
  },
  onLoad: function () {
    wx.setStorageSync('active', true);
    //timer.timer();
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(log => {
        return util.formatTime(new Date(log))
      })
    })
  }
})
