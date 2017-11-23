const util = require('../../utils/util.js')
const manager = require("../../utils/ZHBTManager.js")
let preModel = require("../../utils/ZHBTModel.js")

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
    var that  = this
    var functionMode = event.target.dataset.functionmode
    console.log("click functionMode", functionMode)
    var Function_Keys = util.ZHFunctionMode
    var identifier = "a_test_user"
    switch(functionMode){
      case (Function_Keys.ZHLogin):{
        that.loginWithIdentifier(identifier)
      }
      break;
      case (Function_Keys.ZHBind):{
        that.bindDeviceWithIdentifier(identifier)

      }
      break;
      case (Function_Keys.ZHCancelBind):{
        that.unBind()

      }
      break;
      case (Function_Keys.ZHCancelConnect):{
        that.disconnect()
      }
      break;
    }
  },

  /* - Functions - */



  /*
  * Login
  */
  loginWithIdentifier: function (identifier){
    wx.showLoading({
      title: 'Login...',
    })
    manager.loginDeviceWithIdentifier(identifier,function(device,error,result){
      wx.hideLoading()
      if(error){
        wx.showToast({
          title: error.errMsg,
        })
      }else{
        
        var Login_Status = preModel.ZH_RealTek_Login_Status
        if (result == Login_Status.RealTek_Login_Success){
          wx.showToast({
            title: "Login success indicates that it is already bound",
          })
        } else if (result == Login_Status.RealTek_Login_TimeOut){
          wx.showToast({
            title: "The user ID is inconsistent and the login fails",
          })
        }
      }
    })
  },

  /*
  * Bind
  */

  bindDeviceWithIdentifier: function (identifier){
    wx.showLoading({
      title: 'Bind...',
    })
    manager.bindDeviceWithIdentifier(identifier, function (device, error, result){
      wx.hideLoading()
      if (error) {
        wx.showToast({
          title: error.errMsg,
        })
      }else{
        
        var Bind_Status = preModel.ZH_RealTek_Bind_Status
        if (result == Bind_Status.RealTek_Bind_Success) {
          wx.showToast({
            title: "Bind Success",
          })
        } else if (result == Bind_Status.RealTek_Bind_Faild) {
          wx.showToast({
            title: "Operation Timeout failed",
          })
        }

        
      }

    })

  },

  /*
  * UnBind
  */
  unBind: function(){
    wx.showLoading({
      title: 'UnBind...',
    })
    
    manager.unBindDeviceonFinished(function (device, error, result){
      wx.hideLoading()
      if (error) {
        wx.showToast({
          title: error.errMsg,
        })
      } else{
        wx.showToast({
          title: "UnBind Success",
        })
      }
    })

  },

  /*
  * Disconnect
  */

  disconnect: function(){
    wx.showLoading({
      title: 'Disconnect...',
    })
    var devie = manager.connectedDevice
    if(devie){
      manager.cancelPeripheralConnection(devie.deviceId, function(device, error, result){
        wx.hideLoading
        if(error){
          wx.showToast({
            title: error.errMsg,
          })

        }else{
          wx.showToast({
            title: 'Disconnect success',
          })

        }
      })

    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("options", options.deviceId)
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