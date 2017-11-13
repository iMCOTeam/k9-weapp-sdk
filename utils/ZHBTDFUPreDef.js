let DF_DFU_Opcode = {
  DF_DFU_OPCODE_Start_DFU: 0x01,
  DF_DFU_OPCODE_Receive_FWImage: 0x02,
  DF_DFU_OPCODE_Validate_FWImage: 0x03,
  DF_DFU_OPCODE_Active_Image_Reset: 0x04,
  DF_DFU_OPCODE_Reset_System: 0x05,
  DF_DFU_OPCODE_Report_Received_ImageInfo: 0x06,
  DF_DFU_OPCODE_ReceivePacket_Notification_Req: 0x07,
  DF_DFU_OPCODE_Response_Code: 0x10,
  DF_DFU_OPCODE_Packet_Receive_Notification: 0x11,
}

let DF_DFU_Errorcode = {
  DF_DFU_Status_Success: 0x01,
  DF_DFU_Status_OPCODE_Not_Support: 0x02,
  DF_DFU_Status_Invalid_Para: 0x03,
  DF_DFU_Status_Operation_Failed: 0x04,
  DF_DFU_Status_Data_Size_Excess: 0x05,
  DF_DFU_Status_CRC_Error: 0x06,
}

module.exports = {
  DF_DFU_Opcode: DF_DFU_Opcode,
  DF_DFU_Errorcode: DF_DFU_Errorcode
}