const util = require('../../utils/util.js')


Page({

  
  /**
   * 页面的初始数据
   */
  data: {
    deviceId: null,
    bindCommands: []
  },

  getBindCommandKeys: function(){
    var ZHOnlyTitle = util.ZHFunctionCellMode.ZHOnlyTitle
    var ZHTitleAndSwitch = util.ZHFunctionCellMode.ZHTitleAndSwitch
    var functionMode = util.ZHFunctionMode
    console.log("functionMode 11111", functionMode.ZHLogin)

    let that = this
    var login = that.getFunctionObject('登录', ZHOnlyTitle, functionMode.ZHLogin)
    var bind = that.getFunctionObject('绑定用户', ZHOnlyTitle, functionMode.ZHBind)
    var cancelBind = that.getFunctionObject('解除绑定', ZHOnlyTitle, functionMode.ZHCancelBind)
    var cancelConnect = that.getFunctionObject('断开连接', ZHOnlyTitle, functionMode.ZHCancelConnect)

    return [login,bind,cancelBind,cancelConnect]

  },

  getSetCommandKeys: function(){

  },

  getSportCommandKeys: function(){

  },

  getAssistCommandKeys: function(){

  },

  getOTACommandKeys: function(){

  },

  getTestCommandKeys: function(){

  },

  getFunctionObject: function (title,cellMode,functionMode){
     var functionModel = new Object()
     functionModel.cellMode = cellMode
     functionModel.functionMode = functionMode
     functionModel.title = title
     return functionModel
  },

  
  clickBindCmd: function (event){
    var functionMode = event.target.dataset.functionmode
    console.log("click functionMode", functionMode)
    
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("options", options.deviceId)
    console.log("2222233333")
    var bindCmds = this.getBindCommandKeys()
   
    
    this.setData({
      deviceId: options.deviceId,
      bindCommands: bindCmds
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