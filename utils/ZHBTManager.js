// preDef
var RealTek_ServiceUUIDs = {
  RealTek_BroadServiceUUID: '000001ff-3C17-D293-8E48-14FE2E4DA212', //广播ServiceUUID
  RealTek_Immediate_Remind_ServiceUUID: '1802', //立即提醒即查找手环ServiceUUID
  RealTek_Link_Loss_ServiceUUID: '1803', //防丢Service UUID
  RealTek_Battery_ServiceUUID: '180F', //电量Service UUID
  RealTek_OTAInfo_ServiceUUID: '0000d0ff-3C17-D293-8E48-14FE2E4DA212', //获取OTA信息的Service UUID
  RealTek_DFU_ServiceUUID: '00006287-3C17-D293-8E48-14FE2E4DA212' //用于升级固件时的广播和交互Service UUID
}


var CharacteristicUUIDs = {
  RealTek_Write_CharUUID: 'ff02', //写命令特征UUID （设置及登录绑定等命令通过写数据）
  RealTek_Notify_CharUUID: 'ff03', //Notify 特征UUID (接收数据通过Notify）
  RealTek_Immediate_Remind_CharUUID: '2A06', //立即响应特征UUID
  RealTek_AlertLevel_CharUUID: '2A06',  //防丢特征UUID
  RealTek_DeviceName_CharUUID: 'ff04', //手环名称特征UUID
  RealTek_BatteryLevel_CharUUID: '2A19', //手环电池特征UUID
  RealTek_EnterOTAMode_CharUUID: 'FFD1', // 进入OTA模式特征UUID
  RealTek_OTABDAddress_CharUUID: 'FFD2', // 获取固件BD address 特征UUID
  RealTek_OTAPatchVersion_CharUUID: 'FFD3', //获取固件Patch version 特征UUID
  RealTek_OTAAppVersion_CharUUID: 'FFD4', // 获取固件App version 特征UUID
  RealTek_DFUTransferData_CharUUID: '00006387-3C17-D293-8E48-14FE2E4DA212', //DFU时传输数据 特征UUID
  RealTek_DFUControlCmd_CharUUID: '00006487-3C17-D293-8E48-14FE2E4DA212', //DFU时与进行估计升级交互命令 特征UUID
  RealTek_Functions_CharUUID: 'FFD6' //获取设备功能列表 特征UUID
}

let BlueToolthErrorCode = [
  0, //正常
  10000, //未初始化蓝牙适配器
  10001, //当前蓝牙适配器不可用
  10002, //没有找到指定设备
  10003, //连接失败
  10004, //没有找到指定服务
  10005, //没有找到指定特征值
  10006, //当前连接已断开
  10007, //当前特征值不支持此操作
  10008, //其余所有系统上报的异常
  10009, //Android 系统特有，系统版本低于 4.3 不支持BLE
  10010, //没有找到指定描述符
  10011, //Android6.0以上系统因未打开定位导致搜寻蓝牙设备（startBluetoothDevicesDiscovery ）失败

]
  


//properties
var isScanning = false
var callBack = {}

function storeLogs(loginfo) {
  var logs = wx.getStorageSync('logs') || []
  logs.unshift(loginfo)
  wx.setStorageSync('logs', logs)
}
// functions
function initialBTManager(){
 
  //初始化蓝牙适配器
  /*openBluetoothAdapter({
    success: function (res) {
      console.log("open bluetoolth success")
      storeLogs("open bluetoolth success")
    },
    fail: function (res) {
      console.log("open bluetoolth fail",+res.errMsg)
      storeLogs("open bluetoolth fail", +res.errMsg)
    }
  })*/
  

  //监听蓝牙适配器状态改变
  onBluetoothAdapterStateChange(function (res){
    if (!res.available){
      console.log("bluetooth adapter is not valid")
      storeLogs("bluetooth adapter is not valid")
    }else{
      console.log("bluetooth adapter is valid")
      storeLogs("bluetooth adapter is valid")
    }
  })

  // 监听低功耗蓝牙连接的错误事件，包括设备丢失，连接异常断开等等。
  onBLEConnectionStateChange(function (res){
    if (!res.connected){
      console.log("bluetooth have disconnected with deviceId:${res.deviceId}")
    }
  })


}



/*
* 初始化蓝牙适配器
*/
function openBluetoothAdapter(obj) {
  wx.openBluetoothAdapter({
    success: function (res) {
      if (obj.success) {
        obj.success(res)
      }
    },
    fail: function (res) {
      if (obj.fail) {
        obj.fail(res)
      }

    },
    complete: function (res) {
      if (obj.complete) {
        obj.complete(res)
      }
    }
  })
}


/*
* 关闭蓝牙模块调用该方法将断开所有已建立的链接并释放系统资源
*/

function closeBluetoothAdapter(obj){
  wx.closeBluetoothAdapter({
    success: function(res) {
      if(obj.success){
        obj.success(res)
      }
    },
    fail: function(res){
      if(obj.fail){
        obj.fail(res)
      }
    },
    complete: function(res){
      if(obj.complete){
        obj.complete(res);
      }
    }
  })

}


/*
* 获取本机蓝牙适配器状态
*/

function getBluetoothAdapterState(obj){
  wx.getBluetoothAdapterState({
    success: function(res) {
      if(obj.success){
        obj.success(res)
      }
    },
    fail: function(res){
      if(obj.fail){
        obj.fail(res)
      }
    },
    complete: function(res){
      if(obj.complete){
        obj.complete(res)
      }
    }
  })
}


/*
*监听蓝牙适配器状态变化事件
*/

function onBluetoothAdapterStateChange(obj){
  wx.onBluetoothAdapterStateChange(function(res){
    if(obj){
      obj(res);
    }
  })
}


/*
* 开始搜寻附近的蓝牙外围设备。注意，该操作比较耗费系统资源，请在搜索并连接到设备后调用 stop 方法停止搜索。
*/

function startBluetoothDevicesDiscovery(obj){
  wx.startBluetoothDevicesDiscovery({
    success: function(res) {
      if(obj.success){
        obj.success(res)
      }
    },
    fail: function(res){
      if(obj.fail){
        obj.fail(res);
      }
    },
    complete: function(res){
      if (obj.complete){
        obj.complete(res);
      }
    },
    services: obj.services,
    interval: obj.interval
    
  })
}


/*
* 停止搜寻附近的蓝牙外围设备。请在确保找到需要连接的设备后调用该方法停止搜索。
*/

function stopBluetoothDevicesDiscovery(obj){
  wx.stopBluetoothDevicesDiscovery({
    success: function(res) {
      if(obj.success){
        obj.success(res)
      }
    },
    fail: function(res){
      if(obj.fail){
        obj.fail(res)
      }
    },
    complete: function(res){
      if(obj.complete){
        obj.complete(res)
      }
    }
  })
}


/*
*获取所有已发现的蓝牙设备，包括已经和本机处于连接状态的设备
*/

function getBluetoothDevices(obj){
  wx.getBluetoothDevices({
    success: function(res) {
      if(obj.success){
        obj.success(res)
      }
    },
    fail: function(res){
      if(obj.fail){
        obj.fail(res)
      }
    },
    complete: function(res){
      if(obj.complete){
        obj.complete(res)
      }
    }
  })
}

/*
* 根据 uuid 获取处于已连接状态的设备
*/

function getConnectedBluetoothDevices(obj){
  wx.getConnectedBluetoothDevices({
    services: obj.services,
    success: function(res) {
      if(obj.success){
        obj.success(res)
      }
    },
    fail: function(res){
      if(obj.fail){
        obj.fail(res)
      }
    },
    complete: function(res){
      if(obj.complete){
        obj.complete(res)
      }
    }
  })
}


/*
* 连接低功耗蓝牙设备
*/

function createBLEConnection(obj){
  wx.createBLEConnection({
    deviceId: obj.deviceId,
    success: function(res) {
      if(obj.success){
        obj.success(res);
      }
    },
    fail: function (res) {
      if (obj.fail) {
        obj.fail(res)
      }
    },
    complete: function (res) {
      if (obj.complete) {
        obj.complete(res)
      }
    }
  })
}


/*
* 断开与低功耗蓝牙设备的连接
*/

function closeBLEConnection(obj){
  wx.closeBLEConnection({
    deviceId: obj.deviceId,
    success: function(res) {
      if (obj.success) {
        obj.success(res);
      }
    },
    fail: function (res) {
      if (obj.fail) {
        obj.fail(res)
      }
    },
    complete: function (res) {
      if (obj.complete) {
        obj.complete(res)
      }
    }

  })
}


/*
* 获取蓝牙设备所有 service（服务）
*/

function getBLEDeviceServices(obj){
  wx.getBLEDeviceServices({
    deviceId: obj.deviceId,
    success: function(res) {
      if (obj.success) {
        obj.success(res);
      }
    },
    fail: function (res) {
      if (obj.fail) {
        obj.fail(res)
      }
    },
    complete: function (res) {
      if (obj.complete) {
        obj.complete(res)
      }
    }
  })
}

/*
* 获取蓝牙设备所有 characteristic（特征值）
*/

function getBLEDeviceCharacteristics(obj){
  wx.getBLEDeviceCharacteristics({
    deviceId: obj.deviceId,
    serviceId: obj.serviceId,
    success: function(res) {
      if (obj.success) {
        obj.success(res);
      }
    },
    fail: function (res) {
      if (obj.fail) {
        obj.fail(res)
      }
    },
    complete: function (res) {
      if (obj.complete) {
        obj.complete(res)
      }
    }
  })
}

/*
* 读取低功耗蓝牙设备的特征值的二进制数据值。注意：必须设备的特征值支持read才可以成功调用，具体参照 characteristic 的 properties 属性
*/

function readBLECharacteristicValue(obj){
  wx.readBLECharacteristicValue({
    deviceId: obj.deviceId,
    serviceId: obj.serviceId,
    characteristicId: obj.characteristicId,
    success: function(res) {
      if (obj.success) {
        obj.success(res);
      }
    },
    fail: function (res) {
      if (obj.fail) {
        obj.fail(res)
      }
    },
    complete: function (res) {
      if (obj.complete) {
        obj.complete(res)
      }
    }
  })
}


/*
* 向低功耗蓝牙设备特征值中写入二进制数据。注意：必须设备的特征值支持write才可以成功调用，具体参照 characteristic 的 properties 属性

tips: 并行调用多次读写接口存在读写失败的可能性
*/

function writeBLECharacteristicValue(obj){
  wx.writeBLECharacteristicValue({
    deviceId: obj.deviceId,
    serviceId: obj.serviceId,
    characteristicId: obj.characteristicId,
    value: obj.value,
    success: function(res) {
      if (obj.success) {
        obj.success(res);
      }
    },
    fail: function (res) {
      if (obj.fail) {
        obj.fail(res)
      }
    },
    complete: function (res) {
      if (obj.complete) {
        obj.complete(res)
      }
    }
  })
}

/*
* 启用低功耗蓝牙设备特征值变化时的 notify 功能。注意：必须设备的特征值支持notify才可以成功调用，具体参照 characteristic 的 properties 属性

另外，必须先启用notify才能监听到设备 characteristicValueChange 事件
*/

function notifyBLECharacteristicValueChange(obj){
  wx.notifyBLECharacteristicValueChange({
    deviceId: obj.deviceId,
    serviceId: obj.serviceId,
    characteristicId: obj.characteristicId,
    state: obj.state,
    success: function(res) {
      if (obj.success) {
        obj.success(res);
      }
    },
    fail: function (res) {
      if (obj.fail) {
        obj.fail(res)
      }
    },
    complete: function (res) {
      if (obj.complete) {
        obj.complete(res)
      }
    }
  })
}


/*
*监听低功耗蓝牙连接的错误事件，包括设备丢失，连接异常断开等等。
*/

function onBLEConnectionStateChange(obj){
  wx.onBLEConnectionStateChange(function(res){
    if(obj){
      obj(res)
    }
  })
}

/*
* 监听低功耗蓝牙设备的特征值变化。必须先启用notify接口才能接收到设备推送的notification。
*/

function onBLECharacteristicValueChange(obj){
  wx.onBLECharacteristicValueChange(function(res){
    if(obj){
      obj(res)
    }
  })
}


module.exports = {
  RealTek_ServiceUUIDs: RealTek_ServiceUUIDs,
  CharacteristicUUIDs: CharacteristicUUIDs,
  initialBTManager: initialBTManager,
  openBluetoothAdapter : openBluetoothAdapter,
  closeBluetoothAdapter: closeBluetoothAdapter,
  getBluetoothAdapterState: getBluetoothAdapterState,
  onBluetoothAdapterStateChange: onBluetoothAdapterStateChange,
  startBluetoothDevicesDiscovery: startBluetoothDevicesDiscovery,
  stopBluetoothDevicesDiscovery: stopBluetoothDevicesDiscovery,
  getBluetoothDevices: getBluetoothDevices,
  getConnectedBluetoothDevices: getConnectedBluetoothDevices,
  createBLEConnection: createBLEConnection,
  closeBLEConnection: closeBLEConnection,
  getBLEDeviceServices: getBLEDeviceServices,
  getBLEDeviceCharacteristics: getBLEDeviceCharacteristics,
  readBLECharacteristicValue: readBLECharacteristicValue,
  writeBLECharacteristicValue: writeBLECharacteristicValue,
  notifyBLECharacteristicValueChange: notifyBLECharacteristicValueChange,
  onBLEConnectionStateChange: onBLEConnectionStateChange,
  onBLECharacteristicValueChange: onBLECharacteristicValueChange
  
}