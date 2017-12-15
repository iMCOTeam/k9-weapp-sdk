let preDefService = require("./ZHBTServiceDef.js")
let cmdPreDef = require("./ZHBTCmdPreDef.js")
let common = require("./ZHCommon.js")
let preModel = require("./ZHBTModel.js")
let SHAHMAC = require("./ZHSHAHMAC.js")
let PreAES = require("./ZHAES.js")

let iMCOServerHost = "https://fota.aimoketechnology.com"
let iMCOServerInterfaceVersion = 2

let passKey = [
    0x4E, 0x46, 0xF8, 0xC5, 0x09, 0x2B, 0x29, 0xE2,
    0x9A, 0x97, 0x1A, 0x0C, 0xD1, 0xF6, 0x10, 0xFB,
    0x1F, 0x67, 0x63, 0xDF, 0x80, 0x7A, 0x7E, 0x70,
    0x96, 0x0D, 0x4C, 0xD3, 0x11, 0x8E, 0x60, 0x1A
]

let secret_key = PreAES.Aes.keyExpansion(passKey)


//properties
var AppKey = "keyOPCjEL08cCCIgm33y8cmForWXLSR9uLT"  //需向iMCO申请
var AppSecret = "secaab78b9d7dbe11e7a420ee796be10e85-i6ff579j49afj5" //需向iMCO申请

var updateFirmWareAddress = null //升级地址
var firmWareType = null // 固件类型
var firmWareMD5 = null //升级固件的md5校验
var firmWareSha1Sum = null //升级固件的sha1sum
var firmWareSha256Sum = null //升级固件的sha256sum
var isUpdatefailed = false
var OTAMode = preModel.ZH_RealTek_UpdateMode.ZH_RealTek_OTAUpMode_Internal //OTA 模拟，外部或者内部

var waitingUpdateFirmWare = false //是否是在等待升级如果是断开后进行重连
var SendDataDFUChar = null //固件升级传输固件包的特征
var ControlCmdDFUChar = null //升级过程中与手环进行升级命令交互的特征
var imageData = null //固件Data
var imageSendData = null //将要发送的固件Data这里由于有断点传输所以可能发送的image和原image data 不同
var haveSendImageSize = 0



var discovering = false  //是否处于搜索状态
var characteristicValueWrtieBlocks = []        //回调函数
var bluetoolthavailable = false //蓝牙适配器是否可用
var connectedDeviceId = null  //已连接设备ID
var connectedDevice = preModel.initDevice() //已连接设备
var receiveData = null //接收的数据
var receivePayloadLength = 0 //接收数据时的数据长度，用于判断Notify的数据是否接收完整
var receiveDataSeq = 0 //接收数据时的序列号

var Singleton = null

var allServices = null //该设备所有服务
var immediateRemindServiceObj = null //立即查找手环Service
var lossServiceObj = null //防丢Service 
var batteryServiceObj = null //电量Service

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
var functionsHaveUpdated = null
var bleConnectionStateChange = function(device,error){
  

}

var bluetoothAdapterStateChange = function (available){

}

var cameraModeUpdateBlock 

var stopMeasuringHRBlock = function (device,error,result){

}

var sportDataUpdateBlock = function (device, error, result){
  var nums = result.length
  var info = "Receive sport data " + nums
  console.log("sportDataUpdateBlock:", nums)
  wx.showToast({
    title: info,
  })

}

var sleepDataUpdateBlock = function (device, error, result){
  var nums = result.length
  var info = "Receive sleep data " + nums
  wx.showToast({
    title: info,
  })
}

var heartRateDataUpdateBlock = function (device, error, result){
 
  var nums = result.length
  console.log("heartRateDataUpdateBlock:", nums)
  var info = "Receive HeartRate data " + nums
  wx.showToast({
    title: info,
  })
}


var bloodPressureDataUpdateBlock = function (device, error, result) {

  var nums = result.length
  console.log("bloodPressureDataUpdateBlock:", nums)
  var info = "Receive bloodPressure data " + nums
  wx.showToast({
    title: info,
  })
}

var stopMeasuringBloodPressureBlock = function (device, error, result) {
  wx.showToast({
    title: "Blood Pressure have stopped!",
  })
}


var deviceNameHaveReadBlock = function (device, error, result){

}

var batteryValueHaveReadBlock = function (device, error, result){

}

var otaAppVersionHaveReadBlock = function (device, error, result){

}

var otaPatchVersionHaveReadBlock = function(device, error, result){

}

var macAddressHaveReadBlock = function (device, error, result) {

}

var updateFirmWareProgress = null //升级回调

// 大小端模式判定
var littleEndian = (function () {
  var buffer = new ArrayBuffer(2);
  new DataView(buffer).setInt16(0, 256, true);
  return new Int16Array(buffer)[0] === 256;
})();

// 组合buffer
function appendBuffer(buffer1, buffer2) {
  var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
  tmp.set(new Uint8Array(buffer1), 0);
  tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
  return tmp.buffer;
}

// functions
function initialBTManager(obj){
  //监听蓝牙适配器状态改变
  onBluetoothAdapterStateChange(function (res){
    if (!res.discovering){
      discovering = false
    }else{
      discovering = true
    }
    if (bluetoothAdapterStateChange){
      bluetoothAdapterStateChange(res.available)
    }

    if (!res.available){
      console.log("bluetooth adapter is not valid")
      bluetoolthavailable = false
      clearCaches()
      if(updateFirmWareAddress){
        updateFirmWareAddress(connectedDevice, null, preModel.ZH_RealTek_FirmWare_Update_Status.RealTek_FirmWare_Update_Failed)
      }
      clearUpdateFirmWareData()
      
    }else{
      bluetoolthavailable = true
      console.log("bluetooth adapter is valid")
    }
  })

  // 监听低功耗蓝牙连接的错误事件，包括设备丢失，连接异常断开等等。
  onBLEConnectionStateChange(function (res){
    if(bleConnectionStateChange){
      bleConnectionStateChange(res.connected)
    }
    if (!res.connected){
      console.log("bluetooth have disconnected with deviceId:", res.deviceId)
      clearCaches()
      if(!waitingUpdateFirmWare){
        if(updateFirmWareProgress){
          updateFirmWareAddress(connectedDevice, null, preModel.ZH_RealTek_FirmWare_Update_Status.RealTek_FirmWare_Update_Failed)
        }
      }else{//升级成功重新连接

      }
      clearUpdateFirmWareData()
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
  characteristicValueWrtieBlocks = []
  connectedDeviceId = null
  connectedDevice = null
  receiveData = null 
  receivePayloadLength = 0 
  receiveDataSeq = 0 

  allServices = null 
  immediateRemindServiceObj = null 
  lossServiceObj = null  
  batteryServiceObj = null 

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

  updateFirmWareAddress = null 
  firmWareType = null 
  firmWareMD5 = null 
  firmWareSha1Sum = null 
  firmWareSha256Sum = null 
}


/* - 清除固件升级缓存 - */
function clearUpdateFirmWareData()
{
  waitingUpdateFirmWare = false
  haveSendImageSize = 0
  if(updateFirmWareProgress){
    updateFirmWareProgress = null
  }
  if(SendDataDFUChar){
    SendDataDFUChar = null
  }
  if(ControlCmdDFUChar){
    ControlCmdDFUChar = null
  }
  if(imageData){
    imageData = null
  }
  if(imageSendData){
    imageSendData = null
  }

}


/* - 清除接收到数据的缓存 - */
function clearReceiveDataCaches(){
  receivePayloadLength = 0
  receiveData = null
  receiveDataSeq = 0

}

/*
* 删除缓存的callback函数
*/
function removeCacheBlockWithKey(key){
  if(characteristicValueWrtieBlocks[key]){
    delete characteristicValueWrtieBlocks[key]
  }
}

/* - 蓝牙接口模块 - *／


/*
* 初始化蓝牙适配器
*/
function openBluetoothAdapter(obj) {
  wx.openBluetoothAdapter({
    success: function (res) {
      bluetoolthavailable = true
      if (obj.success) {
        obj.success(res)
      }
    },
    fail: function (res) {
      bluetoolthavailable = false
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
    handleCharacteristicValue(res)
  })
}

/*
* 操作特征值的改变（Read Notify)
*/
function handleCharacteristicValue(obj){
  var deviceId = obj.deviceId
  var serviceId = obj.serviceId
  var charUUIDString = obj.characteristicId
  var value = obj.value
  var label = "Characteristic UUID: " + charUUIDString + " Value Changed: "
  common.printLogWithBuffer(value,label)

  if(deviceId == connectedDeviceId){
    var preDefChar = preDefService.CharacteristicUUIDs
    var deviceId = connectedDeviceId
    if (charUUIDString.indexOf(preDefChar.RealTek_Write_CharUUID) != -1) {
     
    }
    if (charUUIDString.indexOf(preDefChar.RealTek_Notify_CharUUID) != -1) {
      handleReceivedData(value)
    }
    if (charUUIDString.indexOf(preDefChar.RealTek_Immediate_Remind_CharUUID) != -1) {
      
    }
    if (charUUIDString.indexOf(preDefChar.RealTek_AlertLevel_CharUUID) != -1) {
      
    }
    if (charUUIDString.indexOf(preDefChar.RealTek_DeviceName_CharUUID) != -1) {
      var name = getStringWithBuffer(value)
      if(deviceNameHaveReadBlock){
        deviceNameHaveReadBlock(connectedDevice,null,name)
      }
    }
    if (charUUIDString.indexOf(preDefChar.RealTek_BatteryLevel_CharUUID) != -1) {
      var dataView = new DataView(value)
      var batteyLevel = dataView.getUint8(0)
      if(batteryValueHaveReadBlock){
        batteryValueHaveReadBlock(connectedDevice,null,batteyLevel)
      }
    }

    if (charUUIDString.indexOf(preDefChar.RealTek_OTAPatchVersion_CharUUID) != -1) {
      var resultValue = value
      var dev = new DataView(resultValue)
      var version = dev.getUint16(0, littleEndian)
      OTApatchVersion = version   
      if(otaPatchVersionHaveReadBlock){
        otaPatchVersionHaveReadBlock(connectedDevice,null,OTApatchVersion)
      }

    }
    if (charUUIDString.indexOf(preDefChar.RealTek_OTAAppVersion_CharUUID) != -1) {
      var resultValue = value
      var dev = new DataView(resultValue)
      var version = dev.getUint16(0, littleEndian)
      OTAappVersion = version
      if (otaAppVersionHaveReadBlock) {
        otaAppVersionHaveReadBlock(connectedDevice, null, OTApatchVersion)
      }
    }
    if (charUUIDString.indexOf(preDefChar.RealTek_OTABDAddress_CharUUID) != -1)
    {
      var macString = getMacAddress(value)
      macAddress = macString
      if(macAddressHaveReadBlock){
        macAddressHaveReadBlock(connectedDevice,null,macAddress)
      }
    }

    if (charUUIDString.indexOf(preDefChar.RealTek_Functions_CharUUID) != -1) {
      functionsCharObj = characteristic
    }
  }
}

function getMacAddress(value){
  var buffer = new Uint8Array(value)
  var length = buffer.length
  var result = "";
  for (var index = 0; index < length; index++) {
    var num = buffer[index] & 0xff
    var numString = num < 16 ? "0" + num.toString(16) : num.toString(16)
    result = result + numString
    if(index != (length-1)){
      result = result + ":"
    }
  }

 return result.toUpperCase()
}

/*
* 操作接收到的命令数据 RealTek_Notify_CharUUID
*/

function handleReceivedData(value){
  var dataLength = value.byteLength
  var l1HeaderSize = cmdPreDef.DF_RealTek_L1_Header.DF_RealTek_L1_Header_Size
  var l2HeaderSize = cmdPreDef.DF_RealTek_L2_Header.DF_RealTek_L2_Header_Size
  if(dataLength < l1HeaderSize){
    var info = "Receive data length is small L1 Header Size"
    common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Error)
    return
  }
  common.printLogWithBuffer(value,"handleReceivedData")
  
  var l1HeaderMagicBuf = new DataView(value,0,1) //value.slice(0, 1)

  var l1AckVersionBuf = new DataView(value, 1, 1)//value.slice(1,2)
  var l1PayloadBuf = new DataView(value, 2, 2) //value.slice(2,4)
  var l1CRCBuf = new DataView(value, 4, 2)//value.slice(4,6)
  var l1SeqIdBuf = new DataView(value, 6, 2) //value.slice(6)
  

  var l1HeaderMagic = l1HeaderMagicBuf.getUint8(0)
  var l1AckVersion = l1AckVersionBuf.getUint8(0)

  var l1Payload = l1PayloadBuf.getUint16(0,false)
  var l1CRC = l1CRCBuf.getUint16(0, false)
  var l1SeqId = l1SeqIdBuf.getUint16(0, false)
  var errFlag = (l1AckVersion >> 5) & 0x1
  var ackFlag = (l1AckVersion >> 4) & 0x1

  var l1PayloadLength = l1Payload

  

  var info = "SeqId:" + l1SeqId + " CRC16:" + l1CRC + " errFlag:" + errFlag + " ackFlag:" + ackFlag + " l1PayloadLength: " + l1PayloadLength 
  common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Info)

  if (l1HeaderMagic != cmdPreDef.DF_RealTek_L1_Header.DF_RealTek_L1_Header_Magic){
    sendErrorAck(l1SeqId,null)
    info = "l1HeaderMagic is error" + l1HeaderMagic
    common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Error)
    return
  }

  //CRC16 Check
  if(l1PayloadLength > 0){
    var l1PayloadData = value.slice(l1HeaderSize)
    var checkCRC16Bool =  checkCRC16WithData(l1PayloadData,l1CRC)
    if(!checkCRC16Bool){
      sendErrorAck(l1SeqId,null)
      info = "checkCRC16Bool is not equal" + l1CRC 
      common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Error)
      return
    }
  }else{
    info = "l1PayloadLength is zero" + l1SeqId
    common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Info)
  }

  if (errFlag == 0 && ackFlag == 1) { //Suc ACK
    if (l1PayloadLength == 0) {//命令相应的Ack表示已经收到并且无payload所以只需直接回调
        var blockkey = l1SeqId
        var callBack = characteristicValueWrtieBlocks[blockkey]
        if(callBack){
          var cmd = (l1SeqId >> 8) & 0xFF;
          var key = l1SeqId & 0xFF;
          var haveRes = haveResDataWithCmd(cmd,key)
          if(haveRes){
            info = "haveRes immediate callBack"  + blockkey
            common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Info)
            callBack(connectedDevice,null,null)
          }else{
            info = "haveRes not immediate callBack" + blockkey
            common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Info)
          }
        }

     }else{
       //TODO: 待扩展  //继续发送下一个packet
      var info = "Need send next packet"
      common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Info)
     }
     return

  } else if (errFlag == 0 && ackFlag == 0) {// Packet
    //应答Packet 已经接收到。这里可能是接收完整个Packet应答也有可能是每接收一个packet应答
    sendSuccessAck(l1SeqId,null)
  } else if (errFlag == 0, ackFlag == 1) {//Err ACK (resend pre packet data) 这里主要是如果发送的数据包有错误重新发送
  //TODO: 待扩展
    var info = "Receive err Ack Need Resend pre packet"
    common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Error)
    return
  }

  //这里假设每个包都含有L1Header+L2Header 带扩展
  /*if (!receiveData) {// First Receive Data
    receivePayloadLength = l1PayloadLength
    receiveData = value
    var resInfo = "First Receive Packet"
    common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Info)
  }else{
    var info = "Append Value"
    common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Warning)
    var headerSize = l1HeaderSize + l2HeaderSize
    if(dataLength > headerSize){
      var l2PayloadLength = dataLength - headerSize
      if(l2PayloadLength > 0){
        var l2ValueData = value.slice(headerSize)
        receiveData = appendBuffer(receiveData,l2ValueData)
      }

    }
  }*/

  receivePayloadLength = l1PayloadLength
  receiveData = value
  if (receiveData.byteLength == (receivePayloadLength + l1HeaderSize)) {//已经接收完数据
    var info = "Receive all Packet"
    common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Info)
    parseReceivedData(receiveData)

  }else{
    var info = "Receive Packet is not finished:" +  receiveData.byteLength + receivePayloadLength
    common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Info)
    clearReceiveDataCaches()
  }

}


/*
* 解析接收到的数据
*/

function parseReceivedData(data){
  var l1HeaderSize = cmdPreDef.DF_RealTek_L1_Header.DF_RealTek_L1_Header_Size
  var l2HeaderSize = cmdPreDef.DF_RealTek_L2_Header.DF_RealTek_L2_Header_Size
  var l1PayloadLength = data.byteLength - l1HeaderSize
  if(l1PayloadLength > l2HeaderSize){
    var blockKey = getCommandIDAndKeyWithPacketData(data)
    var l1Payload = data.slice(l1HeaderSize)

    common.printLogWithBuffer(l1Payload,"paser l1Payload")
    

    var keyInfo = "Parse Block key is:" + blockKey
    common.printDebugInfo(keyInfo, common.ZH_Log_Level.ZH_Log_Verblose)
    var cmdBuffer = new DataView(data, l1HeaderSize, 1)//data.slice(l1HeaderSize,l1HeaderSize+1)
    var keyBuffer = new DataView(data, l1HeaderSize+2,1)
    var cmd = cmdBuffer.getUint8(0)
    var key = keyBuffer.getUint8(0)
     
    var CMD_IDs = cmdPreDef.ZH_RealTek_CMD_ID
    switch(cmd){
      case (CMD_IDs.RealTek_CMD_Firmware):{

      }
      break;
      case (CMD_IDs.RealTek_CMD_Setting):{
        parseSetCmdData(l1Payload, blockKey)
      }
      break;
      case (CMD_IDs.RealTek_CMD_Bind):{
         parseBindCmdData(l1Payload,blockKey)

      }
      break;

      case (CMD_IDs.RealTek_CMD_Control):{
        parseContrlCmdData(l1Payload,blockKey)

      }
      break;

      case (CMD_IDs.RealTek_CMD_Remind):{
        parseRemindCmdData(l1Payload,blockKey)

      }
      break;

      case (CMD_IDs.RealTek_CMD_SportData):{
        parseSportCmdData(l1Payload,blockKey)


      }
      break;

    }

  }
clearReceiveDataCaches()

}

/* - Parse Set Cmd Data - */

function getL2PayloadKeyWithL1PayLoad(l1Payload){
  var l2HeaderSize = cmdPreDef.DF_RealTek_L2_Header.DF_RealTek_L2_Header_Size
  var keyBuffer = new DataView(l1Payload,l2HeaderSize , 1)
  var key = keyBuffer.getUint8(0)
  return key
}


/*
* 解析包
*/

function parseSportCmdData(l1Payload, blockkey){
  var key = getL2PayloadKeyWithL1PayLoad(l1Payload)
  var l2HeaderSize = cmdPreDef.DF_RealTek_L2_Header.DF_RealTek_L2_Header_Size
  var l2PayLoad = l1Payload.slice(2)
  var Sport_Keys = cmdPreDef.ZH_RealTek_Sport_Key
  switch(key){
    case Sport_Keys.RealTek_Key_HR_Cancel:{
      var info = "Device measurements of heart rate have stopped!"
      common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Verblose)
      if(stopMeasuringHRBlock){
        stopMeasuringHRBlock(connectedDevice,null,null)
      }
    }
    break;
    
    case Sport_Keys.RealTek_Key_His_SportData_Syc_Begin:{
      var info = "His SportData Syn begin!"
      common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Verblose)
    }
    break;

    case Sport_Keys.RealTek_Key_His_SportData_Syc_End:{
      var info = "His SportData Syn end!"
      common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Verblose)

      var caliItem = getCalibrationItem(l2PayLoad)
      var callBack = characteristicValueWrtieBlocks[blockkey]

      if (callBack) {
        callBack(connectedDevice, null, caliItem)
        removeCacheBlockWithKey(blockkey)
      }

    }
    break;

    case Sport_Keys.RealTek_Key_Sport_Step_Rep:{
      var info = "Sport_Step_Rep!"
      common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Verblose)
      var sports = getStepItemsWithValue(l2PayLoad)
      var info = "Step Syn Res Count: " + sports.length
      common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Info)
      if(sportDataUpdateBlock){
        sportDataUpdateBlock(connectedDevice,null,sports)
      }

    }
    break;


    case Sport_Keys.RealTek_Key_Sport_Sleep_Rep:{
      var info = "Sleep Syn Res!"
      common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Verblose)
      var sleeps = getSleepItemsWithValue(l2PayLoad)
      if(sleepDataUpdateBlock){
        sleepDataUpdateBlock(connectedDevice,null,sleeps)
      }
    }
    break;

    case Sport_Keys.RealTek_Key_HR_Rep:{
      var info = "Heart rate update Res!"
      common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Verblose)
      var heartRates = getHeartRateItemsWithValue(l2PayLoad)
      if (heartRateDataUpdateBlock){
        heartRateDataUpdateBlock(connectedDevice,null,heartRates)
      }

    }
    break;

    case Sport_Keys.RealTek_Key_HR_GetContinuousSet_Rep:{
      var info = "Get Heart rate Continuous Res!"
      common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Verblose)
      var enableCode = new DataView(l2PayLoad, 3, 1).getUint8(0)
      var enable = true
      if(!enableCode){
        enable = false
      }
      var callBack = characteristicValueWrtieBlocks[blockkey]

      if (callBack) {
        callBack(connectedDevice, null, enable)
        removeCacheBlockWithKey(blockkey)
      }

    }
    break;

    case Sport_Keys.RealTek_Key_BP_Rep:{
      var info = "Get Blood pressure Res!"
      common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Verblose)
      var bpItems = getBloodpressureItemsWithValue(l2PayLoad)
      if (bloodPressureDataUpdateBlock){
        bloodPressureDataUpdateBlock(connectedDevice,null,bpItems)
      }
    }
    break;

    case Sport_Keys.RealTek_Key_BP_Stop:{
      var info = "Blood Pressure have stopped!"
      common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Verblose)
      if (stopMeasuringBloodPressureBlock){
        stopMeasuringBloodPressureBlock(connectedDevice,null,null)
      }


    }
    break;
  }
}





function parseRemindCmdData(l1Payload, blockkey){
  var key = getL2PayloadKeyWithL1PayLoad(l1Payload)
  var l2HeaderSize = cmdPreDef.DF_RealTek_L2_Header.DF_RealTek_L2_Header_Size
  var l2PayLoad = l1Payload.slice(2)
  var remind_Keys = cmdPreDef.ZH_RealTek_Remind_Key
  switch(key){
    case (remind_Keys.RealTek_Key_Universal_Message):{
      var callBack = characteristicValueWrtieBlocks[blockkey]
      if (callBack) {
        callBack(connectedDevice, null, null)
        removeCacheBlockWithKey(blockkey)
      }

    }
    break;
  }

}

function parseBindCmdData(l1Payload,blockkey){
  console.log("call parseBindCmdData")
  var key = getL2PayloadKeyWithL1PayLoad(l1Payload)
  var l2HeaderSize = cmdPreDef.DF_RealTek_L2_Header.DF_RealTek_L2_Header_Size
  var l2PayLoad = l1Payload.slice(2)
  var Bind_Keys = cmdPreDef.ZH_RealTek_Bind_Key
  switch(key){
    case Bind_Keys.RealTek_Key_Bind_Rep:{
      var statusCode = new DataView(l2PayLoad, 3, 1).getUint8(0)
      var info = "Bind Res status:" + statusCode
      common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Info)
      var callBack = characteristicValueWrtieBlocks[blockkey]
      if (callBack) {
        callBack(connectedDevice, null, statusCode)
        removeCacheBlockWithKey(blockkey)
      }

    }
    break;

    case Bind_Keys.RealTek_Key_Login_Rep:{
      var statusCode = new DataView(l2PayLoad, 3, 1).getUint8(0)
      var info = "Login Res status:" + statusCode
      common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Info)
      var callBack = characteristicValueWrtieBlocks[blockkey]
      if (callBack) {
        callBack(connectedDevice, null, statusCode)
        removeCacheBlockWithKey(blockkey)
      }
    }
    break;
  }

}

/*
* Parse Ctrl Cmd Data
*/

function parseContrlCmdData(l1Payload, blockkey){
  console.log("call parseContrlCmdData")
  var key = getL2PayloadKeyWithL1PayLoad(l1Payload)
  var ctrl_Keys = cmdPreDef.ZH_RealTek_Control_Key
  switch(key){
    case ctrl_Keys.RealTek_Key_Ctrol_Photo_Rep:{
      console.log("RealTek_Key_Ctrol_Photo_Rep")
      if (cameraModeUpdateBlock){
        console.log("RealTek_Key_Ctrol_Photo_Rep")
        cameraModeUpdateBlock(connectedDevice)
      }

    }
    break

  }
}


/*
*  Parse Set Cmd Data
*/

function parseSetCmdData(l1Payload, blockkey){
  var key = getL2PayloadKeyWithL1PayLoad(l1Payload)
  var l2HeaderSize = cmdPreDef.DF_RealTek_L2_Header.DF_RealTek_L2_Header_Size
  var l2PayLoad = l1Payload.slice(2)
  var Setting_Keys = cmdPreDef.ZH_RealTek_Setting_Key
  switch(key){
    case (Setting_Keys.RealTek_Key_Get_ALarmList_Rep):{
      var alarms = getAlarmsWithValue(l2PayLoad)
      var callBack = characteristicValueWrtieBlocks[blockkey]
      if(callBack){
        callBack(connectedDevice,null,alarms)
        removeCacheBlockWithKey(blockkey)
      }
         
    }
    break;
    case (Setting_Keys.RealTek_Key_Get_Sit_Long_Rep):{
      var statusCode = new DataView(l2PayLoad, 3, 1).getUint8(0)
      var onEnable = true
      if(statusCode == 0){
        onEnable = false
      }
      var callBack = characteristicValueWrtieBlocks[blockkey]
      if (callBack) {
        callBack(connectedDevice, null, onEnable)
        removeCacheBlockWithKey(blockkey)
      }

    }
    break;

    case (Setting_Keys.RealTek_Key_Get_TurnLight_Rep):{
      var statusCode = new DataView(l2PayLoad, 3, 1).getUint8(0)
      var onEnable = true
      if (statusCode == 0) {
        onEnable = false
      }
      var callBack = characteristicValueWrtieBlocks[blockkey]
      if (callBack) {
        callBack(connectedDevice, null, onEnable)
        removeCacheBlockWithKey(blockkey)
      }

    }
    break;

    case (Setting_Keys.RealTek_Key_Get_ScreenOrientationRep):{
      var orientation = new DataView(l2PayLoad, 3, 1).getUint8(0)
      var callBack = characteristicValueWrtieBlocks[blockkey]
      if (callBack) {
        callBack(connectedDevice, null, orientation)
        removeCacheBlockWithKey(blockkey)
      }
    }
    break;

    case (Setting_Keys.RealTek_Key_Get_FunctionsRep):{
      getAllFunctionsWithValue(l2PayLoad)
      var callBack = characteristicValueWrtieBlocks[blockkey]
      if (callBack) {
        callBack(connectedDevice, null, null)
        removeCacheBlockWithKey(blockkey)
      }
    }
    break;
  }


}


function getCalibrationItem(l2PayLoad){
  var l2PayloadHeaderSize = cmdPreDef.DF_RealTek_L2_Header.DF_RealTek_L2_Payload_Header_Size
  var valueLengthPreBuffer = new DataView(l2PayLoad, 1, 1)
  var valueLengthLateBuffer = new DataView(l2PayLoad, 2, 1)
  var valueLength = ((valueLengthPreBuffer.getUint8(0) & 0x1) << 8) + valueLengthLateBuffer.getUint8(0)
  var calibrationItemLength = 13
  if(valueLength < calibrationItemLength){
    var info = "Calibration Item is null"
    common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Warning)
    return null;
  }else{
    var offset = (new DataView(l2PayLoad, 3, 1)).getUint8(0)
    var totalSteps = ((new DataView(l2PayLoad, 4, 1)).getUint8(0) << 24) + ((new DataView(l2PayLoad, 5, 1)).getUint8(0) << 16) + ((new DataView(l2PayLoad, 6, 1)).getUint8(0) << 8) + (new DataView(l2PayLoad, 7, 1)).getUint8(0)
    var totalCalories = ((new DataView(l2PayLoad, 8, 1)).getUint8(0) << 24) + ((new DataView(l2PayLoad, 9, 1)).getUint8(0) << 16) + ((new DataView(l2PayLoad, 10, 1)).getUint8(0) << 8) + (new DataView(l2PayLoad, 11, 1)).getUint8(0)
    var totalDistance = ((new DataView(l2PayLoad, 12, 1)).getUint8(0) << 24) + ((new DataView(l2PayLoad, 13, 1)).getUint8(0) << 16) + ((new DataView(l2PayLoad, 14, 1)).getUint8(0) << 8) + (new DataView(l2PayLoad, 15, 1)).getUint8(0)

    var info = "Calibration today total Sportdata" + " offset: " + offset + " totalSteps:" + totalSteps + " totalCalory:" + totalCalories + " totalDistance:" + totalDistance
    common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Verblose)

    var calibration = preModel.initSportCalibrationItem()
    calibration.offset = offset
    calibration.totalSteps = totalSteps
    calibration.totalCalory = totalCalories
    calibration.totalDistance = totalDistance
    return calibration
  }
}

/*
* 获取血压数据
*/
function getBloodpressureItemsWithValue(l2PayLoad){
  var info = "call getBloodpressureItemsWithValue"
  common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Verblose)

  var bpHeaderSize = 4
  var bpItemLength = 8
  var cutyear = preModel.DF_RealTek_Date_Cut_Year

  var l2PayloadHeaderSize = cmdPreDef.DF_RealTek_L2_Header.DF_RealTek_L2_Payload_Header_Size
  var valueLengthPreBuffer = new DataView(l2PayLoad, 1, 1)
  var valueLengthLateBuffer = new DataView(l2PayLoad, 2, 1)
  var valueLength = ((valueLengthPreBuffer.getUint8(0) & 0x1) << 8) + valueLengthLateBuffer.getUint8(0)

  if(valueLength < bpHeaderSize){
    var subinfo = "blood pressure Items Header length less than min length" 
    common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Warning)
    return null
  }

  var l2PayLoadValue = l2PayLoad.slice(l2PayloadHeaderSize)

  var year = ((new DataView(l2PayLoadValue, 0, 1)).getUint8(0) >> 1) & 0x3F
  var month = (((new DataView(l2PayLoadValue, 0, 1)).getUint8(0) & 0x01) << 3) + ((new DataView(l2PayLoadValue, 1, 1)).getUint8(0) >> 5)
  var day = (new DataView(l2PayLoadValue, 1, 1)).getUint8(0) & 0x1F
  var itemCount = (new DataView(l2PayLoadValue, 2, 1)).getUint8(0) * 0x100 + (new DataView(l2PayLoadValue, 3, 1)).getUint8(0)
  year = year + cutyear

  var bpValue = l2PayLoadValue.slice(bpHeaderSize)

  var bpItems = new Array()
  for (var index = 0; index < itemCount; index++) {
    var beginOffset = index * bpItemLength
    var bpItemValue = bpValue.slice(beginOffset)

    var minutes = ((new DataView(bpItemValue, 2, 1)).getUint8(0) << 8) + (new DataView(bpItemValue, 3, 1)).getUint8(0)
    var seconds = (new DataView(bpItemValue, 4, 1)).getUint8(0)
    var hrp = (new DataView(bpItemValue, 5, 1)).getUint8(0)
    var lowBP = (new DataView(bpItemValue, 6, 1)).getUint8(0)
    var highBP = (new DataView(bpItemValue, 7, 1)).getUint8(0)
    var hour = parseInt(minutes/60)
    var min = minutes%60

    var timeString = year + '-' + month + '-' + day + '-' + hour + '-' + min + '-' + seconds

    var info = "BP Item time:" + timeString + " heartRate:" + hrp + " lowPressure:" + lowBP + " highPressure:" + highBP
    common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Verblose)


    var bpItem = preModel.initBPItem()
    bpItem.time = timeString
    bpItem.heartRate = hrp
    bpItem.lowPressure = lowBP
    bpItem.highPressure = highBP
    bpItems.push(bpItem)

  }

  return bpItems


}

/*
* 获取心率数据
*/

function getHeartRateItemsWithValue(l2PayLoad){
  
  var hrHeaderSize = 4
  var hrItemLength = 4
  var cutyear = preModel.DF_RealTek_Date_Cut_Year

  var l2PayloadHeaderSize = cmdPreDef.DF_RealTek_L2_Header.DF_RealTek_L2_Payload_Header_Size
  var valueLengthPreBuffer = new DataView(l2PayLoad, 1, 1)
  var valueLengthLateBuffer = new DataView(l2PayLoad, 2, 1)
  var valueLength = ((valueLengthPreBuffer.getUint8(0) & 0x1) << 8) + valueLengthLateBuffer.getUint8(0)

  if(valueLength < hrHeaderSize){
    var info = "Heart rate Items Header length less than min length"
    common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Warning)
    return null
  }

  var l2PayLoadValue = l2PayLoad.slice(l2PayloadHeaderSize)

  var year = ((new DataView(l2PayLoadValue, 0, 1)).getUint8(0) >> 1) & 0x3F
  var month = (((new DataView(l2PayLoadValue, 0, 1)).getUint8(0) & 0x01) << 3) + ((new DataView(l2PayLoadValue, 1, 1)).getUint8(0) >> 5)
  var day = (new DataView(l2PayLoadValue, 1, 1)).getUint8(0) & 0x1F
  var itemCount = (new DataView(l2PayLoadValue, 2, 1)).getUint8(0) * 0x100 + (new DataView(l2PayLoadValue, 3, 1)).getUint8(0)
  year  = year + cutyear

  var hrValue = l2PayLoadValue.slice(hrHeaderSize)

  var heartRates = new Array()
  for (var index = 0; index < itemCount; index++) {
    var beginOffset = index * hrItemLength
    var hrItemValue = hrValue.slice(beginOffset)
    var minutes = (new DataView(hrItemValue, 0, 1)).getUint8(0) * 0x100 + (new DataView(hrItemValue, 1, 1)).getUint8(0)
    var seconds = (new DataView(hrItemValue, 2, 1)).getUint8(0)
    var hrp = (new DataView(hrItemValue, 3, 1)).getUint8(0)
    var hour = minutes/60
    hour = parseInt(hour)
    var min = minutes%60

    var timeString = year + '-' + month + '-' + day + '-' + hour + '-' + min + '-' + seconds

    var info = "Heart item time:" + timeString + " HRate:" + hrp
    common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Verblose)

    var hrItem = preModel.initHRItem()
    hrItem.time = timeString
    hrItem.heartRate = hrp

    heartRates.push(hrItem)

  }

  return heartRates


}

/*
* 获取睡眠数据
*/
function getSleepItemsWithValue(l2PayLoad){
  var sleepHeaderSize = 4
  var sleepItemLength = 4
  var cutyear = preModel.DF_RealTek_Date_Cut_Year

  var l2PayloadHeaderSize = cmdPreDef.DF_RealTek_L2_Header.DF_RealTek_L2_Payload_Header_Size
  var valueLengthPreBuffer = new DataView(l2PayLoad, 1, 1)
  var valueLengthLateBuffer = new DataView(l2PayLoad, 2, 1)
  var valueLength = ((valueLengthPreBuffer.getUint8(0) & 0x1) << 8) + valueLengthLateBuffer.getUint8(0)

  if(valueLength < sleepHeaderSize){
    var info = "Sleep Items Header length less than min length"
    common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Warning)
    return null;
  }

  var l2PayLoadValue = l2PayLoad.slice(l2PayloadHeaderSize)

  var year = ((new DataView(l2PayLoadValue, 0, 1)).getUint8(0) >> 1) & 0x3F
  var month = (((new DataView(l2PayLoadValue, 0, 1)).getUint8(0) & 0x01) << 3) + ((new DataView(l2PayLoadValue, 1, 1)).getUint8(0) >> 5)
  var day = (new DataView(l2PayLoadValue, 1, 1)).getUint8(0) & 0x1F
  var itemNumbers = (new DataView(l2PayLoadValue, 3, 1)).getUint8(0)
  year = year + cutyear

  var sleepValue = l2PayLoadValue.slice(sleepHeaderSize)

  var sleeps = new Array()
  
  for (var index = 0; index < itemNumbers; index++) {
    var beginOffset = index * sleepItemLength
    var sleepItemValue = sleepValue.slice(beginOffset)

    var allminute = ((new DataView(sleepItemValue, 0, 1)).getUint8(0) << 8) + (new DataView(sleepItemValue, 1, 1)).getUint8(0)
    var mode = (new DataView(sleepItemValue, 3, 1)).getUint8(0) & 0xf
    if((allminute >= 24*60) || (mode == 0) || (mode>3) ){
      var info = "Sleep Data Error-allMinute:" + allminute + " mode:" + mode
      common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Error)
    }else{
      var item = preModel.initSleepItem()
      var Sleep_Modes = preModel.ZH_RealTek_Sleep_Mode
      if(mode == 0x01){
        item.mode = Sleep_Modes.ZH_RealTek_LightSleep
      }else if(mode == 0x02){
        item.mode = Sleep_Modes.ZH_RealTek_DeepSleep
      }else{
        item.mode = Sleep_Modes.ZH_RealTek_Awake
      }

      var hour = allminute/60
      hour = parseInt(hour)
      var minute = allminute%60
      if(hour == 24){
        hour = 0
        day = day +1
      }
      var timeString = year + '-' + month + '-' + day + '-' + hour + '-' + minute

      item.startTime = timeString

      var info = "Parse sleep data:startTime:" + timeString + " Mode:" + mode
      common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Info)
      
      var containBool = filterSameStartTimeSleepItem(sleeps,item)
      if(containBool){
        info = "Sleep item reduplicate startTime:" + timeString
        common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Verblose)
      }

      var beginTime = 10
      var endTime = 18

      if(hour > beginTime && hour < endTime){
        containBool = true
        info = "Delete Sleep data time is not at 18-10.Time:" + timeString
        common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Warning)

      }
      if(!containBool){
        sleeps.push(item)
      }

      

    }
  }

  return sleeps


}


/*
* 过滤重复的睡眠数据
*/
function filterSameStartTimeSleepItem(sleeps,item){
  var containBool = false
  var timeString = item.startTime
  for(var subItem in sleeps){
    var subTimeString = subItem.startTime
    if(subTimeString == timeString){
      containBool = true
    }
  }

  return containBool

}

/*
* 获取运动数据
*/
function getStepItemsWithValue(l2PayLoad) {
  
  var sportHeaderSize = 4
  var stepItemLength = 8

  var cutyear = preModel.DF_RealTek_Date_Cut_Year

  var l2PayloadHeaderSize = cmdPreDef.DF_RealTek_L2_Header.DF_RealTek_L2_Payload_Header_Size
  var valueLengthPreBuffer = new DataView(l2PayLoad, 1, 1)
  var valueLengthLateBuffer = new DataView(l2PayLoad, 2, 1)
  var valueLength = ((valueLengthPreBuffer.getUint8(0) & 0x1) << 8) + valueLengthLateBuffer.getUint8(0)
  if(valueLength < sportHeaderSize){
    var info = "Step Items Header length less than min length"
    common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Warning)
    return null;
  }

  
  var l2PayLoadValue = l2PayLoad.slice(l2PayloadHeaderSize)
  var year = ((new DataView(l2PayLoadValue, 0, 1)).getUint8(0) >> 1) & 0x3F
  var month = (((new DataView(l2PayLoadValue, 0, 1)).getUint8(0) & 0x01) << 3) + ((new DataView(l2PayLoadValue, 1, 1)).getUint8(0) >> 5)
  var day = (new DataView(l2PayLoadValue, 1, 1)).getUint8(0) &0x1F
  var itemNumbers = (new DataView(l2PayLoadValue, 3, 1)).getUint8(0)
  
  var stepValue = l2PayLoadValue.slice(sportHeaderSize)
  year = year + cutyear
  var yearString = year+'-'+month+'-'+day

  var steps = new Array()
  for(var index=0; index<itemNumbers; index++){
    var beginOffset = index*stepItemLength
    var stepItemValue = stepValue.slice(beginOffset)

    var offset = ((new DataView(stepItemValue, 0, 1)).getUint8(0) << 3) + ((new DataView(stepItemValue, 1, 1)).getUint8(0) >> 5)
    var mode = ((new DataView(stepItemValue, 1, 1)).getUint8(0) >> 3) & 0x3
    var stepCount = (((new DataView(stepItemValue, 1, 1)).getUint8(0) & 0x7) << 9) + ((new DataView(stepItemValue, 2, 1)).getUint8(0) << 1) + ((new DataView(stepItemValue, 3, 1)).getUint8(0) >> 7)
    var activeTime = ((new DataView(stepItemValue, 3, 1)).getUint8(0) >> 3) & 0xf
    var calories = (((new DataView(stepItemValue, 3, 1)).getUint8(0) & 0x7) << 16) + ((new DataView(stepItemValue, 4, 1)).getUint8(0) << 8) + (new DataView(stepItemValue, 5, 1)).getUint8(0)
    var distance = ((new DataView(stepItemValue, 6, 1)).getUint8(0) << 8) + (new DataView(stepItemValue, 7, 1)).getUint8(0)

    if(offset >= 96){
      var info = "Sport Data error, offset more than 96: " + offset
    }else{
      var item = preModel.initSportItem()
      item.date = yearString
      item.dayOffset = offset
      if (mode == 0) {
        item.mode = preModel.ZH_RealTek_Sport_Mode.ZH_RealTek_Stationary;
      } else if (mode == 1) {
        item.mode = preModel.ZH_RealTek_Sport_Mode.ZH_RealTek_Walk;
      } else if (mode == 2) {
        item.mode = preModel.ZH_RealTek_Sport_Mode.ZH_RealTek_Run;
      }
      item.stepCount = stepCount;
      item.activeTime = activeTime;
      item.calories = calories;
      item.distance = distance;

      steps.push(item)

    }

    var info = "Parse Sport data date: " + yearString + " offset: " + offset + " mode: " + mode + " stepCount: " + stepCount + " activeTime: " + activeTime + " calories: " + calories + " distance: " +distance
    
    common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Info)


  }

  return steps

}

/*
* 获取所有闹钟列表
*/
function getAlarmsWithValue(value){
  common.printLogWithBuffer(value,"alarms")
  var arlarmValueLength = cmdPreDef.DF_RealTek_Header_Predef.DF_RealTek_AlarmValue_Length
  var l2PayloadHeaderSize = cmdPreDef.DF_RealTek_L2_Header.DF_RealTek_L2_Payload_Header_Size
  var valueByteLength = value.byteLength
  if (valueByteLength < l2PayloadHeaderSize){
    var info = "Warn AlarmValue byteLength less than l2PayloadHeaderSize"
    common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Warning)
    return;

  }

  var valueLengthPreBuffer = new DataView(value,1, 1)
  var valueLengthLateBuffer = new DataView(value,2,1)
  var valueLength = ((valueLengthPreBuffer.getUint8(0) & 0x1) << 8) + valueLengthLateBuffer.getUint8(0)
  if(valueByteLength < (l2PayloadHeaderSize + valueLength)){
    var info = "Warn Alarms Value byteLength less than ValueLength"
    common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Warning)
    return;
  }
  var alarmsNum = valueLength/arlarmValueLength
  console.log("alarms number:",alarmsNum)
  if(alarmsNum > 3){
    var info = "Warn Alarms count more than 3"
    common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Warning)
    alarmsNum = 3
  }
  var alarms = new Array()
  var alarmValue = value.slice(l2PayloadHeaderSize)
  common.printLogWithBuffer(alarmValue,"alarm value data:")
  for(var index = 0; index < alarmsNum; index++){
    if (alarmValue.byteLength >= (index * arlarmValueLength + 4)){
      var year = (new DataView(alarmValue, index * arlarmValueLength, 1).getUint8(0) & 0xfc) >> 2
      var month = ((new DataView(alarmValue, index * arlarmValueLength, 1).getUint8(0) & 0x3) << 2) + ((new DataView(alarmValue, index * arlarmValueLength + 1, 1).getUint8(0) & 0xc0) >> 6)
      var day = (new DataView(alarmValue, index * arlarmValueLength + 1, 1).getUint8(0) & 0x3f) >> 1
      var hour = ((new DataView(alarmValue, index * arlarmValueLength + 1, 1).getUint8(0) & 0x1) << 4) + ((new DataView(alarmValue, index * arlarmValueLength + 2, 1).getUint8(0) & 0xf0) >> 4)
      var minute = ((new DataView(alarmValue, index * arlarmValueLength + 2, 1).getUint8(0) & 0x0f) << 2) + ((new DataView(alarmValue, index * arlarmValueLength + 3, 1).getUint8(0) & 0xc0) >> 6)

      var index = (new DataView(alarmValue, index * arlarmValueLength + 3, 1).getUint8(0) & 0x38) >> 3
      var dayFlags = new DataView(alarmValue, index * arlarmValueLength + 4, 1).getUint8(0) & 0x7f
      year = year + preModel.DF_RealTek_Date_Cut_Year


      var alarm = preModel.initAlarm()
      alarm.year = year
      alarm.month = month
      alarm.day = day
      alarm.hour = hour
      alarm.minute = minute
      alarm.index = index
      alarm.dayFlags = dayFlags
      alarms[index] = alarm

      var info = "alarm year:" + year + " month:" + month + " day:" + day + " hour" + hour + " minute" + minute + " index:" + index + " dayFlags:" + dayFlags
      common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Info)


    }else{
      var info = "alarmValue length: " + alarmValue.byteLength
      console.log(info)

    }
    
  }

  return alarms

}




/*
* 获取设备所有功能
*/

function getAllFunctionsWithValue(value){
  common.printLogWithBuffer(value, "functions ")
  var l2PayloadHeaderSize = cmdPreDef.DF_RealTek_L2_Header.DF_RealTek_L2_Payload_Header_Size
  var valueLengthPreBuffer = new DataView(value, 1, 1)
  var valueLengthLateBuffer = new DataView(value, 2, 1)
  var valueLength = ((valueLengthPreBuffer.getUint8(0) & 0x1) << 8) + valueLengthLateBuffer.getUint8(0)
 
  if(valueLength < 4){
    var info = "Get All Functions length is less than 4"
    common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Warning)
  }
  var byteLength = value.byteLength
  var offset = byteLength -1
  var hasFakeBloodPressure = (new DataView(value, offset, 1)).getUint8(0) & 0x1
 
  var hasRealBloodPressure = ((new DataView(value, offset, 1)).getUint8(0) >> 1) & 0x1
  var hasHRM = ((new DataView(value, offset, 1)).getUint8(0) >> 2) & 0x1
  var hasScreenSwitch = ((new DataView(value, offset, 1)).getUint8(0) >> 3) & 0x1
  var hasStep = ((new DataView(value, offset, 1)).getUint8(0) >> 4) & 0x1
  var hasSleep = ((new DataView(value, offset, 1)).getUint8(0) >> 5) & 0x1
  var hasWechatSport = ((new DataView(value, offset, 1)).getUint8(0) >> 6) & 0x1

  
  connectedDevice.hasBloodPressureFunc = hasFakeBloodPressure || hasRealBloodPressure
  connectedDevice.hasHRMFunc = hasHRM
  connectedDevice.hasStepFunc = hasStep
  connectedDevice.hasOrientationSwitchFunc = hasScreenSwitch
  connectedDevice.hasSleepFunc = hasSleep
  connectedDevice.hasGetFuncVlaue = true

  if(functionsHaveUpdated){
    functionsHaveUpdated(connectedDevice,null,null)
  }

}



/*
* 获取所有服务
*/
function getAllServices(){
  getBLEDeviceServices({
    deviceId: connectedDeviceId,
    success: function (serRes) {
      var services = serRes.services
      allServices = services
      for(var i=0;i<services.length;i++){
        var service = services[i]
        handleService(service)
        getAllCharacteristics(service.uuid)
      }
    },
    fail: function (serRes) {
      var info = "getAllServices fail" + serRes.errMsg
      common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Error)

    }
  })
}

function handleService(service){
  var serviceUUID = service.uuid
  var preDefSer = preDefService.RealTek_ServiceUUIDs
  if (serviceUUID.indexOf(preDefSer.RealTek_DFU_ServiceUUID) != -1 ){
    OTAMode = preModel.ZH_RealTek_UpdateMode.ZH_RealTek_OTAUpMode_External
  }
  if (serviceUUID.indexOf(preDefSer.RealTek_Immediate_Remind_ServiceUUID) != -1 ){
    immediateRemindServiceObj = service
  }
  if (serviceUUID.indexOf(preDefSer.RealTek_Link_Loss_ServiceUUID) != -1 ){
    lossServiceObj = service
  }
  if (serviceUUID.indexOf(preDefSer.RealTek_Battery_ServiceUUID) != -1) {
    batteryServiceObj = service
  }
}


/*
* 获取所有特征
*/

function getAllCharacteristics(serviceUUID){
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

/*
* 操作服务特征
*/
function handleCharacteristic(serviceUUID,characteristic){

  var charUUIDString = characteristic.uuid
  var charProperties = characteristic.properties
  var preDefChar = preDefService.CharacteristicUUIDs
  var deviceId = connectedDeviceId
  if (charUUIDString.indexOf(preDefChar.RealTek_DFUTransferData_CharUUID) != -1){
    console.log("find DFUTransferData_CharUUID -", characteristic.uuid)
    SendDataDFUChar = characteristic
  }
  if (charUUIDString.indexOf(preDefChar.RealTek_DFUControlCmd_CharUUID) != -1) {
    console.log("find ControlCmdDFUChar_CharUUID -", characteristic.uuid)
    ControlCmdDFUChar = characteristic
    handleNotifyCharacteristic(serviceUUID,characteristic)
  }
  

  if (charUUIDString.indexOf(preDefChar.RealTek_Write_CharUUID) != -1){
    
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
    if (characteristic.properties.read) {
      readBLECharacteristicValue({
        deviceId: deviceId,
        serviceId: serviceUUID,
        characteristicId: characteristic.uuid,
        success: function (res) {
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

  if (charUUIDString.indexOf(preDefChar.RealTek_OTABDAddress_CharUUID) != -1 ){
    macAddressCharObj = characteristic
    if (characteristic.properties.read) {
      readBLECharacteristicValue({
        deviceId: deviceId,
        serviceId: serviceUUID,
        characteristicId: characteristic.uuid,
        success: function (res) {
        },
        fail: function (res) {
          var info = "Read macAddress fail" + res.errMsg + "characteristicUUID:" + characteristic.uuid
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


/* - Notify特征 - */

function handleNotifyCharacteristic(serviceId, characteristic){
  
  if (characteristic.properties.notify){
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

  }else{
    console.log("call handleNotifyCharacteristic is have not notify", characteristic.uuid)
  }
}

/* - 组合协议包 - */


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
    l1Payload.set(new Uint8Array(l2Header),0)
    l1Payload.set(new Uint8Array(l2Payload), l2HeaderSize)
    var l1Header = getL1HeaderWithAckFlagBool(ackFlagBool,errFlagBool,l1Payload,l1PayloadLength,sequenceId)
    var l1HeaderLength = cmdPreDef.DF_RealTek_L1_Header.DF_RealTek_L1_Header_Size
    var l1PacketLength = l1HeaderLength + l1PayloadLength
    var l1Packet = new Uint8Array(l1PacketLength)
    if(l1Packet.byteLength != l1PacketLength){
      common.printDebugInfo("L1 packet init fail", common.ZH_Log_Level.ZH_Log_Error)
    }else{
      l1Packet.set(new Uint8Array(l1Header),0)
      l1Packet.set(l1Payload, l1HeaderLength)
      
    }
    return l1Packet.buffer

  }

}

/*
* 获取L1 Header
*/
function getL1HeaderWithAckFlagBool(ackBool, errorBool, L1Payload, L1PayloadLength, sequenceId){
  var l1HeaderSize = cmdPreDef.DF_RealTek_L1_Header.DF_RealTek_L1_Header_Size
  var buffer = new ArrayBuffer(l1HeaderSize)
  if(buffer.byteLength != l1HeaderSize){
    common.printDebugInfo("L1 Header init fail", common.ZH_Log_Level.ZH_Log_Error)
  }else{
    var magic = cmdPreDef.DF_RealTek_L1_Header.DF_RealTek_L1_Header_Magic
    var ackVersion = getVersionACKErrorValueWithAck(ackBool,errorBool)
    var l1HeaderOrder = cmdPreDef.L1_Header_ByteOrder
    var view8 = new Uint8Array(buffer,0,2)
    var payloadView = new DataView(buffer,2,2)
    var crcView = new DataView(buffer,4,2)
    var seqView = new DataView(buffer,6,2)
    view8[0] = magic
    view8[1] = ackVersion
    payloadView.setInt16(0,L1PayloadLength,false)
   
    if((L1PayloadLength > 0) && L1Payload){
      var L1PayloadArray = new Uint8Array(L1Payload)
      var crc16 = common.getCRC16WithValue(L1PayloadArray)
      crcView.setInt16(0,crc16,false)

    }else{
      crcView.setInt16(0,0,false)
    }

    seqView.setInt16(0,sequenceId,false)

  }
  return buffer
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
  var loadSize = l2Payload_Header_Size
  var l2PayLoadHeader = new Uint8Array(loadSize)
  var l2PayLoad = null
  if (l2PayLoadHeader.byteLength != loadSize) {
    common.printDebugInfo("l2 PayLoadHeader init fail", common.ZH_Log_Level.ZH_Log_Error)
  } else {
    l2PayLoadHeader[0] = key
    l2PayLoadHeader[1] = keyValueLength >> 8 & 0x1;
    l2PayLoadHeader[2] = keyValueLength & 0xFF;
    if((keyValueLength >0) && keyValue){
     l2PayLoad =  appendBuffer(l2PayLoadHeader.buffer,keyValue)
     
    }else{
      l2PayLoad = l2PayLoadHeader.buffer
      common.printDebugInfo("l2 PayLoad is null", common.ZH_Log_Level.ZH_Log_Info)
    }
  }
  common.printLogWithBuffer(l2PayLoad, "l2Payload buffer ")
  return l2PayLoad

}

/*
* 发送错误ack
*/
function sendErrorAck(seq,callBack){
  var errorPacket = getL1HeaderWithAckFlagBool(true,true,null,0,seq)
  sendDataToBandDevice({
    data: errorPacket,
    ackBool: true,
    callBack: function(deviceId,error,result){
       if(callBack){
         callBack(deviceId,error,result)
       }
    }
  })
}

function sendSuccessAck(seq,callBack){
  var info = "sendSuccessAck seq: " + seq
  common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Info)

  var sucPacket = getL1HeaderWithAckFlagBool(true,false,null,0,seq)
  sendDataToBandDevice({
    data: sucPacket,
    ackBool: true,
    callBack: function (deviceId, error, result) {
      if (callBack) {
        callBack(deviceId, error, result)
      }
    }
  })
}

/* - 公共函数 - */

// ArrayBuffer转为字符串，参数为ArrayBuffer对象

function getStringWithBuffer(buf) {
   return String.fromCharCode.apply(null, new Uint8Array(buf));
}

// 字符串转为ArrayBuffer对象，参数为字符串
function getBufferWithString(str) {
    var strLength = GetBytes(str)
    var buf = new ArrayBuffer(strLength) 
    var bufView = new Uint8Array(buf)
    var strLen = str.length
    for (var i=0; i<strLen; i++) {
         bufView[i] = str.charCodeAt(i);
    }
    return buf
    
}


//求一个字符串的字节长度
function GetBytes(str) {
  var len = str.length;
  var bytes = len;
  for (var i = 0; i < len; i++) {
    //console.log(str[i],str.charCodeAt(i));
    if (str.charCodeAt(i) > 255) bytes++;
  }
  return bytes;
}
/*
* 无连接发送命令时回调
*/
function hasConnectDevice(callBack) {
  if (connectedDevice) {
    return true
  } else {
    if (callBack) {
      var error = getDisconnectedError()
      callBack(connectedDevice, error, null)
    }
  }
}


/*
* 获取断开连接错误回调
*/
function getDisconnectedError() {
  var code = preModel.ZH_RealTek_Error_Code.ZHDisConnectedErrorCode
  var errMsg = "The device is disconnected"
  var error = preModel.initError(code,errMsg)
  return error
}

/*
* 获取微信自定义错误
*/
function getWechatCustomError(res){
  var code = res.errCode
  var errMsg = res.errMsg
  var error = preModel.initError(code, errMsg)
  return error
}

/*
* 特征没有找到错误
*/

function getCharacteristicNotFindError(){
  var code = preModel.ZH_RealTek_Error_Code.ZHCharactiristicNotFindCode
  var errMsg = "The Characteristic not find"
  var error = preModel.initError(code, errMsg)
  return error
}


function getWechatNotUseError(){
  var code = preModel.ZH_RealTek_Error_Code.ZHWechatVersionNotSupportErrorCode
  var errMsg = "The WeChat version is too low to upgrade."
  var error = preModel.initError(code, errMsg)
  return error

}

function getBatteryLevelError(){
  var code = preModel.ZH_RealTek_Error_Code.ZHBatteryErrorCode
  var errMsg = "Battery power below 40 cannot be upgraded,please charge it first."
  var error = preModel.initError(code, errMsg)
  return error
}


/*
* 获取自定义SeqID 
*/
function getSeqIDWithCommand(cmd,key){
  var result = (cmd << 8) + key;
  return result;
}


function checkCRC16WithData(data, crc){
  var l1PayloadLength = data.byteLength
  var uint8Array = new Uint8Array(data)
  var crc16 = common.getCRC16WithValue(uint8Array)
  if(crc == crc16){

    return true
  }else{
    return false
  }

}

/* - 命令函数 - */

function getConnectedDevice(){
  return connectedDevice
}

/*
* 连接低功耗蓝牙设备
*/

function createBLEConnection(obj) {
  wx.createBLEConnection({
    deviceId: obj.deviceId,
    success: function (res) {
      connectedDeviceId = obj.deviceId

      if(!connectedDevice){
        connectedDevice = preModel.initDevice()

      }
      connectedDevice.deviceId = connectedDeviceId
      connectedDevice.connected = true
      

      //获取所有特征服务
      getAllServices()
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
* 断开与低功耗蓝牙设备的连接
*/

function closeBLEConnection(obj) {
  wx.closeBLEConnection({
    deviceId: obj.deviceId,
    success: function (res) {
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
* connect Device
*/

function connectPeripheral(deviceId,callBack){
  createBLEConnection({
    deviceId: deviceId,
    success: function (res) {
      if(callBack){
        callBack(connectedDevice,null,null)
      }
    },
    fail: function (res) {
      console.log("connectPeripheral fail")
      var error = getWechatCustomError(res)
      if(callBack){
        callBack(connectedDevice,error,null)
      }
    }
  })
}

/*
* 断开连接
*/

function cancelPeripheralConnection(callBack){
  var connected = hasConnectDevice(callBack)
  if (!connected) {
    return
  }
  closeBLEConnection({
    deviceId: connectedDeviceId,
    success: function (res) {
      if (callBack) {
        callBack(connectedDevice, null, null)
      }
    },
    fail: function (res) {
      var error = getWechatCustomError(res)
      if (callBack) {
        callBack(connectedDevice, error, null)
      }
    }
  })
}

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

  var keyValue = dataBuffer;
  var cmd = cmdPreDef.ZH_RealTek_CMD_ID.RealTek_CMD_Bind
  var key = cmdPreDef.ZH_RealTek_Bind_Key.RealTek_Key_Bind_Req
  var seqId = getSeqIDWithCommand(cmd,key)
  var packet = getL0PacketWithCommandId(cmd, key, keyValue, maxLength,false,false,seqId)
  sendDataToBandDevice({
    data: packet,
    ackBool: false,
    callBack: function(device, error, result){
      if(!error && result){
        if (result == preModel.ZH_RealTek_Bind_Status.RealTek_Bind_Success){
          if (connectedDevice) {
            connectedDevice.bound = true;
          }
          getDeviceFunstions(null)

        }
      }
      if(callBack){
        callBack(device,error,result)
      }
    }
  })

}


/*
* UnBind
*/

function unBindDeviceonFinished(callBack){
  var connected = hasConnectDevice(callBack)
  if (!connected) {
    return
  }
  var cmd = cmdPreDef.ZH_RealTek_CMD_ID.RealTek_CMD_Bind
  var key = cmdPreDef.ZH_RealTek_Bind_Key.RealTek_Key_UnBind
  var seqId = getSeqIDWithCommand(cmd, key)
  var packet = getL0PacketWithCommandId(cmd, key, null, 0, false, false, seqId)
  sendDataToBandDevice({
    data: packet,
    ackBool: false,
    callBack: function (device, error, result) {
      if (!error && result) {
        if (connectedDevice) {
          connectedDevice.bound = false;
        }

      }
      if (callBack) {
        callBack(device, error, result)
      }
    }
  })
}


/*
* Login
*/

function loginDeviceWithIdentifier(identifier,callBack){
  var connected = hasConnectDevice(callBack)
  if (!connected) {
    return
  }
  var dataBuffer = getBufferWithString(identifier)
  var maxLength = cmdPreDef.DF_RealTek_Header_Predef.DF_RealTek_Max_BoundIdntifier_Length
  if (dataBuffer.byteLength > maxLength) {
    dataBuffer = dataBuffer.slice(0, maxLength)
  }

  var keyValue = dataBuffer;
  common.printLogWithBuffer(dataBuffer,"login value")
  var cmd = cmdPreDef.ZH_RealTek_CMD_ID.RealTek_CMD_Bind
  var key = cmdPreDef.ZH_RealTek_Bind_Key.RealTek_Key_Login_Req
  var seqId = getSeqIDWithCommand(cmd, key)
  console.log("login seq: ",seqId)
  var packet = getL0PacketWithCommandId(cmd, key, keyValue, maxLength, false, false, seqId)

  sendDataToBandDevice({
    data: packet,
    ackBool: false,
    callBack: function (device, error, result) {
      if (!error && result) {
        if (result == preModel.ZH_RealTek_Login_Status.RealTek_Login_Success){
          if (connectedDevice) {
            connectedDevice.bound = true;
          }
          getDeviceFunstions(null)

        }
      }
      if (callBack) {
        callBack(device, error, result)
      }
    }
  })

}


/*
*Find My Band Device
*/
function findMyBandDeviceonFinished(callBack){
  var connected = hasConnectDevice(callBack)
  if (!connected) {
    return
  }
  if(immediateCharObj){
    var buffer = new ArrayBuffer(1)
    var data = new Uint8Array(buffer)
    data[0] = 2
    
    writeBLECharacteristicValue({
      deviceId: connectedDeviceId,
      serviceId: immediateRemindServiceObj.uuid,
      characteristicId: immediateCharObj.uuid,
      value: buffer,
      success: function(res){
        if(callBack){
          callBack(connectedDevice,null,null)
        }

      },
      fail: function(res){
        if(callBack){
          var error = getWechatCustomError(res);
          callBack(connectedDevice,error,null)
        }

      }

    })
  }else{
    if (callBack) {
      var error = getCharacteristicNotFindError()
      callBack(connectedDevice, error, null)
    }
  }
}

/*
* Alarm
*/

function synAlarms(alarms, callBack){
  var connected = hasConnectDevice(callBack)
  if (!connected) {
    return
  }
  var value = null
  var avalidAlarms = 0
  if(alarms && alarms.length > 0){
    var alarmLength = cmdPreDef.DF_RealTek_Header_Predef.DF_RealTek_AlarmValue_Length
    for(var index = 0; index < alarms.length; index++){
      var alarm = alarms[index]
      if (alarm.enable){
        avalidAlarms ++
        var alarmByte = getAlarmValue(alarm)
        if(!value){
          value = alarmByte
        }else{
          value = appendBuffer(value,alarmByte)
        }
      }
    }
    var cmd = cmdPreDef.ZH_RealTek_CMD_ID.RealTek_CMD_Setting
    var key = cmdPreDef.ZH_RealTek_Setting_Key.RealTek_Key_Set_Alarm
    var seqId = getSeqIDWithCommand(cmd, key)
    var keyValue = value
    var keyValueLength = avalidAlarms * alarmLength
    var packet = getL0PacketWithCommandId(cmd, key, keyValue, keyValueLength, false, false, seqId)

    common.printLogWithBuffer(value,"Alarms Value")
    
    sendDataToBandDevice({
      data: packet,
      ackBool: false,
      callBack: callBack 
    })

  }
}

function getBandAlarmsonFinished(callBack){
  var connected = hasConnectDevice(callBack)
  if (!connected) {
    return
  }
  var cmd = cmdPreDef.ZH_RealTek_CMD_ID.RealTek_CMD_Setting
  var key = cmdPreDef.ZH_RealTek_Setting_Key.RealTek_Key_Get_AlarmList_Req
  var seqId = getSeqIDWithCommand(cmd, key)
  var keyValue = null
  var keyValueLength = 0
  var packet = getL0PacketWithCommandId(cmd, key, keyValue, keyValueLength, false, false, seqId)

  sendDataToBandDevice({
    data: packet,
    ackBool: false,
    callBack: callBack
  })
}


function getAlarmValue(alarm){
  var cutYear = preModel.DF_RealTek_Date_Cut_Year
  if(alarm.year > cutYear){
    alarm.year = alarm.year - cutYear
  }
  var year = alarm.year;
  var month = alarm.month;
  var day = alarm.day;
  var hour = alarm.hour;
  var minute = alarm.minute;
  var alarmId = alarm.index;
  var dayflags = alarm.dayFlags;
  var alarmLength = cmdPreDef.DF_RealTek_Header_Predef.DF_RealTek_AlarmValue_Length
  var alarmBytes = new Uint8Array(alarmLength)
  alarmBytes[0] = (year << 2) + ((month & 0xc) >> 2);
  alarmBytes[1] = ((month & 0x3) << 6) + ((day & 0x1f) << 1) + ((hour & 0x10) >> 4);
  alarmBytes[2] = ((hour & 0xf) << 4) + ((minute & 0x3c) >> 2);
  alarmBytes[3] = ((minute & 0x3) << 6) + (alarmId << 3);
  alarmBytes[4] = dayflags;
  return alarmBytes.buffer;

}

/*
* Syn Time
*/

function synTimeonFinished(callBack){
  var connected = hasConnectDevice(callBack)
  if (!connected) {
    return
  }
  var date = new Date()
  var cmd = cmdPreDef.ZH_RealTek_CMD_ID.RealTek_CMD_Setting
  var key = cmdPreDef.ZH_RealTek_Setting_Key.RealTek_Key_Set_Time
  var seqId = getSeqIDWithCommand(cmd, key)
  
  var keyValue = getDateValue(date)
  var keyValueLength = 4
  var packet = getL0PacketWithCommandId(cmd, key, keyValue, keyValueLength, false, false, seqId)

  sendDataToBandDevice({
    data: packet,
    ackBool: false,
    callBack: callBack
  })

}

/*
* 获取时间buffer
*/
function getDateValue(date) {
  var cutYear = preModel.DF_RealTek_Date_Cut_Year

  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  year = year - cutYear

  var value = (year << 26) + (month << 22) + (day << 17) + (hour << 12) + (minute << 6) + second

  var buffer = new ArrayBuffer(4)
  var dataView = new DataView(buffer)
  dataView.setUint32(0, value, false)
  return buffer

}

/*
* Set Step Target
*/

function setStepTarget(step, callBack) {
  var connected = hasConnectDevice(callBack)
  if (!connected) {
    return
  }
  
  var buffer = new ArrayBuffer(4)
  var dataView = new DataView(buffer)
  dataView.setUint32(0,step,false)

  var cmd = cmdPreDef.ZH_RealTek_CMD_ID.RealTek_CMD_Setting
  var key = cmdPreDef.ZH_RealTek_Setting_Key.RealTek_Key_Set_StepTarget
  var seqId = getSeqIDWithCommand(cmd, key)

  var keyValue = buffer
  var keyValueLength = 4
  var packet = getL0PacketWithCommandId(cmd, key, keyValue, keyValueLength, false, false, seqId)

  sendDataToBandDevice({
    data: packet,
    ackBool: false,
    callBack: callBack
  })

}


/*
*Set User Profile
*/

function setUserProfileWithGender(gender, age, height,weight,callBack){
  var connected = hasConnectDevice(callBack)
  if (!connected) {
    return
  }

  var temGender = 0
  if (gender == preModel.ZH_RealTek_Gender.ZH_RealTek_Female){
    temGender = 1
  }
  var temAge = age
  var temHeight = (height + 0.5) * 2 //因为手环端以0.5cm为单位所以得乘以2
  var temWeight = (weight + 0.5) * 2 //因为手环端以0.5kg所以得乘以2

  var userProfile = (temGender << 31) + (temAge << 24) + (temHeight << 15) + (temWeight << 5) + (0 & 0x1f);

  var buffer = new ArrayBuffer(4)
  var dataView = new DataView(buffer)
  dataView.setUint32(0, userProfile, false)


  var cmd = cmdPreDef.ZH_RealTek_CMD_ID.RealTek_CMD_Setting
  var key = cmdPreDef.ZH_RealTek_Setting_Key.RealTek_Key_Set_UserProfile
  var seqId = getSeqIDWithCommand(cmd, key)

  var keyValue = buffer
  var keyValueLength = 4
  var packet = getL0PacketWithCommandId(cmd, key, keyValue, keyValueLength, false, false, seqId)

  sendDataToBandDevice({
    data: packet,
    ackBool: false,
    callBack: callBack
  })

}


/*
* set longsit remind
*/
function setLongSitRemind(sit,callBack){
  var connected = hasConnectDevice(callBack)
  if (!connected) {
    return
  }
  
  var reserved = 0
  var onEnable = 0x00
  if (sit.enable){
    onEnable = 0x01
  }
  var minStep = sit.minStepNum
  var sitTime = sit.sitTime
  var beginTime = sit.beginTime
  var endTime = sit.endTime
  var dayFlags = sit.dayFlags;
  
  var buffer = new ArrayBuffer(8)
  var reverVedView = new DataView(buffer,0,1)
  var enAbleView = new DataView(buffer,1,1)
  var minStepView = new DataView(buffer,2,2)
  var sitTimeView = new DataView(buffer,4,1)
  var beginTimeView = new DataView(buffer,5,1)
  var endTimeView = new DataView(buffer,6,1)
  var dayFlagsView = new DataView(buffer,7,1)

  reverVedView.setUint8(0,0)
  enAbleView.setUint8(0,onEnable)
  minStepView.setUint16(0,minStep,false)
  sitTimeView.setUint8(0,sitTime)
  beginTimeView.setUint8(0,beginTime)
  endTimeView.setUint8(0,endTime)
  dayFlagsView.setUint8(dayFlags)
  

  var cmd = cmdPreDef.ZH_RealTek_CMD_ID.RealTek_CMD_Setting
  var key = cmdPreDef.ZH_RealTek_Setting_Key.RealTek_Key_Set_Sit_Long_OnOff
  var seqId = getSeqIDWithCommand(cmd, key)

  var keyValue = buffer
  var keyValueLength = 8
  var packet = getL0PacketWithCommandId(cmd, key, keyValue, keyValueLength, false, false, seqId)

  sendDataToBandDevice({
    data: packet,
    ackBool: false,
    callBack: callBack
  })

}


/*
* get longsit remind
*/
function getLongSitRemindonFinished(callBack){
  var connected = hasConnectDevice(callBack)
  if (!connected) {
    return
  }
  var cmd = cmdPreDef.ZH_RealTek_CMD_ID.RealTek_CMD_Setting
  var key = cmdPreDef.ZH_RealTek_Setting_Key.RealTek_Key_Get_Sit_Long_Req
  var seqId = getSeqIDWithCommand(cmd, key)

  var keyValue = null
  var keyValueLength = 0
  var packet = getL0PacketWithCommandId(cmd, key, keyValue, keyValueLength, false, false, seqId)

  sendDataToBandDevice({
    data: packet,
    ackBool: false,
    callBack: callBack
  })

}


/*
*set Moblie OS
*/
function setMoblieOS(os,callBack){
  var connected = hasConnectDevice(callBack)
  if (!connected) {
    return
  }

  var OSIdentifier = 0x02
  var reserve = 0
  if (os == preModel.ZH_RealTek_OS.ZH_RealTek_OS_Android){
    OSIdentifier = 0x01
  }

  var valueBuffer = new Uint8Array(2)
  valueBuffer[0] = OSIdentifier
  valueBuffer[1] = reserve
  var buffer = valueBuffer.buffer

  var cmd = cmdPreDef.ZH_RealTek_CMD_ID.RealTek_CMD_Setting
  var key = cmdPreDef.ZH_RealTek_Setting_Key.RealTek_Key_Set_PhoneOS
  var seqId = getSeqIDWithCommand(cmd, key)

  var keyValue = buffer
  var keyValueLength = 2
  var packet = getL0PacketWithCommandId(cmd, key, keyValue, keyValueLength, false, false, seqId)

  sendDataToBandDevice({
    data: packet,
    ackBool: false,
    callBack: callBack
  })

}


/*
* Camera Mode
*/

function setCameraMode(enable,callBack,cameraCallBack){
  var connected = hasConnectDevice(callBack)
  if (!connected) {
    return
  }
  cameraModeUpdateBlock = cameraCallBack
  var value = enable ? 0:1
  var valueBuffer = new Uint8Array(1)
  valueBuffer[0] = value
  var buffer = valueBuffer.buffer

  var cmd = cmdPreDef.ZH_RealTek_CMD_ID.RealTek_CMD_Control
  var key = cmdPreDef.ZH_RealTek_Control_Key.RealTek_Key_Control_Camera_Status_Req
  var seqId = getSeqIDWithCommand(cmd, key)

  var keyValue = buffer
  var keyValueLength = 1
  var packet = getL0PacketWithCommandId(cmd, key, keyValue, keyValueLength, false, false, seqId)

  sendDataToBandDevice({
    data: packet,
    ackBool: false,
    callBack: callBack
  })


}


/*
* 获取抬手亮屏开关状态
*/
function getTurnWristLightEnabledOnFinished(callBack){
  var cmd = cmdPreDef.ZH_RealTek_CMD_ID.RealTek_CMD_Setting
  var key = cmdPreDef.ZH_RealTek_Setting_Key.RealTek_Key_Get_TurnLight_Req
  var seqId = getSeqIDWithCommand(cmd, key)

  var keyValue = null
  var keyValueLength = 0
  var packet = getL0PacketWithCommandId(cmd, key, keyValue, keyValueLength, false, false, seqId)

  sendDataToBandDevice({
    data: packet,
    ackBool: false,
    callBack: callBack
  })
}

/*
* 设置抬手亮屏
*/

function setTurnWristLightEnabled(enable,callBack){
  var connected = hasConnectDevice(callBack)
  if (!connected) {
    return
  }
  var value = enable ? 1 : 0
  var valueBuffer = new Uint8Array(1)
  valueBuffer[0] = value
  var buffer = valueBuffer.buffer

  var cmd = cmdPreDef.ZH_RealTek_CMD_ID.RealTek_CMD_Setting
  var key = cmdPreDef.ZH_RealTek_Setting_Key.RealTek_Key_Set_TurnLight_OnOff
  var seqId = getSeqIDWithCommand(cmd, key)

  var keyValue = buffer
  var keyValueLength = 1
  var packet = getL0PacketWithCommandId(cmd, key, keyValue, keyValueLength, false, false, seqId)

  sendDataToBandDevice({
    data: packet,
    ackBool: false,
    callBack: callBack
  })
}

/*
* 获取横竖屏状态
*/
function getDisplayOrientation(callBack){
  var connected = hasConnectDevice(callBack)
  if (!connected) {
    return
  }
  

  var cmd = cmdPreDef.ZH_RealTek_CMD_ID.RealTek_CMD_Setting
  var key = cmdPreDef.ZH_RealTek_Setting_Key.RealTek_Key_Get_ScreenOrientationReq
  var seqId = getSeqIDWithCommand(cmd, key)

  var keyValue = null
  var keyValueLength = 0
  var packet = getL0PacketWithCommandId(cmd, key, keyValue, keyValueLength, false, false, seqId)

  sendDataToBandDevice({
    data: packet,
    ackBool: false,
    callBack: callBack
  })
}

/*
* Get device Functions
*/
function getDeviceFunstions(callBack){
  var connected = hasConnectDevice(callBack)
  if (!connected) {
    return
  }
  var cmd = cmdPreDef.ZH_RealTek_CMD_ID.RealTek_CMD_Setting
  var key = cmdPreDef.ZH_RealTek_Setting_Key.RealTek_Key_Get_FunctionsReq
  var seqId = getSeqIDWithCommand(cmd, key)
  var keyValueLength = 0;
  var packet = getL0PacketWithCommandId(cmd, key, null, keyValueLength, false, false, seqId)
  sendDataToBandDevice({
    data: packet,
    ackBool: false,
    callBack: callBack
  })
}


/* ----  Notification ------ */

/*
* Set Call Notification
*/

function setEnableCallNotificationEnabled(enable, callBack) {
  var value = enable ? 1 : 2;
  setNotificationEnable(enable, value, callBack)
}


/*
* Set QQ Notification
*/
function setEnableQQNotificationEnabled(enable, callBack){
  var value = enable ? 3 : 4;
  setNotificationEnable(enable,value,callBack)
}


/*
* Set wechat Notification
*/

function setEnableWechatNotificationEnabled(enable, callBack){
  var value = enable ? 5 : 6;
  setNotificationEnable(enable, value, callBack)
}

/*
* Set SMS Notification
*/

function setEnableSMSNotificationEnabled(enable, callBack) {
  var value = enable ? 7 : 8;
  setNotificationEnable(enable, value, callBack)
}

/*
* Set Line Notification
*/

function setEnableLineNotificationEnabled(enable, callBack) {
  var value = enable ? 9 : 10;
  setNotificationEnable(enable, value, callBack)
}




function setNotificationEnable(enable, value,callBack){
  var connected = hasConnectDevice(callBack)
  if (!connected) {
    return
  }
  wx.getSystemInfo({
    success: function(res) {
      var platform = res.platform
      if(!enable || (platform != "ios")){
        var valueBuffer = new Uint8Array(1)
        valueBuffer[0] = value
        var buffer = valueBuffer.buffer

        var cmd = cmdPreDef.ZH_RealTek_CMD_ID.RealTek_CMD_Setting
        var key = cmdPreDef.ZH_RealTek_Setting_Key.RealTek_Key_Set_IncomingTel_OnOff
        var seqId = getSeqIDWithCommand(cmd, key)
        var keyValueLength = 1;
        var packet = getL0PacketWithCommandId(cmd, key, buffer, keyValueLength, false, false, seqId)
        sendDataToBandDevice({
          data: packet,
          ackBool: false,
          callBack: callBack
        })

      }else{
        var os = preModel.ZH_RealTek_OS.ZH_RealTek_OS_iOS
        setMoblieOS(os,function(device,error,result){
          if(error){
            if(callBack){
              callBack(device,error,result)
            }
          }else{
            var valueBuffer = new Uint8Array(1)
            valueBuffer[0] = value
            var buffer = valueBuffer.buffer

            var cmd = cmdPreDef.ZH_RealTek_CMD_ID.RealTek_CMD_Setting
            var key = cmdPreDef.ZH_RealTek_Setting_Key.RealTek_Key_Set_IncomingTel_OnOff
            var seqId = getSeqIDWithCommand(cmd, key)
            var keyValueLength = 1;
            var packet = getL0PacketWithCommandId(cmd, key, buffer, keyValueLength, false, false, seqId)
            sendDataToBandDevice({
              data: packet,
              ackBool: false,
              callBack: callBack
            })
          }
        })

       
      }
    },
  })
}

/*
* 设置横竖屏
*/
function SetDisplayOrientation(orientation,callBack){
  var connected = hasConnectDevice(callBack)
  if (!connected) {
    return
  }
  var valueBuffer = new Uint8Array(1)
  valueBuffer[0] = orientation
  var buffer = valueBuffer.buffer

  var cmd = cmdPreDef.ZH_RealTek_CMD_ID.RealTek_CMD_Setting
  var key = cmdPreDef.ZH_RealTek_Setting_Key.RealTek_Key_Set_ScreenOrientation
  var seqId = getSeqIDWithCommand(cmd, key)
  var keyValueLength = 1;
  var packet = getL0PacketWithCommandId(cmd, key, buffer, keyValueLength, false, false, seqId)
  sendDataToBandDevice({
    data: packet,
    ackBool: false,
    callBack: callBack
  })
}

/*
* 同步历史运动数据
*/
function synHisDataOnFinished(callBack){
  var connected = hasConnectDevice(callBack)
  if (!connected) {
    return
  }
  var cmd = cmdPreDef.ZH_RealTek_CMD_ID.RealTek_CMD_SportData
  var key = cmdPreDef.ZH_RealTek_Sport_Key.RealTek_Key_Sport_Req
  var seqId = getSeqIDWithCommand(cmd, key)
  var keyValueLength = 0;
  var packet = getL0PacketWithCommandId(cmd, key, null, keyValueLength, false, false, seqId)
  sendDataToBandDevice({
    data: packet,
    ackBool: false,
    callBack: callBack
  })

}

/*
*设置是否获取手环的实时数据
*/

function setRealTimeSynSportData(enable, callBack){
  var connected = hasConnectDevice(callBack)
  if (!connected) {
    return
  }
  var keyValue = 0x00;
  if (enable) {
    keyValue = 0x01;
  }
  var valueBuffer = new Uint8Array(1)
  valueBuffer[0] = keyValue
  var buffer = valueBuffer.buffer

  var cmd = cmdPreDef.ZH_RealTek_CMD_ID.RealTek_CMD_SportData
  var key = cmdPreDef.ZH_RealTek_Sport_Key.RealTek_Key_Set_SportData_Syc_OnOff
  var seqId = getSeqIDWithCommand(cmd, key)
  var keyValueLength = 1;
  var packet = getL0PacketWithCommandId(cmd, key, buffer, keyValueLength, false, false, seqId)
  sendDataToBandDevice({
    data: packet,
    ackBool: false,
    callBack: callBack
  })

}

/*
* 请求一次心率数据
*/
function setHRReadOneTimeEnable(enable, callBack){
  var connected = hasConnectDevice(callBack)
  if (!connected) {
    return
  }
  var keyValue =enable ? 1:0;
  
  var valueBuffer = new Uint8Array(1)
  valueBuffer[0] = keyValue
  var buffer = valueBuffer.buffer

  var cmd = cmdPreDef.ZH_RealTek_CMD_ID.RealTek_CMD_SportData
  var key = cmdPreDef.ZH_RealTek_Sport_Key.RealTek_Key_HR_OneTime
  var seqId = getSeqIDWithCommand(cmd, key)
  var keyValueLength = 1;
  var packet = getL0PacketWithCommandId(cmd, key, buffer, keyValueLength, false, false, seqId)
  sendDataToBandDevice({
    data: packet,
    ackBool: false,
    callBack: callBack
  })

}

/*
* 设置连续测量心率数据（每隔一段时间）
*/

function setHRReadContinuous(enable,minutes,callBack){
  var connected = hasConnectDevice(callBack)
  if (!connected) {
    return
  }
  var keyValue = enable ? 1 : 0;

  var valueBuffer = new Uint8Array(2)
  valueBuffer[0] = keyValue
  valueBuffer[1] = minutes
  var buffer = valueBuffer.buffer

  var cmd = cmdPreDef.ZH_RealTek_CMD_ID.RealTek_CMD_SportData
  var key = cmdPreDef.ZH_RealTek_Sport_Key.RealTek_Key_HR_Continuous
  var seqId = getSeqIDWithCommand(cmd, key)
  var keyValueLength = 2;
  var packet = getL0PacketWithCommandId(cmd, key, buffer, keyValueLength, false, false, seqId)
  sendDataToBandDevice({
    data: packet,
    ackBool: false,
    callBack: callBack
  })


}

/*
* 获取连续测量心率数据是否开启
*/

function getHRReadContinuousSettingOnFinished(callBack){
  var connected = hasConnectDevice(callBack)
  if (!connected) {
    return
  }
  var cmd = cmdPreDef.ZH_RealTek_CMD_ID.RealTek_CMD_SportData
  var key = cmdPreDef.ZH_RealTek_Sport_Key.RealTek_Key_HR_GetContinuousSet
  var seqId = getSeqIDWithCommand(cmd, key)
  var keyValueLength = 0;
  var packet = getL0PacketWithCommandId(cmd, key, null, keyValueLength, false, false, seqId)
  sendDataToBandDevice({
    data: packet,
    ackBool: false,
    callBack: callBack
  })

}

/*
* 同步当天总步数
*/

function synTodayTotalSportDataWithStep(totalSteps, totalDistance, totalCalory, callBack){
  var connected = hasConnectDevice(callBack)
  if (!connected) {
    return
  }
  var info = "Calibration total sport data. totalSteps:" + totalSteps + " totalCalory:" + totalCalory + " totalDistance:" + totalDistance 
  common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Info)
  var buffer = new ArrayBuffer(12)
  var stepView = new DataView(buffer, 0, 4)
  var distanceView = new DataView(buffer, 4, 4)
  var caloryView = new DataView(buffer, 8, 4)

  caloryView.setUint32(0, totalCalory, false)
  stepView.setUint32(0, totalSteps, false)
  distanceView.setUint32(0, totalDistance, false)

  var cmd = cmdPreDef.ZH_RealTek_CMD_ID.RealTek_CMD_SportData
  var key = cmdPreDef.ZH_RealTek_Sport_Key.RealTek_Key_Today_SportStatus_Syc
  var seqId = getSeqIDWithCommand(cmd, key)
  var keyValueLength = 12;
  var packet = getL0PacketWithCommandId(cmd, key, buffer, keyValueLength, false, false, seqId)
  sendDataToBandDevice({
    data: packet,
    ackBool: false,
    callBack: callBack
  })

}

/*
* 同步某个15分钟内的运动数据
*/
function synRecentSportDataWithStep(steps, activeTime, calory, distance, offset, mode, callBack) {
  var connected = hasConnectDevice(callBack)
  if (!connected) {
    return
  }

  var info = "Calibration recent sport data. steps:" + steps + " calory:" + calory + " distance:" + distance + " offset:" + offset
  common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Info)

  var buffer = new ArrayBuffer(10)
  var modeView = new DataView(buffer,0,1)
  var activeTimeView = new DataView(buffer,1,1)
  var caloryView = new DataView(buffer,2,4)
  var stepView = new DataView(buffer,6,2)
  var distanceView = new DataView(buffer,8,2)

  modeView.setUint8(0,mode)
  activeTimeView.setUint8(0,activeTime)
  caloryView.setUint32(0,calory,false)
  stepView.setUint16(0,steps,false)
  distanceView.setUint16(0,distance,false)

  var cmd = cmdPreDef.ZH_RealTek_CMD_ID.RealTek_CMD_SportData
  var key = cmdPreDef.ZH_RealTek_Sport_Key.RealTek_Key_Last_SportStatus_Syn
  var seqId = getSeqIDWithCommand(cmd, key)
  var keyValueLength = 10;
  var packet = getL0PacketWithCommandId(cmd, key, buffer, keyValueLength, false, false, seqId)
  sendDataToBandDevice({
    data: packet,
    ackBool: false,
    callBack: callBack
  })


}

/*
* 血压测量使能
*/
function setBloodPressueEnable(enable,callBack){
  var connected = hasConnectDevice(callBack)
  if (!connected) {
    return
  }

  var keyValue = enable ? 1 : 0;

  var valueBuffer = new Uint8Array(1)
  valueBuffer[0] = keyValue
  var buffer = valueBuffer.buffer

  var cmd = cmdPreDef.ZH_RealTek_CMD_ID.RealTek_CMD_SportData
  var key = cmdPreDef.ZH_RealTek_Sport_Key.RealTek_Key_BP_Req
  var seqId = getSeqIDWithCommand(cmd, key)
  var keyValueLength = 1;
  var packet = getL0PacketWithCommandId(cmd, key, buffer, keyValueLength, false, false, seqId)
  sendDataToBandDevice({
    data: packet,
    ackBool: false,
    callBack: callBack
  })

}

/*
* Modify device name
*/

function modifyDeviceName(name,callBack){
  var connected = hasConnectDevice(callBack)
  if (!connected) {
    return
  }
  if (deviceNameCharObj) {
    var buffer = getBufferWithString(name)

    writeBLECharacteristicValue({
      deviceId: connectedDeviceId,
      serviceId: preDefService.RealTek_ServiceUUIDs.RealTek_BroadServiceUUID,
      characteristicId: deviceNameCharObj.uuid,
      value: buffer,
      success: function (res) {
        if (callBack) {
          callBack(connectedDevice, null, null)
        }

      },
      fail: function (res) {
        if (callBack) {
          var error = getWechatCustomError(res);
          callBack(connectedDevice, error, null)
        }

      }

    })
  } else {
    if (callBack) {
      var error = getCharacteristicNotFindError()
      callBack(connectedDevice, error, null)
    }
  }

}

/*
* 获取设备名称
*/
function getDeviceNameonFinished(callBack){
  var connected = hasConnectDevice(callBack)
  if (!connected) {
    return
  }

  if (deviceNameCharObj) {
    readBLECharacteristicValue({
      deviceId: connectedDeviceId,
      serviceId: preDefService.RealTek_ServiceUUIDs.RealTek_BroadServiceUUID,
      characteristicId: deviceNameCharObj.uuid,
      success: function (res) {
        deviceNameHaveReadBlock = callBack

      },
      fail: function (res) {
        if (callBack) {
          var error = getWechatCustomError(res);
          callBack(connectedDevice, error, null)
        }

      }

    })
  } else {
    if (callBack) {
      var error = getCharacteristicNotFindError()
      callBack(connectedDevice, error, null)
    }
  }
}


/*
* 获取电量
*/

function getBatteryLevelonFinished(callBack){
  var connected = hasConnectDevice(callBack)
  if (!connected) {
    return
  }

  if(batterylevelCharObj){
    readBLECharacteristicValue({
      deviceId: connectedDeviceId,
      serviceId: batteryServiceObj.uuid,
      characteristicId: batterylevelCharObj.uuid,
      success: function (res) {
        batteryValueHaveReadBlock = callBack

      },
      fail: function (res) {
        if (callBack) {
          var error = getWechatCustomError(res);
          callBack(connectedDevice, error, null)
        }

      }

    })

  } else {
    if (callBack) {
      var error = getCharacteristicNotFindError()
      callBack(connectedDevice, error, null)
    }
  }

}


/*
* 获取固件App version
*/
function getOTAApplicationVersiononFinished(callBack){
  var connected = hasConnectDevice(callBack)
  if (!connected) {
    return
  }
  if(OTAappVersion > 0){
    if (callBack){
      callBack(connectedDevice,null,OTAappVersion)
    }
    return
  }
  if(OTAAppVersionCharObj){
    readBLECharacteristicValue({
      deviceId: connectedDeviceId,
      serviceId: preDefService.RealTek_ServiceUUIDs.RealTek_OTAInfo_ServiceUUID,
      characteristicId: OTAAppVersionCharObj.uuid,
      success: function (res) {
        otaAppVersionHaveReadBlock = callBack
      },
      fail: function (res) {
        if (callBack) {
          var error = getWechatCustomError(res);
          callBack(connectedDevice, error, null)
        }
      }

    })


  }else{
    if (callBack) {
      var error = getCharacteristicNotFindError()
      callBack(connectedDevice, error, null)
    }
  }
}

/*
* 获取固件Patch version
*/

function getOTAPatchVersiononFinished(callBack) {
  var connected = hasConnectDevice(callBack)
  if (!connected) {
    return
  }
  if (OTApatchVersion > 0) {
    if (callBack) {
      callBack(connectedDevice, null, OTApatchVersion)
    }
    return
  }

  if (OTAAppVersionCharObj) {
    readBLECharacteristicValue({
      deviceId: connectedDeviceId,
      serviceId: preDefService.RealTek_ServiceUUIDs.RealTek_OTAInfo_ServiceUUID,
      characteristicId: OTAPatchVersioCharObj.uuid,
      success: function (res) {
        otaPatchVersionHaveReadBlock = callBack

      },
      fail: function (res) {
        if (callBack) {
          var error = getWechatCustomError(res);
          callBack(connectedDevice, error, null)
        }

      }

    })


  } else {
    if (callBack) {
      var error = getCharacteristicNotFindError()
      callBack(connectedDevice, error, null)
    }
  }
}

/*
* 获取mac 地址
*/

function getMacAddressonFinished(callBack){
  var connected = hasConnectDevice(callBack)
  if (!connected) {
    return
  }
  if (macAddress) {
    if (callBack) {
      callBack(connectedDevice, null, macAddress)
    }
    return
  }
  if (macAddressCharObj) {
    readBLECharacteristicValue({
      deviceId: connectedDeviceId,
      serviceId: preDefService.RealTek_ServiceUUIDs.RealTek_OTAInfo_ServiceUUID,
      characteristicId: macAddressCharObj.uuid,
      success: function (res) {
        macAddressHaveReadBlock = callBack

      },
      fail: function (res) {
        if (callBack) {
          var error = getWechatCustomError(res);
          callBack(connectedDevice, error, null)
        }

      }

    })
  } else {
    if (callBack) {
      var error = getCharacteristicNotFindError()
      callBack(connectedDevice, error, null)
    }
  }
}



/*
* Send Data to Device
*/

function sendDataToBandDevice(obj){
  console.log("call sendDataToBandDevice")
  if(writeCharObj){
    var data = obj.data
    var ackBool = obj.ackBool
    var callBack = obj.callBack

    var deviceUUID = connectedDeviceId
    var serviceUUID = preDefService.RealTek_ServiceUUIDs.RealTek_BroadServiceUUID
    var writeCharUUID = writeCharObj.uuid
    if(!ackBool && callBack){
      
      var key = getCommandIDAndKeyWithPacketData(data) //获取command and key 组合数字作为回调函数的key
      var keyInfo = "Save Block key is: " + key
      common.printDebugInfo(keyInfo, common.ZH_Log_Level.ZH_Log_Info)
      characteristicValueWrtieBlocks[key] = callBack
    }
    if (ackBool){
      common.printLogWithBuffer(data, "Send ack ")
    }else {
      common.printLogWithBuffer(data, "Send Packet ")
    }
    if(!callBack){
      common.printDebugInfo("Call back is null")
    }
    
    writeBLECharacteristicValue({
      deviceId: connectedDeviceId,
      serviceId: serviceUUID,
      characteristicId: writeCharUUID,
      value: data,
      success: function(res) {
        if(callBack){
          if(ackBool){
            callBack(connectedDevice,null,null)
          }
        }
      },
      fail: function(res) {
        if(callBack){
          var error = getWechatCustomError(res)
          if(ackBool){
            var info = "Write Ack Packet error: " + res.errMsg
            common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Error)
            callBack(connectedDevice,error,null)

          }else{
            var info = "Write Command Packet error: " + res.errMsg
            common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Error)
            callBack(connectedDevice,error,null)
          }
        }
      },
      complete: function(res) {},
    })

  }
}



/* 
* 根据接收到的数据获取发送命令时的SeqID
*/
function getCommandIDAndKeyWithPacketData(data){
  var uint8View = new Uint8Array(data)
  if (uint8View.length > 10){
    var cmd = uint8View[8]
    var key = uint8View[10]
    var preInfo = "replace before cmd:" + cmd + "---key:" + key
    common.printDebugInfo(preInfo, common.ZH_Log_Level.ZH_Log_Info)

    key = replaceReskey(key,cmd)
    var lastInfo = "replace end cmd:" + cmd + "---key:" + key
    common.printDebugInfo(lastInfo, common.ZH_Log_Level.ZH_Log_Info)

    var result = (cmd << 8) + key

    return result

  }
}

/*
* 根据cmd 和 key 看是否需要替换key
*/
function replaceReskey(key,cmd){
  var CMD_IDs = cmdPreDef.ZH_RealTek_CMD_ID
  if (cmd == CMD_IDs.RealTek_CMD_Setting){
    var Setting_Keys = cmdPreDef.ZH_RealTek_Setting_Key
    switch (key){
      case Setting_Keys.RealTek_Key_Get_TurnLight_Rep:
        return Setting_Keys.RealTek_Key_Get_TurnLight_Req
      case Setting_Keys.RealTek_Key_Get_ALarmList_Rep:
        return Setting_Keys.RealTek_Key_Get_AlarmList_Req
      case Setting_Keys.RealTek_Key_Get_Sit_Long_Rep:
        return Setting_Keys.RealTek_Key_Get_Sit_Long_Req
      case Setting_Keys.RealTek_Key_Get_ScreenOrientationRep:
        return Setting_Keys.RealTek_Key_Get_ScreenOrientationReq
      case Setting_Keys.RealTek_Key_Get_FunctionsRep:
        return Setting_Keys.RealTek_Key_Get_FunctionsReq

    }
  } else if (cmd == CMD_IDs.RealTek_CMD_Bind){
    var Bind_Keys = cmdPreDef.ZH_RealTek_Bind_Key
    switch(key){
      case Bind_Keys.RealTek_Key_Bind_Rep:
        return Bind_Keys.RealTek_Key_Bind_Req
      case Bind_Keys.RealTek_Key_Login_Rep:
        return Bind_Keys.RealTek_Key_Login_Req
    }
  } else if (cmd == CMD_IDs.RealTek_CMD_SportData){
    var SportData_Keys = cmdPreDef.ZH_RealTek_Sport_Key
    switch(key){
      case SportData_Keys.RealTek_Key_His_SportData_Syc_End:
        return SportData_Keys.RealTek_Key_Sport_Req
      case SportData_Keys.RealTek_Key_HR_GetContinuousSet_Rep:
        return SportData_Keys.RealTek_Key_HR_GetContinuousSet
    }
  } else if (cmd == CMD_IDs.RealTek_CMD_Control){


  }

  return key
}

/*
* 当命令发送成功后手环端发送ACK后，根据此函数判断是否立即回调相应
*/
function haveResDataWithCmd(cmd,key){
  var CMD_IDs = cmdPreDef.ZH_RealTek_CMD_ID
  if (cmd == CMD_IDs.RealTek_CMD_Setting){
    var Setting_Keys = cmdPreDef.ZH_RealTek_Setting_Key
    switch(key){
      case Setting_Keys.RealTek_Key_Set_Time:
        return true
      case Setting_Keys.RealTek_Key_Set_Alarm:
        return true
      case Setting_Keys.RealTek_Key_Set_StepTarget:
        return true
      case Setting_Keys.RealTek_Key_Set_UserProfile:
        return true
      case Setting_Keys.RealTek_Key_Set_Sit_Long_OnOff:
        return true
      case Setting_Keys.RealTek_Key_Set_PhoneOS:
        return true
      case Setting_Keys.RealTek_Key_Set_TurnLight_OnOff:
       return true
      case Setting_Keys.RealTek_Key_Set_IncomingTel_OnOff:
       return true
      case Setting_Keys.RealTek_Key_Set_ScreenOrientation:
       return true
      

    }
  } else if (cmd == CMD_IDs.RealTek_CMD_FactoryTest){
    var Factory_Keys = cmdPreDef.ZH_RealTek_FacTest_Key
    switch(key){
      case Factory_Keys.ZH_RealTek_FacTest_Key:
        return true
    }
  } else if (cmd == CMD_IDs.RealTek_CMD_SportData){
    var SportData_Keys = cmdPreDef.ZH_RealTek_Sport_Key
    switch(key){
      case SportData_Keys.RealTek_Key_Set_SportData_Syc_OnOff:
        return true
      case SportData_Keys.RealTek_Key_HR_OneTime:
        return true
      case SportData_Keys.RealTek_Key_HR_Continuous:
        return true
      case SportData_Keys.RealTek_Key_Today_SportStatus_Syc:
        return true
      case SportData_Keys.RealTek_Key_Last_SportStatus_Syn:
        return true
      case SportData_Keys.RealTek_Key_BP_Req:
        return true
    }
  } else if (cmd == CMD_IDs.RealTek_CMD_Control){
    var Control_Keys = cmdPreDef.ZH_RealTek_Control_Key
    switch(key){
      case Control_Keys.RealTek_Key_Control_Camera_Status_Req:
        return true
    }
  } else if (cmd == CMD_IDs.RealTek_CMD_Bind){
    var Bind_Keys = cmdPreDef.ZH_RealTek_Bind_Key
    switch(key){
      case Bind_Keys.RealTek_Key_UnBind:
       return true
    }
  } else if (cmd == CMD_IDs.RealTek_CMD_Remind){
    var Remind_Keys = cmdPreDef.ZH_RealTek_Remind_Key
    switch(key){
      case Remind_Keys.RealTek_Key_Universal_Message:
        return true
    }
  }

}

/* -- AES Method -- */
function aesInit(mode){
  var key = secret_key



}

/* --- 升级模块 ---- */

// 获取后台数据
function judgeRealTekOTAVersion(appKey, appSecret, fwType, serial, fwVersion, userId,callBack){
  var serverUrl = iMCOServerHost+'/api/v'+iMCOServerInterfaceVersion+'/checkin'
  if(!appKey){
    common.printDebugInfo("AppKey can not is nil", common.ZH_Log_Level.ZH_Log_Info)
    return;
  }
  if(!appSecret){
    common.printDebugInfo("AppSecret can not is nil", common.ZH_Log_Level.ZH_Log_Info)
    return;
  }
  var temfwVersion = "" + fwVersion 
  var data = new Object()
  data.fwType = fwType
  data.serial = serial
  data.fwVersion = temfwVersion
  if(userId){
    data.userId = userId
  }
  var postBody = JSON.stringify(data)
  console.log("postBody:",postBody)
  
  var date = new Date()
  var timeInterval = Date.parse(date)
  var radom = Math.floor(Math.random()*1000000 + 1)
  var nonce = radom
  var message = appKey + timeInterval + nonce
  var sign = SHAHMAC.b64_hmac_sha1(appSecret,message)
  var appOS = "SmallWeChat"
  var appVersion = "1.0"

  var header = new Object()
  header.Timestamp = timeInterval
  header.Nonce = nonce
  header.AppKey = appKey
  header.Sign = sign
  header.AppOS = appOS
  header.AppVersion = appVersion
 
  
  

  var info = "fmVersion:"+fwVersion + "--Secret:" + appSecret + "---Message:" + message + "---result:" + sign
  console.log(info)


  wx.request({
    url: serverUrl,
    data: postBody,
    method: 'POST',
    header: header,
    dataType: "json",
    success: function(res){
      console.log("checkOTA Success Res:",JSON.stringify(res))
      if(callBack){
        callBack(connectedDevice,null,res.data)
      }

    },
    fail: function(res){
      console.log("checkOTA fail Res:", JSON.stringify(res))
      var error = getWechatCustomError(res)
      if(callBack){
        callBack(connectedDevice,error,null)
      }

    }

  })

}


// OTA App Check

function checkOTAApplicationHaveNewWithFwType(fwType, serial, userId,callBack){
  getOTAApplicationVersiononFinished(function(device,error, result){
    if(error || !result){
      if(callBack){
        callBack(connectedDevice,error,null)
      }
    }else{
      var fwVersion = result
      judgeRealTekOTAVersion(AppKey,AppSecret,fwType,serial,fwVersion,userId,callBack)
    }
  })
}

//OTA Patch Check

function checkOTAPatchHaveNewWithFwType(fwType, serial, userId, callBack){
  getOTAPatchVersiononFinished(function(device,error,result){
    if(error || !result){
      if(callBack){
        callBack(connectedDevice,error,null)
      }

    }else{
      var patchVersion = result
      judgeRealTekOTAVersion(AppKey,AppSecret,fwType,serial,patchVersion,userId,callBack)
    }
  })
}


// 检测固件是否有更新包含 OTA APP 和 Patch 两部分

function checkFirmWareHaveNewVersionWithUserId(userID,callBack){
  var fwType = 'app'
  var serial = null
  var that = this
  var isNewVersion = preModel.ZH_RealTek_CheckFirmWareUpdate_Code.ZH_RealTek_FirmWare_isNewVersion
  var hasNewVersion = preModel.ZH_RealTek_CheckFirmWareUpdate_Code.ZH_Realtek_FirmWare_HaveNewVersion
  var noNewVersion = preModel.ZH_RealTek_CheckFirmWareUpdate_Code.ZH_RealTek_CheckInNoNewVersion

  getMacAddressonFinished(function(device,error,result){
    if(error || !result){
      if(callBack){
        callBack(device,error,isNewVersion)
      }
    }else{
      serial = result
      checkOTAApplicationHaveNewWithFwType(fwType,serial,userID,function(device,error,result){
        if(error || !result){
          if(callBack){
            callBack(device,error,isNewVersion)
          }
        }else{
          if(result){
            var code = result.code
            if (code == hasNewVersion){
              this.getNewFirmWareInfo(result)
              if(callBack){
                callBack(device,error,code)
              }
              return

            } else if (code == noNewVersion) { //无新版本check patch
              fwType = 'patch'
              checkOTAPatchHaveNewWithFwType(fwType,serial,userID,function(device,error,result){
                if(error || !result){
                  if (callBack) {
                    callBack(device, error, isNewVersion)
                  }

                }else{
                  if(result){
                    var code = result.code
                    if (code == hasNewVersion) {
                      this.getNewFirmWareInfo(result)
                      if (callBack) {
                        callBack(device, error, code)
                      }
                      return

                    } else {
                      if (callBack) {
                        callBack(device, error, isNewVersion)
                      }
                    }

                  }else{
                    if (callBack) {
                      callBack(device, error, isNewVersion)
                    }

                  }

                }
              })
            }else{
              var info = "UpdateFirmWare Server Code:" + code
              common.printDebugInfo(info, common.ZH_Log_Level.ZH_Log_Error)
              if(callBack){
                callBack(connectedDevice,error,isNewVersion)
              }
            }

          }else{
            var haveNewVersion = isNewVersion
            callBack(device, error, haveNewVersion)
          }

        }
      })
    }
  })
}

function getNewFirmWareInfo(obj){
  var payLoad = obj.payload
  if(payLoad){
    updateFirmWareAddress = payLoad.resourceUrl
    firmWareMD5 = payLoad.md5sum
    firmWareSha1Sum = payLoad.sha1sum
    firmWareSha256Sum = payLoad.sha256sum
    firmWareType = payLoad.fwType
  }
}

/* --- Begin Update Firmware --- */

function updateFirmWareFaild (){
  isUpdatefailed = true
}

function resetUpdateFirmWareStatus (){
  isUpdatefailed = false
}

//Step 1 Check power level,must more than 40

function updateFirmwareonFinished(progress){
  updateFirmWareProgress = progress
  resetUpdateFirmWareStatus()
  var updateFail = preModel.ZH_RealTek_FirmWare_Update_Status.RealTek_FirmWare_Loading_OTA
  var OTAMODES = preModel.ZH_RealTek_UpdateMode
  if(progress){
    progress(connectedDevice, null, updateFail,0)
  }
  getBatteryLevelonFinished(function(device,error,result){
    if(error){
      if (progress) {
        progress(connectedDevice, null, updateFail, 0)
      }
    }else{
      if(result){
        if (result >= 40) {// 可以升级
          if (OTAMode == OTAMODES.ZH_RealTek_OTAUpMode_Internal){//内部flash需要先进入OTA模式然后重连             

          } else {//外部flash模式直接升级

          }
        }else{
          var subError = getBatteryLevelError()
          if (progress) {
            progress(connectedDevice, subError, updateFail, 0)
          }

        }

      }else{
        if (progress) {
          progress(connectedDevice, null, updateFail, 0)
        }
      }
    }
  })

}

//- Step 6 Check DFU Service

function checkDFUService(){
  if(!SendDataDFUChar || !ControlCmdDFUChar){
    if(updateFirmWareProgress){
      var error = getCharacteristicNotFindError()
      updateFirmWareProgress(connectedDevice, error, preModel.ZH_RealTek_FirmWare_Update_Status.RealTek_FirmWare_Update_Failed,0)
    }
  }else{


  }
}


//Step 7 Send Data

function startLoadFirmWareData(url){
  const downLoadTask = wx.downloadFile({
    url:url,
    success:function(res){
      var filePath = res.tempFilePath
     

    },
    fail:function(res){

    }
  })

  downloadTask.onProgressUpdate((res) => {
    console.log('下载进度', res.progress)
    console.log('已经下载的数据长度', res.totalBytesWritten)
    console.log('预期需要下载的数据总长度', res.totalBytesExpectedToWrite)
  })



}

function loadRealTekOTADataWithUrl(url,callBack){

}



// 对外可见模块
module.exports = {
  getConnectedDevice: getConnectedDevice,
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
  connectPeripheral: connectPeripheral,
  cancelPeripheralConnection: cancelPeripheralConnection,
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
  getL2Payload: getL2Payload,
  bindDeviceWithIdentifier: bindDeviceWithIdentifier,
  unBindDeviceonFinished: unBindDeviceonFinished,
  loginDeviceWithIdentifier: loginDeviceWithIdentifier,
  findMyBandDeviceonFinished: findMyBandDeviceonFinished,
  bleConnectionStateChange: bleConnectionStateChange,
  bluetoothAdapterStateChange: bluetoothAdapterStateChange,
  synAlarms: synAlarms,
  getBandAlarmsonFinished: getBandAlarmsonFinished,
  synTimeonFinished: synTimeonFinished,
  setStepTarget: setStepTarget,
  setUserProfileWithGender: setUserProfileWithGender,
  setLongSitRemind: setLongSitRemind,
  getLongSitRemindonFinished: getLongSitRemindonFinished,
  setMoblieOS: setMoblieOS,
  setCameraMode: setCameraMode,
  getTurnWristLightEnabledOnFinished: getTurnWristLightEnabledOnFinished,
  setTurnWristLightEnabled: setTurnWristLightEnabled,
  getDisplayOrientation: getDisplayOrientation,
  getDeviceFunstions: getDeviceFunstions,
  setEnableCallNotificationEnabled: setEnableCallNotificationEnabled,
  setEnableQQNotificationEnabled: setEnableQQNotificationEnabled,
  setEnableWechatNotificationEnabled: setEnableWechatNotificationEnabled,
  setEnableSMSNotificationEnabled: setEnableSMSNotificationEnabled,
  setEnableLineNotificationEnabled: setEnableLineNotificationEnabled,
  SetDisplayOrientation: SetDisplayOrientation,
  synHisDataOnFinished: synHisDataOnFinished,
  setRealTimeSynSportData, setRealTimeSynSportData,
  setHRReadOneTimeEnable: setHRReadOneTimeEnable,
  getHRReadContinuousSettingOnFinished: getHRReadContinuousSettingOnFinished,
  setHRReadContinuous: setHRReadContinuous,
  synRecentSportDataWithStep: synRecentSportDataWithStep,
  synTodayTotalSportDataWithStep: synTodayTotalSportDataWithStep,
  setBloodPressueEnable: setBloodPressueEnable,
  modifyDeviceName: modifyDeviceName,
  getDeviceNameonFinished: getDeviceNameonFinished,
  getBatteryLevelonFinished: getBatteryLevelonFinished,
  getOTAPatchVersiononFinished: getOTAPatchVersiononFinished,
  getOTAApplicationVersiononFinished: getOTAApplicationVersiononFinished,
  getMacAddressonFinished: getMacAddressonFinished,
  checkFirmWareHaveNewVersionWithUserId: checkFirmWareHaveNewVersionWithUserId


}