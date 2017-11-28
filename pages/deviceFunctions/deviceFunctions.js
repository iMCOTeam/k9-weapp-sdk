const util = require('../../utils/util.js')
const manager = require("../../utils/ZHBTManager.js")
let preModel = require("../../utils/ZHBTModel.js")

Page({
  /**
   * 页面的初始数据
   */
  data: {
    deviceId: null,
    bindCommands: [],
    setCommands: []
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
    var ZHOnlyTitle = util.ZHFunctionCellMode.ZHOnlyTitle
    var ZHTitleAndSwitch = util.ZHFunctionCellMode.ZHTitleAndSwitch
    var functionMode = util.ZHFunctionMode
    let that = this

    var synTime = that.getFunctionObject("同步时间", ZHOnlyTitle, functionMode.ZHSynTime)
    var setAlarm = that.getFunctionObject("设置闹钟", ZHOnlyTitle, functionMode.ZHSynAlarm)
    var getAlarms = that.getFunctionObject("获取闹钟列表", ZHOnlyTitle, functionMode.ZHGetAlarms)
    var setStepTarget = that.getFunctionObject("计步目标设定", ZHOnlyTitle, functionMode.ZHSetStepTarget)
    var setUserProfile = that.getFunctionObject("用户信息设置", ZHOnlyTitle, functionMode.ZHSynUserProfile)
    var sittingRemider = that.getFunctionObject("久坐提醒", ZHTitleAndSwitch, functionMode.ZHSetSittingReminder)
    var getSittingRemider = that.getFunctionObject("获取久坐提醒", ZHOnlyTitle, functionMode.ZHGetSittingReminder)
    var synPhoneSystem = that.getFunctionObject("手机操作系统设置", ZHOnlyTitle, functionMode.ZHSetMobileSystem)
    var enterPhotoMode = that.getFunctionObject("进入拍照模式", ZHOnlyTitle, functionMode.ZHEnterPhotoMode)
    var exitPhotoMode = that.getFunctionObject("退出拍照模式", ZHOnlyTitle, functionMode.ZHExitPhotoMode)
    var RHLightScreen = that.getFunctionObject("抬手亮屏", ZHTitleAndSwitch, functionMode.ZHSetRaiseHandLight)
    var getRHLightScreenSetting = that.getFunctionObject("获取抬手亮屏状态", ZHOnlyTitle, functionMode.ZHGetRaiseHandLightSet)
    var qqReminder = that.getFunctionObject("QQ提醒", ZHTitleAndSwitch, functionMode.ZHQQReminder)
    var wechatReminder = that.getFunctionObject("微信提醒", ZHTitleAndSwitch, functionMode.ZHWeChatReminder)
    var smsReminder = that.getFunctionObject("短信提醒", ZHTitleAndSwitch, functionMode.ZHSMSReminder)
    var lineReminder = that.getFunctionObject("Line提醒", ZHTitleAndSwitch, functionMode.ZHLineReminder)
    var incomingReminder = that.getFunctionObject("来电提醒", ZHTitleAndSwitch, functionMode.ZHIncomingReminder)
    var setScreenDirection = that.getFunctionObject("横竖屏设置", ZHTitleAndSwitch, functionMode.ZHSetScreenOrientation)
    var getScreenDirection = that.getFunctionObject("获取横竖屏设置", ZHOnlyTitle, functionMode.ZHGetScreenOrientation)
    var deviceFunctions = that.getFunctionObject("获取设备功能", ZHOnlyTitle, functionMode.ZHDeviceFunctions)


    return [synTime, setAlarm, getAlarms, setStepTarget, setUserProfile, sittingRemider, getSittingRemider, synPhoneSystem, enterPhotoMode, exitPhotoMode, RHLightScreen, getRHLightScreenSetting, qqReminder, wechatReminder, smsReminder, lineReminder, incomingReminder, setScreenDirection, getScreenDirection, deviceFunctions];
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
    var identifier = "atestuser"
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

  clickSetCmd: function(event){
    var that = this
    var functionMode = event.target.dataset.functionmode
    console.log("click functionMode", functionMode)
    var Function_Keys = util.ZHFunctionMode
    switch (functionMode) {
      case (Function_Keys.ZHSynTime): {
        that.synTime()
      }
        break;
      case (Function_Keys.ZHSynAlarm):{
        that.setAlarms()

      }
        break;
      case (Function_Keys.ZHGetAlarms):{
        that.getAlarms()

      }
      break

      case (Function_Keys.ZHSetStepTarget):{
        that.setStepTarget()

      }
      break

      case (Function_Keys.ZHSynUserProfile):{
        that.setUserProfile()

      }
      break
    
      case (Function_Keys.ZHSetSittingReminder):{
        that.setLongSit()

      }
      break;
      
      case (Function_Keys.ZHGetSittingReminder):{
        that.getLongSitRemind()

      }
      break;
      
      case (Function_Keys.ZHSetMobileSystem):{
        that.setOS()

      }
      break;
      
    }
  },

  /* - Functions - */


  /*
  * Set OS
  */
  setOS: function(){
    var os = preModel.ZH_RealTek_OS.ZH_RealTek_OS_iOS
    wx.showLoading({
      title: 'Set OS...',
    })
    manager.setMoblieOS(os,function (device, error, result){
      wx.hideLoading()
      if (error) {
        wx.showToast({
          title: error.errMsg,
        })
      } else {
        wx.showToast({
          title: "Set OS Success...",
        })

      }
    })

  },

  /*
  * get long sit reminder enable
  */

  getLongSitRemind: function(){
    wx.showLoading({
      title: 'get LongSit reminder enable...',
    })
    manager.getLongSitRemindonFinished(function (device, error, result){
      wx.hideLoading()
      if (error) {
        wx.showToast({
          title: error.errMsg,
        })
      } else {
        if(result == null){
          var info = "Get Long Sit Failed"
          wx.showToast({
            title: info,
          })
          return;
        }
        if(result){
          var info = "Long Sit is On"
          wx.showToast({
            title: info,
          })

        }else{
          var info = "Long Sit is Off"
          wx.showToast({
            title: info,
          })
        }
        

      }
    })

  },

  /*
  * set longsit reminder
  */
  setLongSit: function(){
    var sit = preModel.initLongSit()
    sit.enable = true
    sit.sitTime = 5 //久坐时间 min

    wx.showLoading({
      title: 'Set LongSit...',
    })
    manager.setLongSitRemind(sit, function (device, error, result){
      wx.hideLoading()
      if (error) {
        wx.showToast({
          title: error.errMsg,
        })
      } else {
        wx.showToast({
          title: "Set LongSit Success...",
        })

      }
    })



  },


  /*
  * set User profile
  */
  setUserProfile: function(){
    var gender = preModel.ZH_RealTek_Gender.ZH_RealTek_Male
    var age = 20 
    var height = 170 //cm
    var weight = 50 //kg

    wx.showLoading({
      title: 'Set User Profile...',
    })
    manager.setUserProfileWithGender(gender, age, height, weight, function (device, error, result){
      wx.hideLoading()
      if (error) {
        wx.showToast({
          title: error.errMsg,
        })
      } else {
        wx.showToast({
          title: "Set User Profile Success...",
        })

      }
    })

  },



  /* 
  *set step target
  */

  setStepTarget: function(){
    wx.showLoading({
      title: 'Set step target...',
    })
    var stepTarget = 100
    manager.setStepTarget(stepTarget, function (device, error, result){
      wx.hideLoading()
      if (error) {
        wx.showToast({
          title: error.errMsg,
        })
      } else {
        wx.showToast({
          title: "Set step target Success...",
        })

      }
    })

  },

  /*
  * set Alarms
  */
  setAlarms: function(){
    wx.showLoading({
      title: 'Syn Alarms...',
    })
    var alarms = this.getTestAlarms()
    manager.synAlarms(alarms, function (device, error, result){
      wx.hideLoading()
      if (error) {
        wx.showToast({
          title: error.errMsg,
        })
      } else {
        wx.showToast({
          title: "Syn Alarm Success...",
        })

      }

    })


  },

  getTestAlarms: function(){
    var date = new Date()
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    var hour = date.getHours() 
    var minute = date.getMinutes() 

    var alarm1 = preModel.initAlarm()
    alarm1.year = year;
    alarm1.month = month;
    alarm1.day = day;
    alarm1.hour = hour;
    alarm1.minute = minute + 2;
    alarm1.index = 0;
    alarm1.dayFlags = 0;
    alarm1.enable = true;

    var alarm2 = preModel.initAlarm()
    alarm2.year = year;
    alarm2.month = month;
    alarm2.day = day;
    alarm2.hour = hour;
    alarm2.minute = minute + 4;
    alarm2.index = 1;
    alarm2.dayFlags = 0;
    alarm2.enable = true;

    var alarm3 = preModel.initAlarm()

    alarm3.year = year;
    alarm3.month = month;
    alarm3.day = day;
    alarm3.hour = hour;
    alarm3.minute = minute + 6;
    alarm3.index = 2;
    alarm3.dayFlags = 0;
    alarm3.enable = false;


   return[alarm1,alarm2,alarm3]
  },

  /*
  * Get Alarms
  */

  getAlarms: function(){
    wx.showLoading({
      title: 'Get Alarms...',
    })

    manager.getBandAlarmsonFinished(function (device, error, result){
      wx.hideLoading()
      if (error) {
        wx.showToast({
          title: error.errMsg,
        })
      } else {
        var info = "Get Alarm Success,Alarms Count:" + result.length
        wx.showToast({
          title: info,
        })
      }

    })

  },

  /* 
  *  Syn Time
  */

  synTime:function(){
    wx.showLoading({
      title: 'Syn Time...',
    })
    manager.synTimeonFinished(function(device,error,result){
      wx.hideLoading()
      if (error) {
        wx.showToast({
          title: error.errMsg,
        })
      }else{
        wx.showToast({
          title: "Syn Time Success...",
        })

      }

    })

  },



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
    
      
    manager.cancelPeripheralConnection(function(device, error, result){
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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("options", options.deviceId)
    var bindCmds = this.getBindCommandKeys()
    var setCmds = this.getSetCommandKeys()
    this.setData({
      deviceId: options.deviceId,
      bindCommands: bindCmds,
      setCommands: setCmds
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
    var device = manager.getConnectedDevice()
    if(device){
      wx.showToast({
        title: device.deviceId,
      })
    }else{
      console.log("have not find device")
    }
    
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