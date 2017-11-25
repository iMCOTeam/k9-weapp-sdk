var realTekBTManager = require('../../utils/ZHBTManager.js')
var preDef = require('../../utils/ZHBTServiceDef.js')
var common = require("../../utils/ZHCommon.js")
var cmdPreDef = require("../../utils/ZHBTCmdPreDef.js")

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
   
  

  // 搜索设备
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
        console.log("startBluetoothDevicesDiscovery success")
        realTekBTManager.getBluetoothDevices({
          success: function(res){
            console.log("getBluetoothDevices success"+ JSON.stringify(res))
            if (res.devices && (res.devices.length > 0)){
              console.log("divices count" + res.devices.length)
              wx.hideLoading()
              that.setData({
                discoverDevices: res.devices
              })
            }else{
              wx.showToast({
                title: 'device count is 0',
              })
            }

          },
          fail: function(res){
            console.log("getBluetoothDevices fail" + res.errMsg)
            wx.hideLoading()
            wx.showToast({
              title: res.errMsg,
            })

          }
        })


      }

    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    common.printDebugInfo("zhuozhuo test", common.ZH_Log_Level.ZH_Log_Error)
    
    var buffer = realTekBTManager.getL2HeaderWithCommandId(cmdPreDef.ZH_RealTek_CMD_ID.RealTek_CMD_Bind)
    common.printLogWithBuffer(buffer,"test test")

    var testIdenti = 12
    if(testIdenti){
      console.log("testIdentifier 1111")
    }

    var testUndi = 33
    if(testUndi){
      console.log("testIdentifier 222")
    }

    


    //先获取已经连接手机的特殊设备（UUIDS）
    /*realTekBTManager.getConnectedBluetoothDevices({
      services: that.data.serviceUUIDs,
      success: function (res) {
        if (res.devices) {
          if (that.data.discoverDevices.length > 0) {
            var connectedDevices = new Array()
            res.devices.forEach(function (value, index, a) {
              var temDevice = new Object()
              temDevice.name = value.name
              temDevice.deviceId = value.deviceId
              temDevice.localName = value.name
              temDevice.RSSI = 0
              connectedDevices.concat(temDevice)
            })
            that.setData({
              discoverDevices: connectedDevices
            })
          }
        }
      },
      fail: function (res) {

      }
    })*/


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
    

    realTekBTManager.Singleton ++
    console.log("device page onShow:", realTekBTManager.Singleton)

   
    let that = this
    realTekBTManager.openBluetoothAdapter({
      success: function (res) {
        console.log("openBluetoothAdapter success")
        that.scanDevice()
      },
      fail: function (res) {
        console.log("open bluetoolth fail" ,res.errMsg)
        wx.showToast({
          title: res.errMsg,

        })
      }
    })
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
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log("page onReachBottom")
  },

})