let DF_RealTek_Date_Cut_Year = 2000 //年份默认以2000年开始计算所以传输需要减去2000

let CALLBACK = function(device, error, result){

}

/* - 自定义错误码 - */
let ZH_RealTek_Error_Code = {
  ZHCharactiristicNotFindCode: 100001,
  ZHDisConnectedErrorCode: 100002,
  ZHBatteryErrorCode: 100003,
  ZHMacAddressErrorCode: 100004,
  ZHUpdateFirmWareFaild: 100005,
  ZHBindErrorCode: 100006,
  ZHTimeOutErrorCode: 100007,
  ZHFirmWareUrlIsEmptyErrorCode: 100008
}

/* - 腾讯蓝牙接口错误码 - */
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


let ZH_RealTek_CheckFirmWareUpdate_Code = {
  ZH_Realtek_FirmWare_HaveNewVersion: 0,
  ZH_RealTek_FirmWare_isNewVersion: 1
}

let ZH_RealTek_Login_Status = {
  RealTek_Login_Success: 0, //Login success indicates that it is already bound.
  RealTek_Login_TimeOut: 1 //The user ID is inconsistent and the login fails.
}

/**
 Bind status

 - RealTek_Bind_Success: bind success
 @discussion The same user cannot be bound multiple times.
 */
let ZH_RealTek_Bind_Status = {
  RealTek_Bind_Success: 0, //Binding succeeded.
  RealTek_Bind_Faild: 1 //Operation Timeout failed.
}

/**
 The type of unsolicited message.

 - RealTek_Message_Ordering: Order message
 */
let ZH_RealTek_UniVersal_MessageType = {
  RealTek_Message_Ordering: 1, //Ordering.
  RealTek_Message_ShutDownPower: 0xff, //Shut down power
  RealTek_Message_Reboot: 0xfe //reboot
}

let ZH_RealTek_Day = {
  ZH_RealTek_None: 0x00,
  ZH_RealTek_Monday: 0x01,
  ZH_RealTek_Tuesday: 0x02,
  ZH_RealTek_Wednessday: 0x04,
  ZH_RealTek_Thursday: 0x08,
  ZH_RealTek_Friday: 0x10,
  ZH_RealTek_Saturday: 0x20,
  ZH_RealTek_Sunday: 0x40
}

/**
 Gender

 - ZH_RealTek_Male: Male
 - ZH_RealTek_Female: Female
 */
let ZH_RealTek_Gender = {
  ZH_RealTek_Male: 0,
  ZH_RealTek_Female: 1
}

/**
 Alert Level

 - ZH_RealTek_NoAlertLevel: No Alert
 - ZH_RealTek_AlertLevel_Middle:middle alert level
 - ZH_RealTek_AlertLevel_High: high alert level
 */
let ZH_RealTek_AlertLevel = {
  ZH_RealTek_NoAlertLevel: 0,
  ZH_RealTek_AlertLevel_Middle: 1,
  ZH_RealTek_AlertLevel_High: 2
}

/*
 Set up the mobile OS

 - ZH_RealTek_OS_iOS: iOS
 - ZH_RealTek_OS_Android: Android
 */

let ZH_RealTek_OS = {
  ZH_RealTek_OS_iOS: 0,
  ZH_RealTek_OS_Android: 1
}

/*
 Sport mode.

 - ZH_RealTek_Stationary: Stationary
 - ZH_RealTek_Walk: Walk
 - ZH_RealTek_Run: Run
 */
let ZH_RealTek_Sport_Mode = {
  ZH_RealTek_Stationary: 0,
  ZH_RealTek_Walk: 1,
  ZH_RealTek_Run: 2
}

/*
 Sleep mode

 - ZH_RealTek_Awake: awake
 - ZH_RealTek_DeepSleep: deep sleep
 - ZH_RealTek_LightSleep: light sleep
 */
let ZH_RealTek_Sleep_Mode = {
  ZH_RealTek_Awake: 3,
  ZH_RealTek_DeepSleep: 1,
  ZH_RealTek_LightSleep: 2
}

let ZH_RealTek_ScreenOrientation = {
  ZH_Orientation_Landscape: 0,
  ZH_Orientation_Portrait: 1
}


function initError(code,errMsg){
  var error = new Object()
  error.code = code
  error.errMsg = errMsg
  return error
}

function initDevice(){
  var device = new Object()
  device.name = null
  device.deviceId = null
  device.rssi = null
  device.connected = false
  device.bound = false
  device.hasGetFuncVlaue = false
  device.hasHRMFunc = true
  device.hasStepFunc = true
  device.hasSleepFunc = true
  device.hasBloodPressureFunc = false
  device.hasOrientationSwitchFunc = false
  device.macAddress = null
  return device
}

function initAlarm(){
  var alarm = new Object()
  var date = new Date()
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDay()
  var hour = date.getHours()
  var minute = date.getMinutes

  alarm.year = year - DF_RealTek_Date_Cut_Year
  alarm.month = month
  alarm.day = day
  alarm.hour = hour
  alarm.minute = minute
  alarm.index = 0 //The serial number of the alarm clock. Range(0~7)
  alarm.dayFlags = 0 //see ZH_RealTek_Day.If have more than one day。ZH_RealTek_Monday | ZH_RealTek_Tuesday. default is ZH_RealTek_None
  return alarm
}

function initLongSit(){
  var longSit = new Object()
  longSit.enable = false  // On or off,default is No
  longSit.minStepNum = 10  //In a sedentary time, the number of steps below this threshold is only a reminder. default is 10
  longSit.sitTime = 60   // (Unit minutes) default is 60
  longSit.beginTime = 9  // begin time （0~24） default is 9.
  longSit.endTime = 18  // end time (0~24) default is 18
  longSit.dayFlags = 0 //see ZH_RealTek_Day.If have more than one day。ZH_RealTek_Monday | ZH_RealTek_Tuesday.default is ZH_RealTek_None

  return longSit
}

function initSportItem(){
  var sportItem = new Object()
  sportItem.date = null ////The date of sport. （format：yyyy-MM-dd,2015-06-07)
  sportItem.dayOffset = 0 //The offset of the day. From 0 o'clock each day, the 15-minute offset plus 1.
  sportItem.mode = 1 // The sport mode.
  sportItem.stepCount = 0 // step count. (unit: step)
  sportItem.activeTime = 0 // The activity time.
  sportItem.calories = 0 //Calories consumed. (unit: cal）
  sportItem.distance = 0 // Movement distance. (unit: m)

  return sportItem
}


function initSleepItem(){
  var sleepItem = new Object()
  sleepItem.startTime = null // The start time. （format：yyyy-MM-dd-HH-mm,2015-06-07-08-03)
  sleepItem.endTime = null  // The end time. （format：yyyy-MM-dd-HH-mm,2015-06-07-08-04)
  sleepItem.mode = 0 // The pre item sleep mode.
  sleepItem.lastMode = 0 //The last item sleep mode.
  return sleepItem

}

function initHRItem(){
  var hrItem = new Object()
  hrItem.time = null // The time. （format：yyyy-MM-dd-HH-mm-ss,2015-06-07-08-03-09)
  hrItem.heartRate = 0 //Heart Rete.
  return hrItem
}

function initBPItem(){
  var bpItem = new Object()
  bpItem.time = null
  bpItem.highPressure = 0
  bpItem.lowPressure = 0
  bpItem.heartRate = 0
  return bpItem
}

function initSportCalibrationItem(){
  var item = new Object()
  item.offset = 0
  item.totalSteps = 0
  item.totalCalory = 0
  item.totalDistance = 0
}


module.exports = {
  DF_RealTek_Date_Cut_Year: DF_RealTek_Date_Cut_Year,
  ZH_RealTek_Error_Code: ZH_RealTek_Error_Code,
  BlueToolthErrorCode: BlueToolthErrorCode,
  ZH_RealTek_CheckFirmWareUpdate_Code: ZH_RealTek_CheckFirmWareUpdate_Code,
  ZH_RealTek_Login_Status: ZH_RealTek_Login_Status,
  ZH_RealTek_Bind_Status: ZH_RealTek_Bind_Status,
  ZH_RealTek_UniVersal_MessageType: ZH_RealTek_UniVersal_MessageType,
  ZH_RealTek_Day: ZH_RealTek_Day,
  ZH_RealTek_Gender: ZH_RealTek_Gender,
  ZH_RealTek_AlertLevel: ZH_RealTek_AlertLevel,
  ZH_RealTek_OS: ZH_RealTek_OS,
  ZH_RealTek_Sport_Mode: ZH_RealTek_Sport_Mode,
  ZH_RealTek_Sleep_Mode: ZH_RealTek_Sleep_Mode,
  ZH_RealTek_ScreenOrientation: ZH_RealTek_ScreenOrientation,
  initError: initError,
  initDevice: initDevice,
  initAlarm: initAlarm,
  initLongSit: initLongSit,
  initSportItem: initSportItem,
  initSleepItem: initSleepItem,
  initHRItem: initHRItem,
  initBPItem: initBPItem,
  initSportCalibrationItem: initSportCalibrationItem
}