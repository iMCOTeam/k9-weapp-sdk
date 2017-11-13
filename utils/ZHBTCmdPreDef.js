let DF_RealTek_L1_Header = {
  DF_RealTek_L1_Header_Size: 8, //L1 header size
  DF_RealTek_L1_Header_Magic: 0xAB, // L1 header magic
  DF_RealTek_L1_Header_Version: 0x00 // L1 header version
}

let DF_RealTek_L2_Header = {
  DF_RealTek_L2_Header_Size: 2, //L2 Header Size
  DF_RealTek_L2_Header_Version: 0x00, //L2 header + reserve (1byte)
  DF_RealTek_L2_Payload_Key_Size: 1, //L2 Payload key size
  DF_RealTek_L2_Payload_KeyHeader_Size: 2, //L2 Payload Key Header Size
  DF_RealTek_L2_Payload_Header_Size: 3 //DF_RealTek_L2_Payload_Key_Size+DF_RealTek_L2_Payload_KeyHeader_Size
}

let DF_RealTek_Header_Predef = {
  DF_RealTek_Max_BoundIdntifier_Length: 32, //Max length with bind Identifier
  DF_RealTek_Date_Cut_Year: 2000, //年份默认以2000年开始计算所以传输需要减去2000
  DF_RealTek_AlarmValue_Length: 5 //每一个alarm 所占字节

}

let L1_Header_ByteOrder = {
  DF_RealTek_L1_Header_Magic_Pos: 0,
  DF_RealTek_L1_Header_Protocol_Version_Pos: 1,
  DF_RealTek_L1_Header_PayloadLength_HighByte_Pos: 2,
  DF_RealTek_L1_Header_PayloadLength_LowByte_Pos: 3,
  DF_RealTek_L1_Header_CRC16_HighByte_Pos: 4,
  DF_RealTek_L1_Header_CRC16_LowByte_Pos: 5,
  DF_RealTek_L1_Header_SeqID_HighByte_Pos: 6,
  DF_RealTek_L1_Header_SeqID_LowByte_Pos: 7

}

/* - Command - */

let ZH_RealTek_CMD_ID = {
  RealTek_CMD_Firmware: 0x01, //固件升级或版本查询
  RealTek_CMD_Setting: 0x02, //设置
  RealTek_CMD_Bind: 0x03, //绑定
  RealTek_CMD_Remind: 0x04, //提醒
  RealTek_CMD_SportData: 0x05, //运动数据
  RealTek_CMD_FactoryTest: 0x06, //工厂测试
  RealTek_CMD_Control: 0x07, //控制
  RealTek_CMD_DumpStack: 0x08, //Dump stack
  RealTek_CMD_Flash: 0x09, //测试Flash 读取
  RealTek_CMD_Log: 0x0a //日志
}


/* - Command Key - */

let ZH_RealTek_Firmware_Key = {
  RealTek_Key_Update_Req: 0x01, // 进入固件升级模式请求
  RealTek_Key_Update_Rep: 0x02, // 固件升级模式返回
  RealTek_Key_GetFw_Version_Req: 0x11, //固件版本请求
  RealTek_Key_GetFw_Version_Rep: 0x12 //固件版本请求响应
}


let ZH_RealTek_Setting_Key = {
  RealTek_Key_Set_Time: 0x01, //设置时间
  RealTek_Key_Set_Alarm: 0x02, //闹钟设置
  RealTek_Key_Get_AlarmList_Req: 0x03, //获取设备闹钟列表请求
  RealTek_Key_Get_ALarmList_Rep: 0x04, //获取设备闹钟列表返回
  RealTek_Key_Set_StepTarget: 0x05, //计步目标设定
  RealTek_Key_Set_UserProfile: 0x10, //用户Profile设置命令
  RealTek_Key_Set_LostMode: 0x20, //防丢设置
  RealTek_Key_Set_Sit_Long_OnOff: 0x21, //久坐提醒开关
  RealTek_Key_Set_Wear_LeftOrRight: 0x22, //左右手佩戴设置
  RealTek_Key_Set_PhoneOS: 0x23, //手机操作系统设置
  RealTek_Key_Set_IncomingTel_OnOff: 0x25, //来电及其他所有通知开关

  RealTek_Key_Get_Sit_Long_Req: 0x26,// 获取久坐提醒设置
  RealTek_Key_Get_Sit_Long_Rep: 0x27,//获取久坐提醒请求返回

  RealTek_Key_Get_Remind_Req: 0x28, //获取手环通知设置
  RealTek_Key_Get_Remind_Rep: 0x29, //获取手环通知设置请求返回

  RealTek_Key_Set_TurnLight_OnOff: 0x2A, //抬手亮屏
  RealTek_Key_Get_TurnLight_Req: 0x2B, //手环抬手亮屏设置请求
  RealTek_Key_Get_TurnLight_Rep: 0x2C, //手环抬手亮屏设置请求返回

  RealTek_Key_Set_ScreenOrientation: 0x33, //横竖屏切换命令
  RealTek_Key_Get_ScreenOrientationReq: 0x34, // 获取横竖屏方向
  RealTek_Key_Get_ScreenOrientationRep: 0x35, // 获取横竖屏方向返回

  RealTek_Key_Get_FunctionsReq: 0x36, //获取设备功能模块
  RealTek_Key_Get_FunctionsRep: 0x37 //获取设备功能模块返回
}


let ZH_RealTek_Bind_Key = {
  RealTek_Key_Bind_Req: 0x01, //绑定用户请求
  RealTek_Key_Bind_Rep: 0x02, //绑定用户请求返回
  RealTek_Key_Login_Req: 0x03, //用户登录请求
  RealTek_Key_Login_Rep: 0x04, //用户登录请求返回
  RealTek_Key_UnBind: 0x05, //解除绑定
  RealTek_Key_Super_Bind_Req: 0x06, //超级绑定
  RealTek_Key_Super_Bind_Rep: 0x07 //超级绑定返回
}

let ZH_RealTek_Remind_Key = {
  RealTek_Key_CallRemind: 0x01, //来电提醒
  RealTek_Key_IncomingCall_Receive: 0x02, //来电已接听
  RealTek_Key_IncomingCall_Refuse: 0x03, //来电已拒接
  RealTek_Key_Universal_Message: 0x06 //主动发送消息到手环
}

let ZH_RealTek_Sport_Key = {
  RealTek_Key_Sport_Req: 0x01, //请求获取运动数据
  RealTek_Key_Sport_Step_Rep: 0x02, //计步数据返回
  RealTek_Key_Sport_Sleep_Rep: 0x03, //睡眠数据返回
  RealTek_Key_Sport_More_Step_Rep: 0x04, //More flag 更多计步数据flag
  RealTek_Key_Sport_Set_Sleep_Rep: 0x05, //睡眠设定数据返回 （待定）
  RealTek_Key_Set_SportData_Syc_OnOff: 0x06, //运动数据实时同步设定
  RealTek_Key_His_SportData_Syc_Begin: 0x07, //历史数据同步开始
  RealTek_Key_His_SportData_Syc_End: 0x08, //历史数据同步结束
  RealTek_Key_Today_SportStatus_Syc: 0x09, //当天运动状态同步
  RealTek_Key_Last_SportStatus_Syn: 0x0a, //最近一次运动状态同步

  RealTek_Key_HR_OneTime: 0xd, //仅测量一次心率就返回结果
  RealTek_Key_HR_Continuous: 0xe, //连续测量
  RealTek_Key_HR_Rep: 0xf, //心率数据返回
  RealTek_Key_HR_Cancel: 0x10, //取消测量心率
  RealTek_Key_HR_GetContinuousSet: 0x11, //获取连续测量设置（开启或者关闭）
  RealTek_Key_HR_GetContinuousSet_Rep: 0x12, //获取连续测量设置返回
  RealTek_Key_BP_Req: 0x14, //使能血压测量
  RealTek_Key_BP_Rep: 0x13, //血压数据返回
  RealTek_Key_BP_Stop: 0x15 //血压数据测量终止通知
}


let ZH_RealTek_FacTest_Key = {
  RealTek_Key_FacTes_Echo_Req: 0x01, //请求echo服务
  RealTek_Key_FacTes_Echo_Rep: 0x02, //请求echo服务返回
  RealTek_Key_FacTes_Charge_Req: 0x03, //请求charge信息
  RealTek_Key_FacTes_Charge_Rep: 0x04, //返回charge信息
  RealTek_Key_FacTes_Led: 0x05, //点亮led
  RealTek_Key_FacTes_Shake_Motor:  0x06, //震动马达震动
  RealTek_Key_FacTes_Write_SN: 0x07, //写SN
  RealTek_Key_FacTes_Read_SN: 0x08, //度SN
  RealTek_Key_FacTes_SN_Rep: 0x09, //SN请求返回
  RealTek_Key_FacTes_Write_TestFlag: 0x0a, // 写test flag
  RealTek_Key_FacTes_Read_TestFlag: 0x0b, // 读test flag
  RealTek_Key_FacTes_TestFlag_Rep: 0x0c, //test flag 读写请求返回
  RealTek_Key_FacTes_SensorData_Req: 0x0d, //请求Sensor 数据
  RealTek_Key_FacTes_SensorData_Rep: 0x0e, //返回sensor 数据
  RealTek_Key_FacTes_Enter_SuperCmd: 0x10, //进入测试模式，超级命令key
  RealTek_Key_FacTes_Quit_SuperCmd: 0x11, //退出测试模式，超级命令key
  RealTek_Key_FacTes_Button: 0x21, //按键测试
  RealTek_Key_FacTes_MOT: 0x31, //马达老化测试
  RealTek_Key_FacTes_LED: 0x32 //LED老化测试
}

let ZH_RealTek_Control_Key = {
  RealTek_Key_Ctrol_Photo_Rep: 0x01, //拍照控制返回
  RealTek_Key_Ctrol_SingleClick_Rep: 0x02, //单击控制返回
  RealTek_Key_Ctrol_DoubleClick_Rep: 0x03, //双击控制返回
  RealTek_Key_Control_Camera_Status_Req: 0x11 //进入或退出相机拍照模式请求
}

let ZH_RealTek_DumpStack_Key = {
  RealTek_Key_Dump_AssertLocate_Req: 0x01, //请求手环assert 位置信息
  RealTek_Key_Dump_AssertLocate_Rep: 0x02, //返回assert 位置信息
  RealTek_Key_Dump_AssertStack_Req: 0x03, //请求获取assert时的栈信息
  RealTek_Key_Dump_AssertStack_Rep: 0x04 //返回assert时的栈信息
}

let ZH_RealTek_Log_Key = {
  RealTek_Key_Log_Open: 0x01, //通知设备打开日志功能
  RealTek_Key_Log_Close: 0x02,  //关闭日志功能
  RealTek_Key_Log_Send: 0x03, //发送日志给设备每条日志长度不超过 499 byte
}

module.exports = {
  DF_RealTek_L1_Header: DF_RealTek_L1_Header,
  DF_RealTek_L2_Header: DF_RealTek_L2_Header,
  DF_RealTek_Header_Predef: DF_RealTek_Header_Predef,
  L1_Header_ByteOrder: L1_Header_ByteOrder,
  ZH_RealTek_CMD_ID: ZH_RealTek_CMD_ID,
  ZH_RealTek_Firmware_Key: ZH_RealTek_Firmware_Key,
  ZH_RealTek_Setting_Key: ZH_RealTek_Setting_Key,
  ZH_RealTek_Bind_Key: ZH_RealTek_Bind_Key,
  ZH_RealTek_Remind_Key: ZH_RealTek_Remind_Key,
  ZH_RealTek_Sport_Key: ZH_RealTek_Sport_Key,
  ZH_RealTek_FacTest_Key: ZH_RealTek_FacTest_Key,
  ZH_RealTek_Control_Key: ZH_RealTek_Control_Key,
  ZH_RealTek_DumpStack_Key: ZH_RealTek_DumpStack_Key,
  ZH_RealTek_Log_Key: ZH_RealTek_Log_Key

}