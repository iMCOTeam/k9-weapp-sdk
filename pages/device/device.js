var realTekBTManager = require('../../utils/ZHBTManager.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    serviceUUIDs: ["000001ff-3C17-D293-8E48-14FE2E4DA212"],
    loadingHidden: true,
    discoverDevices: []
    
  },

  storeLogs:function(loginfo){
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(loginfo)
    wx.setStorageSync('logs', logs)
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
            if (res.devices){
              console.log("divices count" + res.devices.length)
              wx.hideLoading()
              that.setData({
                discoverDevices: res.devices
              })
            }else{
              console.log("device count is null")
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
    

    //先获取已经连接手机的特殊设备（UUIDS）
    /*realTekBTManager.getConnectedBluetoothDevices({
      services: that.data.serviceUUIDs,
      success: function (res) {
        that.storeLogs("getConnectedBluetoothDevices success");
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
        that.storeLogs("getConnectedBluetoothDevices success" + res.errMsg);

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
    console.log("page onShow")
    let that = this
    realTekBTManager.openBluetoothAdapter({
      success: function (res) {
        console.log("openBluetoothAdapter success")
        that.scanDevice()

      },
      fail: function (res) {
        console.log("open bluetoolth fail 111" ,res.errMsg)
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