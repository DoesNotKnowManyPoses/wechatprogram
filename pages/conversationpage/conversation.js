// pages/conversationpage/conversation.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //用数组的形式来组织会比较好，现在先随便用一个一个来。
    userImage:"",
    word1:"我想做点什么",
    word2:"想做点什么？",
    word3: "" ,
    word4: "只做一次？" ,
    word5: "",
    word6:"进展如何？",
    word7:"估值几何？",
    word8:"",
    fontSize:36,
    height:800,
    bottomHeight:100,
    bgcolor:["white","white","white","white"],
    decision:"",
    isDecisionMade:false,
    index:-1, //index of the job for handling
    mode:-1
  },
  getLengthOfString:function(str){
    var numAscii = 0;
    for(var i = 0 ; i < str.length ; i ++){
      if(str[i].match(/[\x00-\xff]/)){
        numAscii++;
      }
    }
    var chineseCharacters = str.length - numAscii;
    console.log("chineseCharacters" + chineseCharacters);
    var totalLength = (Math.ceil(numAscii/5*3)+chineseCharacters)*this.data.fontSize;
    return totalLength > this.data.maxWidth ? this.data.maxWidth : totalLength+15;
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) { 
   
   // wx.hideLoading();
    var mode = options.mode;
    try{
    
    var systemInformation = wx.getSystemInfoSync();
    var res = systemInformation.windowWidth;
    var height = systemInformation.windowHeight;
    var ratio = 750/res;
    height = Math.floor(height * ratio);
    if(mode==1){//mode==1,有按钮界面，高度适当降低。mode==0，纯展示界面，
    height = height-this.data.bottomHeight;
    console.log("conversation height is "+height);
    }
    this.setData({
      height:height
    });
    }catch(e){
      console.log("Height set wrong for conversation"+e);
    }
    var word3 = options.desc;
    var frequency = options.frequency;
    var word5;
    var value = options.value;
    var index = options.index;
    if(frequency==0){
      word5="只做一次！";
    }
    else if(frequency==1){
      word5="每天皆可！";  //为啥中文状态下的叹号可以显示 英文的不可以啊。
    }
    else{
      word5="多多益善！";
    }
    this.setData({
      word3:word3,
      word5:word5,
      word8:value,
      index : index,
      mode:mode
    });
    var that = this;
    wx.getUserInfo({
      success:function(res){
        var userInfo = res.userInfo;
        var imageUrl = userInfo.avatarUrl;
        console.log("url is "+imageUrl);
        that.setData({
          userImage:imageUrl
        });
      }
    })
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
  
  },
  handleInput:function(e){
    var value = e.detail.value;
    var length = value.length*30;
    if(length>550){
      length=550;
    }

    this.setData({
      word:value,
      wordLength:length
    })
  },
  handleDecision:function(e){
    var decision = e.currentTarget.dataset.decision;
    var color=["white","white","white"];
    color[parseInt(decision)]="green";
    var transDecision;
     if(decision=="3"){
       wx.navigateBack({
           delta: 1
       });
       this.unsetJobStatusInGlobalData();
       return;
     }
    else if(decision=="0"){
      transDecision="不辱使命";
    }
    else if(decision=="1"){
      transDecision="今天不是个好时机";
    }
    else if(decision=="2"){
      transDecision="不是我想要的";
    }
  
    this.setData({
      isDecisionMade: true,
      decision:transDecision,
      bgcolor:color,
      height:this.data.height //再调用一次就可以让新的消息显示在最下面
    });
    this.setJobStatusInGlobalData(decision);
    // globalData: {
    //   userInfo: null,
    //     recordIndex:-1,
    //       decisionMade:false,
    //         decision:-1
    // }
  },
  setJobStatusInGlobalData:function(decision){
    var app = getApp();
    app.globalData.decisionMade = true;
    app.globalData.recordIndex = this.data.index;
    app.globalData.decision = decision;
  },
  unsetJobStatusInGlobalData:function(){
    var app = getApp();
    app.globalData.decisionMade = false;
    app.globalData.recordIndex =-1;
    app.globalData.decision = "";
  }
})