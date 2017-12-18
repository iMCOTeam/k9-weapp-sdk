# About k9-weapp-sdk 

`k9-weapp-sdk` is designed to help iMCO Smart band and mobile commnunication framework.Without iMCO permission can not be disclosed to third parties in any way.



## Usage
1. Add the `utils` folder to the project

   ​

# Get Started

```objective-c
const util = require('../../utils/util.js')
const manager = require("../../utils/ZHBTManager.js")
const preModel = require("../../utils/ZHBTModel.js")
```

* Demo Project
  * There's a sweet demo project: `iMCODemo`.
* All data models are defined in the `ZHBTModel` .


* All interface calls are defined in the `ZHBTManager` .

  ​

  ​

  ​


## ToDo List

- [ ] 通知功能。
- [ ] 固件升级。





## Notes

- 通知功能（来电，微信，QQ，短信等）安卓和iOS不同。iOS为ANCS，但是需要配对，由于没有发现配对所以通知功能iOS可能在小程序中不能使用，（怀疑小程序屏蔽了配对的弹窗）。安卓是需要获取系统的通知然后发送至手环，由于在小程序中暂时没有发现获取系统通知的接口，所以可能也不能使用消息通知功能。
- 某些固件可能不具备血压功能。（测试前需获取设备功能列表）
- 运动数据需要先同步个人信息才能生成。（身高，体重等）
- 固件升级功由于微信小程序不支持获取文件内容，所以赞不支持。



