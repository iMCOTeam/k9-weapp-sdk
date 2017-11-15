Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadingHidden: true,
    text: 'init data',
    num: 0,
    array: [{ text: 'init data' }],
    object: {
      text: 'init data'
    }
  },

  changeText: function () {
    // this.data.text = 'changed data'  // bad, it can not work
    this.setData({
      text: 'changed data'
    })
  },

  changeNum: function () {
    this.data.num = 1
    this.setData({
      num: this.data.num
    })
  },
  changeItemInArray: function () {
    // you can use this way to modify a danamic data path
    this.setData({
      'array[0].text': 'changed data'
    })
  },

  changeItemInObject: function () {
    this.setData({
      'object.text': 'changed data'
    });
  },
  
  addNewField: function () {
    this.setData({
      'newField.text': 'new data'
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('homepage has loaded')

    var num = 255
    var hexString = num.toString(16)
    console.log("hexString",hexString)

    var numInt = parseInt(hexString, 16)
    console.log("numInt",numInt)

    var numt2 = num.toString(2)
    console.log("numt2",numt2)

    var testInt2 = 4 & 5
    console.log("testInt2",testInt2)

    var value16 = 0x16
    console.log("value6",value16)

    var buf = new ArrayBuffer(32)

    var buf1 = new ArrayBuffer(16)
    
    var testNull = null
    if(testNull){
      console.log("testNull")
    }else{
      console.log("test 134")
    }

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})