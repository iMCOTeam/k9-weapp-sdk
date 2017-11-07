
//properties
var isScanning = false
var callBack = {}

// functions
function initialBTManager(){
  //监听蓝牙适配器状态改变
  onBluetoothAdapterStateChange(function (res){
    if (!res.available){
      console.log("bluetooth adapter is not valid")
    }else{
      console.log("bluetooth adapter is valid")
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


// 对外可见模块
module.exports = {
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