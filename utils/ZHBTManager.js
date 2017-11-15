let preDefService = require("./ZHBTServiceDef.js")
let cmdPreDef = require("./ZHBTCmdPreDef.js")
let common = require("./ZHCommon.js")

//properties
var discovering = false  //是否处于搜索状态
var callBack = {}        //回调函数
var bluetoolthavailable = false //蓝牙适配器是否可用
var connectedDeviceId = null  //已连接设备ID

var allServices = null //该设备所有服务
var writeCharObj = null //发送命令特征
var notifyCharObj = null //接收命令或数据的特征
var immediateCharObj = null //查找手环特征
var alertLevelCharObj = null //查找手环的特征
var deviceNameCharObj = null //手环名称相关特征
var batterylevelCharObj = null //电池电量特征
var OTAPatchVersioCharObj = null //OTA Patch版本特征
var OTAAppVersionCharObj = null //OTA App 版本特征
var functionsCharObj = null // 功能列表特征 暂时无用
var macAddressCharObj = null //固件蓝牙地址特征

var OTApatchVersion = 0 //OTA Patch version
var OTAappVersion = 0 //OTA App version
var macAddress = null //OTA macAddress


// 大小端模式判定
var littleEndian = (function () {
  var buffer = new ArrayBuffer(2);
  new DataView(buffer).setInt16(0, 256, true);
  return new Int16Array(buffer)[0] === 256;
})();



// functions
function initialBTManager(obj){
  
  openBluetoothAdapter({
    success: function(res) {
      bluetoolthavailable = true
    },
    fail: function(res) {
      bluetoolthavailable = false

    }
  })

  //监听蓝牙适配器状态改变
  onBluetoothAdapterStateChange(function (res){
    if (!res.discovering){
      discovering = false
    }else{
      discovering = true
    }
    if (!res.available){
      console.log("bluetooth adapter is not valid")
      bluetoolthavailable = false
    }else{
      bluetoolthavailable = true
      console.log("bluetooth adapter is valid")
    }
  })

  // 监听低功耗蓝牙连接的错误事件，包括设备丢失，连接异常断开等等。
  onBLEConnectionStateChange(function (res){
    if (!res.connected){
      console.log("bluetooth have disconnected with deviceId:${res.deviceId}")
    }
  })

  onBLECharacteristicValueChange()

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

  allServices = null 
  writeCharObj = null 
  notifyCharObj = null 
  immediateCharObj = null
  alertLevelCharObj = null 
  deviceNameCharObj = null 
  batterylevelCharObj = null 
  OTAPatchVersioCharObj = null 
  OTAAppVersionCharObj = null 
  functionsCharObj = null 
  macAddressCharObj = null 

  OTApatchVersion = 0 
  OTAappVersion = 0 
  macAddress = null 
}


/* - 蓝牙接口模块 - *／


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
      connectedDeviceId = obj.deviceId
      //获取所有特征服务
      getAllServices()
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

function onBLECharacteristicValueChange(){
  wx.onBLECharacteristicValueChange(function(res){
    console.log("onBLECharacteristicValueChange:",JSON.stringify(res))
    handleCharacteristicValue(res)
  })
}


function handleCharacteristicValue(obj){
  var deviceId = obj.deviceId
  var serviceId = obj.serviceId
  var charUUIDString = obj.characteristicId
  var value = obj.value
  if(deviceId == connectedDeviceId){
    var preDefChar = preDefService.CharacteristicUUIDs
    var deviceId = connectedDeviceId
    if (charUUIDString.indexOf(preDefChar.RealTek_Write_CharUUID) != -1) {
     
    }
    if (charUUIDString.indexOf(preDefChar.RealTek_Notify_CharUUID) != -1) {
      
    }
    if (charUUIDString.indexOf(preDefChar.RealTek_Immediate_Remind_CharUUID) != -1) {
      
    }
    if (charUUIDString.indexOf(preDefChar.RealTek_AlertLevel_CharUUID) != -1) {
      
    }
    if (charUUIDString.indexOf(preDefChar.RealTek_DeviceName_CharUUID) != -1) {
      
    }
    if (charUUIDString.indexOf(preDefChar.RealTek_BatteryLevel_CharUUID) != -1) {
      
    }

    if (charUUIDString.indexOf(preDefChar.RealTek_OTAPatchVersion_CharUUID) != -1) {
      var resultValue = value
      var dev = new DataView(resultValue)
      var version = dev.getUint16(0, littleEndian)
      OTApatchVersion = version   
      var info = "read RealTek_OTAPatchVersion_CharUUID Success-" + version

      console.log("read RealTek_OTAPatchVersion_CharUUID Success-",version)

    }
    if (charUUIDString.indexOf(preDefChar.RealTek_OTAAppVersion_CharUUID) != -1) {
      console.log("read RealTek_OTAAppVersion_CharUUID Success")
      var resultValue = value
      var dev = new DataView(resultValue)
      var version = dev.getUint16(0, littleEndian)
      OTAappVersion = version
      console.log("read RealTek_OTAAppVersion_CharUUID Success-", version)
    }

    if (charUUIDString.indexOf(preDefChar.RealTek_Functions_CharUUID) != -1) {
      functionsCharObj = characteristic
    }
  }
}


/*
* 获取所有服务
*/
function getAllServices(){
  console.log("call getAllServices")
  getBLEDeviceServices({
    deviceId: connectedDeviceId,
    success: function (serRes) {
      var services = serRes.services
      allServices = services
      for(var i=0;i<services.length;i++){
        var service = services[i]
        getAllCharacteristics(service.uuid)
      }
    },
    fail: function (serRes) {
      var info = "getAllServices fail" + serRes.errMsg
      common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Error)

    }
  })
}


/*
* 获取所有特征
*/

function getAllCharacteristics(serviceUUID){
  console.log("call getAllCharacteristics-", serviceUUID)
  var deviceId = connectedDeviceId
   getBLEDeviceCharacteristics({
    deviceId: deviceId,
    serviceId: serviceUUID,
    success: function(res){
      var characteristics = res.characteristics
      for(var i=0;i<characteristics.length;i++){
        var characteristic = characteristics[i]
        handleCharacteristic(serviceUUID,characteristic)
      }

    },
    fail: function(res){
      var info = "getAllCharacteristics fail" + serRes.errMsg + "ServiceUUID:" + serviceUUID
      common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Error)
    }
  })

}


function handleCharacteristic(serviceUUID,characteristic){

  var charUUIDString = characteristic.uuid
  var charProperties = characteristic.properties
  var preDefChar = preDefService.CharacteristicUUIDs
  var deviceId = connectedDeviceId
  if (charUUIDString.indexOf(preDefChar.RealTek_Write_CharUUID) != -1){
    console.log("find RealTek_Write_CharUUID -", characteristic.uuid)
    writeCharObj = characteristic
  } 
  if (charUUIDString.indexOf(preDefChar.RealTek_Notify_CharUUID) != -1){
    notifyCharObj = characteristic
    handleNotifyCharacteristic(serviceUUID, characteristic)
  } 
  if (charUUIDString.indexOf(preDefChar.RealTek_Immediate_Remind_CharUUID) != -1 ){
    immediateCharObj = characteristic

  } 
  if (charUUIDString.indexOf(preDefChar.RealTek_AlertLevel_CharUUID) != -1 ){
    alertLevelCharObj = characteristic
  } 
  if (charUUIDString.indexOf(preDefChar.RealTek_DeviceName_CharUUID) != -1 ){
    deviceNameCharObj = characteristic
  } 
  if (charUUIDString.indexOf(preDefChar.RealTek_BatteryLevel_CharUUID) != -1){
    batterylevelCharObj = characteristic
    handleNotifyCharacteristic(serviceUUID, characteristic)
  } 

  if (charUUIDString.indexOf(preDefChar.RealTek_OTAPatchVersion_CharUUID) != -1){
    OTAPatchVersioCharObj = characteristic
    console.log("find RealTek_OTAPatchVersion_CharUUID -", characteristic.uuid)
    if (characteristic.properties.read) {
      readBLECharacteristicValue({
        deviceId: deviceId,
        serviceId: serviceUUID,
        characteristicId: characteristic.uuid,
        success: function (res) {
          console.log("Read OTAPatchVersion Success:", JSON.stringify(res))
        },
        fail: function (res) {
          var info = "Read OTAPatchVersion fail" + res.errMsg + "characteristicUUID:" + characteristic.uuid
          common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Error)

        },
        complete: function (res) {

        },
      })

    }
  }
  if (charUUIDString.indexOf(preDefChar.RealTek_OTAAppVersion_CharUUID) != -1 ){
    OTAAppVersionCharObj = characteristic
    if (characteristic.properties.read){
      readBLECharacteristicValue({
        deviceId: deviceId,
        serviceId: serviceUUID,
        characteristicId: characteristic.uuid,
        success: function (res) {
          console.log("Read OTAAppVersion Success:", JSON.stringify(res))
        },
        fail: function (res) {
          var info = "Read OTAAppVersion fail" + res.errMsg + "characteristicUUID:" + characteristic.uuid
          common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Error)

         },
        complete: function (res) { 

        },
      })

    }
    
  }

  if (charUUIDString.indexOf(preDefChar.RealTek_Functions_CharUUID) != -1 ){
    functionsCharObj = characteristic
  }
   
}


/* - Notify 接收数据特征 - */

function handleNotifyCharacteristic(serviceId, characteristic){
  if (characteristic.notify){
    var deviceId = connectedDeviceId
    notifyBLECharacteristicValueChange({
      deviceId:deviceId,
      serviceId: serviceId,
      characteristicId: characteristic.uuid,
      state: true,
      success: function(res){
        var info = "NotifyCharacteristics success" + characteristic.uuid
        common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Info)
      },
      fail: function(res){
        var info = "NotifyCharacteristics fail" + res.errMsg + "characteristicUUID:" + characteristic.uuid
        common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Error)

      }


    })

  }
}

/* - 组合协议包 - */

function appendBuffer(buffer1, buffer2) {
  var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
  tmp.set(new Uint8Array(buffer1), 0);
  tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
  return tmp.buffer;
}

/*
* 获取发送的数据包
*/
function getL0PacketWithCommandId(commandId, key, keyValue, keyValueLength, errFlagBool, ackFlagBool, sequenceId){
  var l2Header = getL2HeaderWithCommandId(commandId)
  var l2Payload = getL2Payload(key,keyValueLength,keyValue)
  var l2HeaderSize = cmdPreDef.DF_RealTek_L2_Header.DF_RealTek_L2_Header_Size;
  var l2PayloadHeaderSize = cmdPreDef.DF_RealTek_L2_Header.DF_RealTek_L2_Payload_Header_Size
  var l1PayloadLength = l2HeaderSize + l2PayloadHeaderSize + keyValueLength
  var l1Payload = new Uint8Array(l1PayloadLength)
  if(l1Payload.byteLength != l1PayloadLength){
    common.printDebugInfo("L1 payload init fail", common.ZH_Log_Level.ZH_Log_Error)
  }else{
    l1Payload.set(l2Header,0)
    l1Payload.set(l2Payload, l2HeaderSize)
    var l1Header = getL1HeaderWithAckFlagBool(ackFlagBool,errFlagBool,l1Payload,l1PayloadLength,sequenceId)
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

/*
* 获取L1 Header
*/
function getL1HeaderWithAckFlagBool(ackBool, errorBool, L1Payload, L1PayloadLength, sequenceId){
  var l1HeaderSize = cmdPreDef.DF_RealTek_L1_Header.DF_RealTek_L1_Header_Size
  var l1Header = new Uint8Array(l1HeaderSize)
  if(l1Header.byteLength != l1HeaderSize){
    common.printDebugInfo("L1 Header init fail", common.ZH_Log_Level.ZH_Log_Error)
  }else{
    var magic = cmdPreDef.DF_RealTek_L1_Header.DF_RealTek_L1_Header_Magic
    var ackVersion = getVersionACKErrorValueWithAck(ackBool,errorBool)
    var l1HeaderOrder = cmdPreDef.L1_Header_ByteOrder
    l1Header[l1HeaderOrder.DF_RealTek_L1_Header_Magic_Pos] = magic
    l1Header[l1HeaderOrder.DF_RealTek_L1_Header_Protocol_Version_Pos] = ackVersion
    l1Header[l1HeaderOrder.DF_RealTek_L1_Header_PayloadLength_HighByte_Pos] = (L1PayloadLength >> 8) & 0xFF
    l1Header[l1HeaderOrder.DF_RealTek_L1_Header_PayloadLength_LowByte_Pos] = L1PayloadLength & 0xFF

    if((L1PayloadLength > 0) && L1Payload){
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

/*
* 获取ACK Error Version 组合字节
*/
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



/*
* 获取L2 Header
*/
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


/*
*获取L2 payload
*/
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
    if((keyValueLength >0) && keyValue){
      l2PayLoad.set(l2Payload_Header_Size,keyValue)
    }
  }

  return l2PayLoad.buffer

}

/* - 公共函数 - */

// ArrayBuffer转为字符串，参数为ArrayBuffer对象

function getStringWithBuffer(buf) {
   return String.fromCharCode.apply(null, new Uint16Array(buf));
}

// 字符串转为ArrayBuffer对象，参数为字符串
function getBufferWithString(str) {
    var buf = new ArrayBuffer(str.length*2); // 每个字符占用2个字节
    var bufView = new Uint16Array(buf);
    for (var i=0, strLen=str.length; i<strLen; i++) {
         bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

function hasConnectDevice(callBack) {
  if (connectedDeviceId) {
    return true
  } else {
    if (callBack) {
      var error = getDisconnectedError()
      callBack(connectedDeviceId, error, null)
    }
  }
}

function getDisconnectedError() {
  var error = new Error("The device is disconnected")
  return error
}

function getSeqIDWithCommand(cmd,key){
  var result = (cmd << 8) + key;
  return result;
}

/* - 命令函数 - */




/*
* Bind 
*/

function bindDeviceWithIdentifier(identifier,callBack){
  var connected = hasConnectDevice(callBack)
  if(!connected){
    return
  }
  var dataBuffer = getBufferWithString(identifier)
  var maxLength = cmdPreDef.DF_RealTek_Header_Predef.DF_RealTek_Max_BoundIdntifier_Length
  if (dataBuffer.byteLength > maxLength){
    dataBuffer = dataBuffer.slice(0,maxLength)
  }

  var bindByte = new Uint8Array(maxLength)
  bindByte.set(dataBuffer,0)

  var keyValue = bindByte;
  var cmd = cmdPreDef.ZH_RealTek_CMD_ID.RealTek_CMD_Bind
  var key = cmdPreDef.ZH_RealTek_Bind_Key.RealTek_Key_Bind_Req
  var seqId = getSeqIDWithCommand(cmd,key)
  var packet = getL0PacketWithCommandId(cmd, key, keyValue, maxLength,false,false,seqId)


}

//function getL0Packet(commandId, key, keyValue)

function sendDataToBandDevice(data,ackBool,callBack){

  var deviceUUID = connectedDeviceId
  var serviceUUID = preDefService.RealTek_ServiceUUIDs.RealTek_BroadServiceUUID
  var writeCharUUID = preDefService.CharacteristicUUIDs.RealTek_Write_CharUUID
  

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
  onBLECharacteristicValueChange: onBLECharacteristicValueChange,
  getL0PacketWithCommandId: getL0PacketWithCommandId,
  getL1HeaderWithAckFlagBool: getL1HeaderWithAckFlagBool,
  getVersionACKErrorValueWithAck: getVersionACKErrorValueWithAck,
  getL2HeaderWithCommandId: getL2HeaderWithCommandId,
  getL2Payload: getL2Payload
  
}