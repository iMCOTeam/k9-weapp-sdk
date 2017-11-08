const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}



let ZHFunctionCellMode = {
  ZHOnlyTitle: "ZHOnlyTitle",
  ZHTitleAndSwitch: "ZHTitleAndSwitch"

}


let ZHFunctionMode = {
  ZHLogin: "ZHLogin",
  ZHBind: "ZHBind",
  ZHCancelBind: "ZHCancelBind",
  ZHCancelConnect: "ZHCancelConnect",
  ZHSynTime: "ZHSynTime",
  ZHSynAlarm: "ZHSynAlarm",
  ZHGetAlarms: "ZHGetAlarms",
  ZHSetStepTarget: "ZHSetStepTarget",
  ZHSynUserProfile: "ZHSynUserProfile",
  ZHSetlost: "ZHSetlost",
  ZHSetSittingReminder: "ZHSetSittingReminder",
  ZHGetSittingReminder: "ZHGetSittingReminder",
  ZHSetMobileSystem: "ZHSetMobileSystem",
  ZHEnterPhotoMode: "ZHEnterPhotoMode",
  ZHExitPhotoMode: "ZHExitPhotoMode",
  ZHSetRaiseHandLight: "ZHSetRaiseHandLight",
  ZHGetRaiseHandLightSet: "ZHGetRaiseHandLightSet",
  ZHQQReminder: "ZHQQReminder",
  ZHWeChatReminder: "ZHWeChatReminder",
  ZHSMSReminder: "ZHSMSReminder",
  ZHLineReminder: "ZHLineReminder",
  ZHIncomingReminder: "ZHIncomingReminder",
  ZHGetHistoryData: "ZHGetHistoryData",
  ZHGetRealTimeData: "ZHGetRealTimeData",
  ZHSycLastSportData: "ZHSycLastSportData",
  ZHSycTodayAllSportData: "ZHSycTodayAllSportData",
  ZHOnceHR: "ZHOnceHR",
  ZHContinuousHR: "ZHContinuousHR",
  ZHGetContinuousHRSetting: "ZHGetContinuousHRSetting",
  ZHFindBand: "ZHFindBand",
  ZHSetBandName: "ZHSetBandName",
  ZHGetBandName: "ZHGetBandName",
  ZHGetBattery: "ZHGetBattery",
  ZHGetAppVersion: "ZHGetAppVersion",
  ZHGetPatchVersion: "ZHGetPatchVersion",
  ZHGetMacAddress: "ZHGetMacAddress",
  ZHGetSDKVersion: "ZHGetSDKVersion",
  ZHCheckOTAVersion: "ZHCheckOTAVersion",
  ZHUpdateOTA: "ZHUpdateOTA",
  ZHEnterOTAMode: "ZHEnterOTAMode",
  ZHTestUpdateOTA: "ZHTestUpdateOTA",
  ZHTestMultiCmd: "ZHTestMultiCmd",
  ZHTestUser: "ZHTestUser",
  ZHTestLog: "ZHTestLog",
  ZHTestMultiReminder: "ZHTestMultiReminder",
  ZHTestContinuousReminder: "ZHTestContinuousReminder",
  ZHSetScreenOrientation: "ZHSetScreenOrientation",
  ZHGetScreenOrientation: "ZHGetScreenOrientation",
  ZHBloodPressure: "ZHBloodPressure",
  ZHDeviceFunctions: "ZHDeviceFunctions",
  ZHSendUniversalMessage: "ZHSendUniversalMessage"
}


module.exports = {
  formatTime: formatTime,
  ZHFunctionCellMode: ZHFunctionCellMode,
  ZHFunctionMode: ZHFunctionMode

}
