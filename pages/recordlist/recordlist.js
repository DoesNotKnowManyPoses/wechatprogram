//textarea.js
var Charts = require("wxcharts.js");
Page({
  data: {
    daysSofar:0,
    order:true,
    tospend:"",
    bottom:-200,
    longtap: false,
    singletap: true,
    singletapForHistory:true,
    touchStart: null,
    counter: null,  //identifier for job.
    showModal: false,
    currentPage: 0,
    totalRecords: [],
    description: "",
    value: 0,
    newRecords: [],
    swiperHeight: 800,
    duration: 300,
    fortune: 0,
    totalFortune:0,
    todayEarning:0,
    height: 20,
    focus: false,
    keyDate: 0,
    used: 0,
    expense: 0,
    axisX: 0,
    axisY: 0,
    buttonWidth: 180,
    color: ["green", "blank", "blank"],
    records: null,
    finishedJobs: [],
    onceisOK: false,
    history: null,
    widthOfCanvas:0,
    heightOfCanvas:0,
    canvasDisplay:true,
    graphTip:"想看数据分析？点我呀！",
    showTip:"想看数据分析？点我呀！",
    hideTip:"请在图标上下方滑动，再次点击可以隐藏图表",
    dynamicCanvas:"",
    lengthOfHistory:[7,14,21,null],
    daysRange:["最近7天","最近14天","最近21天","所有记录"],
    selected:1,
    selectedArray:[1]
  },

  /**
 * 生命周期函数--监听页面卸载
 */
  onUnload: function () {
    this.saveData();
    console.log("save exeucted in unload");
  },
  onHide: function () {
    this.saveData();
    console.log("no need to do save on hide");
  },
  saveData: function () {
    wx.setStorageSync('money', this.data.fortune);
    wx.setStorageSync("totalMoney", this.data.totalFortune);
    wx.setStorageSync(this.data.keyDate, this.data.records);
    wx.setStorageSync('job', this.data.totalRecords);
    wx.setStorageSync("history", this.data.history);
    wx.setStorageSync("todayEarning", this.data.todayEarning);
  },
  onLoad: function (options) {
    console.log("on load is excuted");
    this.setSwiperHeight();
  },
  /**
  * 生命周期函数--监听页面初次渲染完成
  */
  onReady: function () { //do a good initilization of the data.
    wx.showLoading({
      title: '加载中',
    });
    var that = this;
    var base = [];
    var date = new Date();
    var totalValue;
    var earning;
    var keyDate = this.getKeyDate();
    console.log("key of today is " + keyDate);
    
    try {
      var value = wx.getStorageSync(keyDate)
      totalValue = wx.getStorageSync("job");
      if (!totalValue) totalValue = [];
      if (value) {                              //if already has read the information from job, then no need to read from job again.
        base = base.concat(value);
        earning = wx.getStorageSync("todayEarning");
        if (!earning) earning = 0; 
      }
      else {                                //if this is the first time on the day to read the job information, get the job list from 
        base = base.concat(totalValue);
        earning=0;
        wx.setStorageSync(keyDate, base);
      }
    } catch (e) {

    }
    console.log(base + "base length is " + base.length);

    if (base.length == 0) {
      base = this.initializeRecordData();
      console.log(base.length);
    }
    var money = wx.getStorageSync("money");
    if (!money) money = 0;
    var totalMoney = wx.getStorageSync("totalMoney");
    if(!totalMoney) totalMoney = 0 ;
    this.setData({   //set data to keep the consistent with the view.
      records: base,
      totalRecords: totalValue,
      fortune: new Number(money),
      totalFortune:totalMoney,
      todayEarning:earning
    });
    this.loadHistory();
    console.log("on ready is executed");

    wx.hideLoading();
  },
  /**
 * 生命周期函数--监听页面显示
 */
  onShow: function () {
    this.setData({
      singletap: true,
      singletapForHistory:true
    });
    console.log("on show is executed");
     // globalData: {
    //   userInfo: null,
    //     recordIndex:-1,
    //       decisionMade:false,
    //         decision:-1
    // }
    var app=getApp();
    if(app.globalData.decisionMade){
      var index = app.globalData.recordIndex;
      var decision = app.globalData.decision;
      if(decision=="0"){
        this.finishJobViaIndex(index);
      }
      else if(decision=="1"){
        this.cancelJobViaIndex(index);
      }
      else{
        this.removeFromTotalRecordsViaIndex(index);
        this.cancelJobViaIndex(index);
      }
      app.globalData.decisionMade=false;
    }
  },
  getKeyDate:function(){
   var date = new Date();
   var monthMM = date.getMonth()+1;
   if(monthMM<10){
     monthMM = "0"+(""+monthMM);
   }
   var dayDD = date.getDate();
   if(dayDD<10){
     dayDD = "0"+(""+dayDD);
   }
  var keyDate= [date.getFullYear(), "年", monthMM, "月", dayDD, "日"].join("");//generate the key referring to date.
   //var keyDate="2016年08月06日";
    this.setData({
      keyDate: keyDate
    });
    return keyDate;
  },
  clearAll: function (e) {
    wx.clearStorage();//clear storage
    this.setData({ //clear data in the memory to avoid being written into storage.
      fortune: 0,
      totalFortune: 0,
      todayEarning: 0,
      totalRecords: [],
      records: [],
      history:[]
    })
  },
  buildTodayHistory:function(e){
    var history={};
    history.earning=this.data.todayEarning;
    history.finishedJobs = this.data.finishedJobs;
    history.date = this.data.keyDate;
    history.showdetail = false;
    console.log(history);
    return history;
  },

  cancelJob: function (e) {
   // console.log(e.currentTarget.dataset.index);
    var index = e.currentTarget.dataset.index;
    this.cancelJobViaIndex(index);
  },
  cancelJobViaIndex:function(index){
    var list = this.data.records;
    list.splice(index, 1);
    this.setData({
      records: list
    });
    wx.setStorageSync(this.data.keyDate, list);
  },
  finishJob: function (e) {//when a job is finished, what to do? 
    
    // var job=this.data.records[index];
    // var fortune = job.value + this.data.fortune;
    // var totalFortune = job.value + this.data.totalFortune;
    // var todayEarning = job.value + this.data.todayEarning;
    // var list = this.data.finishedJobs;
    // list.unshift(job);
       //some problems with the calculation of the money.
        // this.data.records.splice(index, 1);
    // this.setData(
    //   { 
    //     fortune: fortune,
    //     totalFortune:totalFortune,
    //     todayEarning:todayEarning,
    //     records: this.data.records,
    //     finishedJobs:list,
    //   }
    // );

    // var history = this.data.history;
    // this.addTodayToHistory(history);
    // var daysSoFar = history.length;
    // this.setData({
    //   history:history,
    //   daysSofar:daysSoFar
    // });
    // this.saveData();
    // console.log("history length is "+history.length);
    // this.playSoundOfMakingMoney();
    var index = e.currentTarget.dataset.index;
    this.finishJobViaIndex(index);
  },
  finishJobViaIndex:function(index){
    var job = this.data.records[index];
    var fortune = job.value + this.data.fortune;
    var totalFortune = job.value + this.data.totalFortune;
    var todayEarning = job.value + this.data.todayEarning;
    var list = this.data.finishedJobs;
    list.unshift(job);
    this.data.records.splice(index, 1);
    if (job.onceisOK) {
      this.removeFromTotalRecordsViaId(job.id);
    }
    this.setData(
      {
        fortune: fortune,
        totalFortune: totalFortune,
        todayEarning: todayEarning,
        records: this.data.records,
        finishedJobs: list,
      }
    );

    var history = this.data.history;
    this.addTodayToHistory(history);
    var daysSoFar = history.length;
    this.setData({
      history: history,
      daysSofar: daysSoFar
    });
    this.saveData();
    console.log("history length is " + history.length);
    this.playSoundOfMakingMoney();
  },
  removeFromTotalRecords: function (e) {
    var index = e.currentTarget.dataset.index; //the index is the number on which item you click, this is not the index in the total records. use id 
    //should be better
    var record = this.data.records[index];
    
    this.removeFromTotalRecordsViaId(record.id);
  },
  removeFromTotalRecordsViaId:function(id){
    var list = this.data.totalRecords;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id == id) {
        list.splice(i, 1);
        console.log("index " + i + "has been deleted from the list");
        break;
      }
    }
    this.setData({
      totalRecords: list
    });
    wx.setStorageSync("job", list);
  },
  playSoundOfMakingMoney:function(){
     //http://jsdx.sc.chinaz.com/Files/DownLoad/sound1/201507/6043.mp3
     wx.playBackgroundAudio({
       dataUrl: 'http://jsdx.sc.chinaz.com/Files/DownLoad/sound1/201507/6043.mp3',
     })
    
  },
  addTodayToHistory:function(historyList){ //
   var today =this.buildTodayHistory();
   console.log("today is ");
   console.log(today);  
   if(historyList.length>0&&historyList[0].date==today.date){
     historyList[0]=today;
     return;
   }
       //unshift, put it at the first.
   historyList.unshift(today);//should do a check to see if today is already in the list   
  },
  setSwiperHeight:function(){
    try{
    var systemInformation = wx.getSystemInfoSync();
    var res = systemInformation.windowWidth;
    var height = systemInformation.windowHeight;
    var height2 = systemInformation.screenHeight;
    var width2 = systemInformation.screenWidth;
    var pix = systemInformation.pixelRatio;
    var ratio = 750 / res;
    height = Math.floor(height * ratio) - 116;
    var widthOfCanvas = Math.floor(700/ratio);
    var heightOfCanvas = Math.floor(500/ratio);
    this.setData({
      swiperHeight: height,
      widthOfCanvas: widthOfCanvas,
      heightOfCanvas: heightOfCanvas
    });
  } catch (e) {

  }
  },
  createNewRecord: function (description, value, onceisOK) {
    var id;
    if (this.data.counter == null) {
      id = wx.getStorageSync("counter");
      if (!id) {
        id = 0;
      }
    }
    else {
      id = this.data.counter;
    }
    //console.log("length of string is " + description.length + " multiply is " + 32 * description.length);
    var newRecord = {
      description: description,
      value: value,
      id: id,
      len: description.length,
      onceisOK: onceisOK
    };
    id++;
    wx.setStorageSync("counter", id);
    return newRecord;
  },
  addJob: function (e) {
    var newRecord = this.createNewRecord(this.data.description, this.data.value, this.data.onceisOK);
    this.data.totalRecords.push(newRecord);
    this.data.records.unshift(newRecord);
    this.setData({
      totalRecords: this.data.totalRecords,
      records: this.data.records
    });
    console.log("length of total records" + this.data.totalRecords.length + " records is " + this.data.records.length);
    wx.setStorageSync("job", this.data.totalRecords);//whether this is necessary.
    wx.setStorageSync(this.data.keyDate, this.data.records);
  },
  getDescription: function (e) {
    //console.log(e.detail.value);
    this.setData({
      description: e.detail.value
    });
  },
  getValue: function (e) {
    var value = e.detail.value;
    var number = parseFloat(value);
    if (isNaN(number)) {
      return "";
    }
    this.setData({
      value: number
    });
  },
  handleSwiper: function (e) {
    // console.log("swiper event is " + e.detail);
    // console.log("swiper target " + e.detail.current);
    // console.log("swiper source is " + e.detail.source);
     //console.log(this.data.currentPage);
    var that = this;
  
    switch (e.detail.current) {
      case 0:
        that.loadPageZero();
        break;
      case 1:
        //this.loadTotalJob(); logic has change, this page is not used to show total jobs.
        that.loadPageOne();
        break;
      case 2:
        that.loadPageTwo();
        break;
    }
  },
  clickPage: function (e) { //switch the page of swiper and change the color of the button at the bottom
    var index = parseInt(e.currentTarget.dataset.page);
    this.setData({
      currentPage: index
    });
    this.changeColor(index);
  },
  showGraphOfHistory:function(days){
     var history = this.data.history;
     var earningList = [];
     var dateList = [] ;
     var width = this.data.widthOfCanvas;
     var height = this.data.heightOfCanvas;
     console.log("canvas height widht"+width+"  "+height);
     if(days){
       days = days<history.length? days:history.length;
       for(var i = 0 ; i<days; i ++){
         earningList.unshift(history[i].earning);
         dateList.unshift(history[i].date);
       }
     }
     else{
     for(var day of history){
       earningList.unshift(day.earning);
       dateList.unshift(day.date);
     }
     }
     console.log(dateList);
     new Charts({
       canvasId:"lineCanvas",
       type:'line',
       categories:dateList,
       series:[{
         name:"赚钱曲线",
         data:earningList,
         format:function(val){
           return val;
         }
       }],
       yAxis:{
         title:"日薪($)",
         format:function(val){
           return val;
         },
         min:0
       },
       width:width,
       height:height
     });
    //  var context = wx.createCanvasContext('lineCanvas');//即使是官方的例子，也会画在偏的位置上。一个下来刷新会把位置放正。手机上有这个问题，不知道怎么办 但是开发工具//上没问题。怀疑是swiper的问题。已知的问题，swiper是继承自scroll-view的。。
    //  context.setStrokeStyle("#00ff00")
    //  context.setLineWidth(5)
    //  context.rect(0, 0, 200, 200)
    //  context.stroke()
    //  context.setStrokeStyle("#ff0000")
    //  context.setLineWidth(2)
    //  context.moveTo(160, 100)
    //  context.arc(100, 100, 60, 0, 2 * Math.PI, true)
    //  context.moveTo(140, 100)
    //  context.arc(100, 100, 40, 0, Math.PI, false)
    //  context.moveTo(85, 80)
    //  context.arc(80, 80, 5, 0, 2 * Math.PI, true)
    //  context.moveTo(125, 80)
    //  context.arc(120, 80, 5, 0, 2 * Math.PI, true)
    //  context.stroke()
    //  context.draw()

  },
  loadPageZero:function(){
    this.setData({
      currentPage:0
    })
    this.changeColor(0);
    this.hideCanvas();
  },
  loadPageOne:function(){
    this.setData({
      currentPage:1
    })
    this.loadHistory();
    this.changeColor(1);

  },
  loadPageTwo:function(){
    this.setData({
      currentPage:2
    })
    this.hideCanvas();
    this.loadHistory();
    this.changeColor(2);
  },
  loadHistory:function(){
    if (this.data.history == null) {
      var that = this;
      //console.log("show loading triggered");
    var finishedJobs=[];
    var history = wx.getStorageSync("history");
    if(!history) history=[];
    else{
      console.log("history is ");
      console.log(history);
      that.setShowDetailToFalse(history); //set default to detail not show for wx:if.
      var latestHistory = history[0];
      if(latestHistory.date==this.data.keyDate) finishedJobs = latestHistory.finishedJobs;
    }
      that.setData({
      history: history,
      daysSofar:history.length,
      finishedJobs: finishedJobs
    });
  }
  },
  showActions: function (e) {//long tap and show all the actions that can be done on this item.
    this.setData({   //prevent the trigger of tap.
      longtap: true
    });
    if (!this.data.singletap) { //if tap is already triggered
      this.showTip("看完再做决定");
      return;
    }
    var that = this;
    wx.showActionSheet({
      itemList: ["先做了这个", "今天先不做", "以后也不做", "新的有意义的事情"],
      success: function (ind) {
       // console.log("triggered action sheet" + ind.tapIndex);
        if (ind.tapIndex == 0) {
          //console.log("have triggered"+ind);
          that.finishJob(e);
        }
        else if (ind.tapIndex == 1) {
          that.cancelJob(e);
        }
        else if (ind.tapIndex == 2) {
          that.removeFromTotalRecords(e); //依赖于record中的数据. 
          that.cancelJob(e);

        }
        else {
          that.setData({
            showModal: true
          })
        }
      }
    });
  },
  hideModal: function (e) {
    this.setData({
      showModal: false
    });
  },
  onCancel: function (e) {
    this.hideModal(e);
  },
  onConfirm: function (e) {
    //do something here
    this.addJob(e);
    this.hideModal(e);
  },

  initializeRecordData: function () {
    var list = [];
    var description = "长按屏幕写个事情的描述以及你认为它的价值吧，完成这件事情你可以奖励自己1个点";
    var value = 1;
    var onceisOK = true;
    var exampleRecord = this.createNewRecord(description, value, onceisOK);
    list.push(exampleRecord);
    return list;
  },
  setOnceISOK: function (e) {
    //console.log("before set, what the value is " + this.data.onceisOK);
    this.setData({
      onceisOK: e.detail.value
    })
  },
  showCompleteText: function (e) {     //把list保存下来的方法。。造成了删不掉的局面，你觉得应该怎么处理。因为长按本身就是tap
    //因为longtap是在tap之前触发的 手指还未离开 就已经出发了longtap 这时候可以设置符号位。
    //还有一个问题，就是如果随便点击若干个，会造成一些不一致的情况，虽然可以再设置一个符号位，但是感觉有点奇怪。
    if (this.data.longtap) {//如果longtap发生了。等longtap结束后才能触发。
      this.setData({
        longtap: false
      });
      return;
    }
    if (this.data.singletap) {
      this.setData({
        singletap:false
      });
      var index= e.currentTarget.dataset.index;
      var list = this. data.records;
      var record = list[index];
      var desc = record.description;
      var frequency = record.onceisOK? 0 : 1;
      var value = record.value;
      var id = record.id;
      wx.navigateTo({
        url: '../conversationpage/conversation?desc='+desc+'&frequency='+frequency+'&value='+value+"&index="+index+"&mode=1",
      });
      // this.setData({
      //   singletap: true 这里允许别的点击，其实没啥影响，但是navigate这个反映有点慢，所以可以点了这个之后再点别的地方。
      // })
      //注释掉的是用来显示长文本的，但是现在决定用新的方法来显示信息。
      // this.setData({
      //   singletap: false
      // });
      // //console.log("tap triggered");
      // var index = e.currentTarget.dataset.index;
      // var list = this.data.records;
      // var strlength = list[index].len;
      // var strRPX = 32 * strlength;
      // if (strRPX < 500) {
      //   this.setData({
      //     singletap: true
      //   });
      //   return;
      // }
      // strRPX = 500 - strRPX;
      // list[index].txtStyle = strRPX + "rpx";
      // this.setData({
      //   records: list
      // });
      // var that = this;
      // setTimeout(function () {
      //   list[index].txtStyle = "0rpx";
      //   that.setData({
      //     records: list,
      //     singletap: true
      //   });
      // }, 4000);
    }
    else {
      //this.showTip("不要那么心急嘛，一个一个来");用结果来表示你这个点击没成功吧。
    }
  },
  showTip: function (tip) {  //说实话 这个不能定制 丑了一点。。还行吧。。虽然是可以自己写的。。抄个模态就行了 。
    wx.showToast({
      title: tip,
      icon: "loading",
      duration: 1200,
      mask: true
    });
  },
  touchStartTime: function (e) {   //暂时放缓，试试那个说的什么加锁。  加锁成功了。

  },
  touchEndTime: function (e) {

  },
  showActionsWhenEmpty: function (e) {
    var that = this;
    wx.showActionSheet({
      itemList: ["新的有意义的事情"],
      success: function (ind) {
        //console.log("triggered action sheet" + ind.tapIndex);
        if (ind.tapIndex == 0) {
          that.setData({
            showModal: true
          });
        }
      }
    });
  },
  changeColor: function (index) {
    var color = ["blank", "blank", "blank"];
    color[index] = "green";
    this.setData({
      color: color
    })
  },
  toggleDetails:function(e){
    //console.log("the index is "+e.currentTarget.dataset.index);
    var index = e.currentTarget.dataset.index;
    var list = this.data.history;
    //console.log(list[index].showdetail+" heheh should be false");
    list[index].showdetail = !list[index].showdetail;
    this.setData({
      history:list
    });
  },
  showDesc:function(e){
    if (this.data.singletapForHistory){
      this.setData({
        singletapForHistory:false});
    var firstIndex=parseInt(e.currentTarget.dataset.index);
    var secondIndex=parseInt(e.currentTarget.dataset.subindex);
   //console.log("hahah which index is " + firstIndex);//get the index of first circulation
   // console.log("hahah which second index is " + secondIndex);    //get the index of the second circulation
    var history = this.data.history;
    var dayInHistory=history[firstIndex];
   // console.log(dayInHistory);
    var jobInDay = dayInHistory.finishedJobs[secondIndex];
    var desc = jobInDay.description;
    var frequency = jobInDay.onceisOK? 0: 1;
    var value = jobInDay.value;
    wx.navigateTo({
      url: '../conversationpage/conversation?desc=' + desc + '&frequency=' + frequency + '&value=' + value + "&index=" + secondIndex + "&mode=0",
    });
    //console.log(jobInDay);
    // var lenOfDesc = jobInDay.description.length*30;
    // if(lenOfDesc<520){
    //     //something to unlock the tap
    //   this.setData({
    //     singletapForHistory:true
    //   })
    //   return;
    // }
    // var diff = 520 - lenOfDesc;
    // jobInDay.txtStyle=diff+"rpx";
    // this.setData({
    //   history:history
    // });
    // var that = this;
    // setTimeout(
    //   function(){
    //     jobInDay.txtStyle="0rpx";
    //     that.setData({
    //       history:history,
    //       singletapForHistory:true
    //     });
    //   },4000);
    }
    else{
      //this.showTip("不要那么心急嘛，一个一个来");用结果来表示连点两个不成功吧。
    }
  },
  setShowDetailToFalse: function (list) {
    console.log("tirgger the default of history") //if the page is for "history", shrink the lists.
    for (var i = 0; i < list.length; i++) {
      list[i].showdetail = false;
    }
  },
  onPullDownRefresh:function(){
    if(this.data.currentPage==1){  //if the page is for "spend money", no need to do.
      wx.stopPullDownRefresh();
      return;
    }
    else if(this.data.currentPage==0){ //if the page is for "do things", sort the list DESC/ASC.
     var records = this.data.records;
     if(this.data.order){
     records.sort(function(a,b){
        return a.value-b.value;
     });
     }
     else{
       records.sort(function(a,b){
         return b.value-a.value;
       })
     }
     this.setData({
       records:records,
       order:!this.data.order
     })
     wx.stopPullDownRefresh();
     return;
    }
    else if(this.data.currentPage==2){
    var history = this.data.history;
    this.setShowDetailToFalse(history);
    this.setData({
      history:history
    });
    wx.stopPullDownRefresh();
    }
  },
  showSpecialFunctions:function(e){
    this.setData({
      bottom:120
    });
  },
  hideSpecial:function(e){
    this.setData({
      bottom:-200
    });
  },
  spendMoney:function(e){
     if(this.data.tospend==="" || this.data.tospend===0){ //v
       this.setData({
         tospend:""
       })
       return;
      } //这里如果是==，那么输入0的话，会当成=，然后就直接return了。
     if(this.data.tospend<this.data.fortune){
       var left = this.data.fortune - this.data.tospend;
       this.setData({
         fortune:left,
         tospend:""
       });
     }
     else{
       wx.showToast({
         title: '钱不够',
         image:"sad.gif"
       });
       this.setData({
         tospend:""
       });
     }
  },
  enterNumber:function(e){
    var number = e.detail.value;
    if(isNaN(number)){
      return "";
    }
    this.setData({
      tospend:parseFloat(number)
    });
  },
  showGraphOfDays:function(e){
    var index = e.detail.value;
    var days = this.data.lengthOfHistory[parseInt(index)];
    this.showGraphOfHistory(days);
    this.setData({
      selected:index
    });
  },
  showGraphWithinDays:function(e){
   var selectedArr = e.detail.value;
   var i = selectedArr[0];
   var days = this.data.lengthOfHistory[i];
   this.showGraphOfHistory(days);
   this.setData({
     selectedArray:selectedArr
   })
  },
  showCanvas:function(e){
    if(this.data.canvasDisplay){
     var i = this.data.selectedArray[0];
     var days = this.data.lengthOfHistory[i];
     this.showGraphOfHistory(days);
     this.setData({
       canvasDisplay:!this.data.canvasDisplay,
       graphTip:this.data.hideTip,
       dynamicCanvas:"dynamicCanvas",
     });
    }
    else{
      this.hideCanvas();
    }
  },
  hideCanvas:function(){
    if(this.data.canvasDisplay){
      return;
    }
    else{
      this.setData({
        canvasDisplay: !this.data.canvasDisplay,
        graphTip: this.data.showTip,
        dynamicCanvas:""
      })
    }
  }
})


  // handletouchstart: function (e) {
  //   if (e.touches.length == 1) {
  //     console.log("mouse moved");
  //     this.setData({
  //       axisX: e.touches[0].clientX,
  //       axisY: e.touches[0].clientY
  //     });
  //   }
  // },
  // handletouchmove: function (e) {
  //   if (e.touches.length == 1) {
  //     var xmove = e.touches[0].clientX;
  //     var xdif = xmove - this.data.axisX;
  //     var buttonWidth = this.data.buttonWidth;
  //     var txtStyle = "";
  //     txtStyle = "left:" + xdif + "px";
  //     if (Math.abs(xdif) >= buttonWidth) {
  //       txtStyle = xdif > 0 ? "left:" + buttonWidth + "px" : "left:-" + buttonWidth + "px";
  //     }
  //     var index = e.target.dataset.index;
  //     var list = this.data.records;
  //     list[index].txtStyle = txtStyle;
  //     this.setData({
  //       records: list
  //     });
  //   }
  // },
  // handletouchmoveOfTotal:function(e){
  //   if (e.touches.length == 1) {
  //     var xmove = e.touches[0].clientX;
  //     var xdif = xmove - this.data.axisX;
  //     var buttonWidth = this.data.buttonWidth;
  //     if(xdif>0) xdif=0;
  //     var txtStyle = "left:"+xdif+"px";
  //     if (Math.abs(xdif) >= buttonWidth) {
  //       txtStyle = xdif > 0 ? "left:0px"  : "left:-" + buttonWidth + "px";
  //     }
  //     var index = e.target.dataset.index;
  //     var list = this.data.totalRecords;
  //     list[index].txtStyle = txtStyle;
  //     this.setData({
  //       totalRecords: list
  //     });
  //   }
  // },
  // handletouchend: function (e) {
  //   if (e.changedTouches.length == 1) {
  //     var endX = e.changedTouches[0].clientX;
  //     var xdif = endX - this.data.axisX;
  //     var buttonWidth = this.data.buttonWidth;

  //     var txtStyle = (Math.abs(xdif) < buttonWidth / 2) ? "left:0px" : "left:" + buttonWidth * xdif / (Math.abs(xdif)) + "px";
  //     var index = e.target.dataset.index;
  //     var list = this.data.records;
  //     list[index].txtStyle = txtStyle;
  //     this.setData({
  //       records: list
  //     });
  //   }
  // },
  // handletouchendOfTotal:function(e){
  //   if (e.changedTouches.length == 1) {
  //     var endX = e.changedTouches[0].clientX;
  //     var xdif = endX - this.data.axisX;
  //     var buttonWidth = this.data.buttonWidth;
  //     if(xdif>0) xdif=0;//no right move
  //     var txtStyle = (Math.abs(xdif) < buttonWidth / 2) ? "left:0px" : "left:" + buttonWidth * xdif / (Math.abs(xdif)) + "px";
  //     var index = e.target.dataset.index;
  //     var list = this.data.totalRecords;
  //     list[index].txtStyle = txtStyle;
  //     this.setData({
  //       totalRecords: list
  //     });
  //   }
  // },