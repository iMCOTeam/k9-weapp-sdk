//logs.js
const util = require('../../utils/util.js')

Page({
  data: {
    logs: []
  },

  onLoad: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(log => {
        //return util.formatTime(new Date(log))
        return log;
      })
    })
  }

})
