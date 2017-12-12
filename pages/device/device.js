const realTekBTManager = require('../../utils/ZHBTManager.js')
const preDef = require('../../utils/ZHBTServiceDef.js')
const common = require("../../utils/ZHCommon.js")
const cmdPreDef = require("../../utils/ZHBTCmdPreDef.js")
const SHAHMAC = require("../../utils/ZHSHAHMAC.js")

Page({
  /**
   * 页面的初始数据
   */
  data: {
    serviceUUIDs: [preDef.RealTek_ServiceUUIDs.RealTek_BroadServiceUUID],
    loadingHidden: true,
    discoverDevices: []
    
  },

  /*
  * 点击列表事件
  */
  clickCell: function(event){
    var deviceId = event.target.dataset.deviceid
    console.log("click deviceId",deviceId)
    wx.showLoading({
      title: '正在连接...',
    })

    // 连接
    realTekBTManager.connectPeripheral(deviceId,function (device, error, result){
      wx.hideLoading()
      if(error){
        wx.showToast({
          title: res.errMsg,
        })
      }else{
        if (device){
          console.log("connected device have", device.deviceId)
        }else{
          console.log("connected device not have")
        }
        wx.navigateTo({
          url: '../deviceFunctions/deviceFunctions?deviceId=' + deviceId,
        })
      }
    })
    
  },

  /*
  * 兼容判定
  */
   
 getSystemInfo:function(){
   var that = this
   wx.getSystemInfo({
     success: function(res) {
       var sdkVersion = res.SDKVersion
       var version = parseFloat(sdkVersion)
       if(version < 1.1){
         wx.showModal({
           title: '提示',
           content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
         })
       }else{
         that.openBluetoothAdaper()
       }
       
     },
   })

 },

  /**
  * 打开蓝牙适配器
  */
  openBluetoothAdaper: function(){
    var that = this
    realTekBTManager.openBluetoothAdapter({
       success: function (res) {
         that.scanDevice()
       },
       fail: function (res) {
         wx.stopPullDownRefresh()
         wx.showToast({
           title: res.errMsg,

         })
       }
    })

  },
  
  /**
  * 搜索设备
  */
  scanDevice: function(){
    wx.showLoading({
      title: '搜索中...',
    })
    let that = this
    console.log("startBluetoothDevicesDiscovery")
    // 开始检索设备
    realTekBTManager.startBluetoothDevicesDiscovery({
      services: that.data.serviceUUIDs,
      allowDuplicatesKey: true,
      interval: 0,
      success: function (res) {//成功后则去获取已发现的蓝牙设备
        realTekBTManager.getBluetoothDevices({
          success: function(res){
            if (res.devices && (res.devices.length > 0)){
              wx.hideLoading()
              that.setData({
                discoverDevices: res.devices
              })
            }else{
              var info = "device count is 0 Please Pull Down Refresh" 
              wx.showToast({
                title: info,
              })
            }

          },
          fail: function(res){
            wx.hideLoading()
            wx.showToast({
              title: res.errMsg,
            })

          },
          complete: function (res){
            wx.stopPullDownRefresh()
          }
        })


      }

    })
  },


  /*
  * test SHAHMAC
  */

  testHMAC: function(){
    var appKey = "keyOPCjEL08cCCIgm33y8cmForWXLSR9uLT"
    var appSecret = "secaab78b9d7dbe11e7a420ee796be10e85-i6ff579j49afj5"
    var date = new Date()
    var timeInterval = Date.parse(date)
    var radom = Math.floor(Math.random() * 1000000 + 1)
    var nonce = radom
    var message = appKey + timeInterval + nonce
    var sign = SHAHMAC.b64_hmac_sha1(appSecret, message)

  
    var info = "Secret:" + appSecret + "---Message:" + message + "---result:" + sign
    console.log(info)
  },


  /*
  * test Requst
  */

  testRequst: function (callBack){
    var serverUrl = "https://xcx.cowatch.cn/api/test/wx_test"
    var ttt = 1234567
    var testVersion = "" + ttt

    var data = new Object()
    data.vendor = "iMCO"
    data.model = "K9"
    data.fwType = "4567"
    data.serial = "XD123efDg"
    data.fwVersion = testVersion
    
    var appKey = "keyOPCjEL08cCCIgm33y8cmForWXLSR9uLT"
    var appSecret = "secaab78b9d7dbe11e7a420ee796be10e85-i6ff579j49afj5"

    var date = new Date()
    var timeInterval = Date.parse(date)
    var radom = Math.floor(Math.random() * 1000000 + 1)
    var nonce = radom
    var message = appKey + timeInterval + nonce
    var sign = SHAHMAC.b64_hmac_sha1(appSecret, message)
    var appOS = "SmallWeChat"
    var appVersion = "1.0"

    var header = new Object()
    header.Timestamp = timeInterval
    header.Nonce = nonce
    header.AppKey = appKey
    header.Sign = sign
    header.AppOS = appOS
    header.AppVersion = appVersion

    wx.request({
      url: serverUrl,
      data: data,
      method: 'POST',
      header: header,
      success: function (res) {
        console.log("checkOTA Success Res:", JSON.stringify(res))
        if (callBack) {
          callBack(connectedDevice, null, res.data)
        }

      },
      fail: function (res) {
        console.log("checkOTA fail Res:", JSON.stringify(res))
        var error = null
        if (callBack) {
          callBack(connectedDevice, error, null)
        }

      }

    })

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var minute = 140
    var hour = minute/60
    hour = parseInt(hour)
    var min = minute%60
    var info = "hour:" + hour + " minute:" + min
    
    this.testHMAC()
   

  },



  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log("page onReady")
  },

  


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getSystemInfo()
    //this.testRequst(null)
  },



  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log("page onHide")
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log("page onUnLoad")
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    console.log("page onPullDownReresh")
    this.getSystemInfo()

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log("page onReachBottom")
  },

})