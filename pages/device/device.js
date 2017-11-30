const realTekBTManager = require('../../utils/ZHBTManager.js')
const preDef = require('../../utils/ZHBTServiceDef.js')
const common = require("../../utils/ZHCommon.js")
const cmdPreDef = require("../../utils/ZHBTCmdPreDef.js")

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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    

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
    this.openBluetoothAdaper()
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
    this.openBluetoothAdaper()

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log("page onReachBottom")
  },

})