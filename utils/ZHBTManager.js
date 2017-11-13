
let cmdPreDef = require("./ZHBTCmdPreDef.js")
let common = require("./ZHCommon.js")

//properties
var discovering = false  //是否处于搜索状态
var callBack = {} 
var bluetoolthavailable = false //蓝牙适配器是否可用
var connectedDeviceId = null
// functions
function initialBTManager(obj){

  let that  = this
  openBluetoothAdapter({
    success: function(res) {
      that.bluetoolthavailable = true
    },
    fail: function(res) {
      that.bluetoolthavailable = false

    }
  })

  //监听蓝牙适配器状态改变
  onBluetoothAdapterStateChange(function (res){
    let that = this
    if (!res.discovering){
      that.discovering = false
    }else{
      that.discovering = true
    }
    if (!res.available){
      console.log("bluetooth adapter is not valid")
      that.bluetoolthavailable = false
    }else{
      that.bluetoolthavailable = true
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
* 清除所有缓存
*/
function clearCaches()
{
  discovering = false  
  callBack = {}
  bluetoolthavailable = false
  connectedDeviceId = null
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
  let that = this
  wx.createBLEConnection({
    deviceId: obj.deviceId,
    success: function(res) {
      that.connectedDeviceId = obj.deviceId
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


/* 
* 组合协议包
*/

function appendBuffer(buffer1, buffer2) {
  var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
  tmp.set(new Uint8Array(buffer1), 0);
  tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
  return tmp.buffer;
}

function getL0PacketWithCommandId(commandId, key, keyValue, keyValueLength, errFlagBool, ackFlagBool, sequenceId){
  var that = this
  var l2Header = that.getL2HeaderWithCommandId(commandId)
  var l2Payload = that.getL2Payload(key,keyValueLength,keyValue)
  var l2HeaderSize = cmdPreDef.DF_RealTek_L2_Header.DF_RealTek_L2_Header_Size;
  var l2PayloadHeaderSize = cmdPreDef.DF_RealTek_L2_Header.DF_RealTek_L2_Payload_Header_Size
  var l1PayloadLength = l2HeaderSize + l2PayloadHeaderSize + keyValueLength
  var l1Payload = new Uint8Array(l1PayloadLength)
  if(l1Payload.byteLength != l1PayloadLength){
    common.printDebugInfo("L1 payload init fail", common.ZH_Log_Level.ZH_Log_Error)
  }else{
    l1Payload.set(l2Header,0)
    l1Payload.set(l2Payload, l2HeaderSize)
    var l1Header = that.getL1HeaderWithAckFlagBool(ackFlagBool,errFlagBool,l1Payload,l1PayloadLength,sequenceId)
    var l1HeaderLength = cmdPreDef.DF_RealTek_L1_Header.DF_RealTek_L1_Header_Size
    var l1PacketLength = l1HeaderLength + l1PayloadLength
    var l1Packet = new Uint8Array(l1PacketLength)
    if(l1Packet.byteLength != l1PacketLength){
      common.printDebugInfo("L1 packet init fail", common.ZH_Log_Level.ZH_Log_Error)

    }else{
      l1Packet.set(l1Header,0)
      l1Packet.set(l1Payload, l1HeaderLength)
      
    }
    return l1Packet

  }


}

function getL1HeaderWithAckFlagBool(ackBool, errorBool, L1Payload, L1PayloadLength, sequenceId){
  var that = this
  var l1HeaderSize = cmdPreDef.DF_RealTek_L1_Header.DF_RealTek_L1_Header_Size
  var l1Header = new Uint8Array(l1HeaderSize)
  if(l1Header.byteLength != l1HeaderSize){
    common.printDebugInfo("L1 Header init fail", common.ZH_Log_Level.ZH_Log_Error)
  }else{
    var magic = cmdPreDef.DF_RealTek_L1_Header.DF_RealTek_L1_Header_Magic
    var ackVersion = that.getVersionACKErrorValueWithAck(ackBool,errorBool)
    var l1HeaderOrder = cmdPreDef.L1_Header_ByteOrder
    l1Header[l1HeaderOrder.DF_RealTek_L1_Header_Magic_Pos] = magic
    l1Header[l1HeaderOrder.DF_RealTek_L1_Header_Protocol_Version_Pos] = ackVersion
    l1Header[l1HeaderOrder.DF_RealTek_L1_Header_PayloadLength_HighByte_Pos] = (L1PayloadLength >> 8) & 0xFF
    l1Header[l1HeaderOrder.DF_RealTek_L1_Header_PayloadLength_LowByte_Pos] = L1PayloadLength & 0xFF

    if((L1PayloadLength > 0) && (L1Payload != undefined)){
      var L1PayloadArray = new Uint8Array(L1Payload)
      var crc16 = common.getCRC16WithValue(L1PayloadArray)
      l1Header[l1HeaderOrder.DF_RealTek_L1_Header_CRC16_HighByte_Pos] = (crc16 >> 8) & 0xFF
      l1Header[l1HeaderOrder.DF_RealTek_L1_Header_CRC16_LowByte_Pos] = crc16 & 0xFF

    }else{
      l1Header[l1HeaderOrder.DF_RealTek_L1_Header_CRC16_HighByte_Pos] = 0
      l1Header[l1HeaderOrder.DF_RealTek_L1_Header_CRC16_LowByte_Pos] = 0
    }

    l1Header[l1HeaderOrder.DF_RealTek_L1_Header_SeqID_HighByte_Pos] = (sequenceId >> 8) & 0xFF
    l1Header[l1Header.DF_RealTek_L1_Header_SeqID_LowByte_Pos] = sequenceId & 0xFF

  }

  return l1Header.buffer

}

function getVersionACKErrorValueWithAck(ackBool, errorBool){
  var ackEr = 0
  if (!ackBool && !errorBool) {
    ackEr = 0;
  } else if (ackBool && !errorBool) {
    ackEr = 0x10;
  } else {
    ackEr = 0x30;
  }
  var version = cmdPreDef.DF_RealTek_L1_Header.DF_RealTek_L1_Header_Version
  var result = ackEr | version
  return result
}

function getL2HeaderWithCommandId(commandId)
{
  var length = cmdPreDef.DF_RealTek_L2_Header.DF_RealTek_L2_Header_Size
  var l2Header = new Uint8Array(length)
  if(l2Header.byteLength != length){
    common.printDebugInfo("L2 Header init fail", common.ZH_Log_Level.ZH_Log_Error)

  }else{
    l2Header[0] = commandId
    l2Header[1] = cmdPreDef.DF_RealTek_L2_Header.DF_RealTek_L2_Header_Version
  }
  return l2Header.buffer
}

function getL2Payload(key, keyValueLength, keyValue)
{
  var l2Payload_Header_Size = cmdPreDef.DF_RealTek_L2_Header.DF_RealTek_L2_Payload_Header_Size
  var loadSize = l2Payload_Header_Size + keyValueLength
  var l2PayLoad = new Uint8Array(loadSize)
  if (l2PayLoad.byteLength != length) {
    common.printDebugInfo("l2 PayLoad init fail", common.ZH_Log_Level.ZH_Log_Error)
  } else {
    l2PayLoad[0] = key
    l2PayLoad[1] = keyValueLength >> 8 & 0x1;
    l2PayLoad[2] = keyValueLength & 0xFF;
    if((keyValueLength >0) && (keyValue != undefined)){
      l2PayLoad.set(l2Payload_Header_Size,keyValue)
    }
  }

  return l2PayLoad.buffer

}

//function getL0Packet(commandId, key, keyValue)

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
  onBLECharacteristicValueChange: onBLECharacteristicValueChange,
  getL0PacketWithCommandId: getL0PacketWithCommandId,
  getL1HeaderWithAckFlagBool: getL1HeaderWithAckFlagBool,
  getVersionACKErrorValueWithAck: getVersionACKErrorValueWithAck,
  getL2HeaderWithCommandId: getL2HeaderWithCommandId,
  getL2Payload: getL2Payload
  
}