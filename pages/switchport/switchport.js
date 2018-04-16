var port = require('../../utils/port.js');
var Parser = require('../../lib/dom-parser.js');
var app = getApp()
var wsdlurl = app.data.wsdlurl;
var targetNamespace = app.data.targetNamespace;
var Promise = require('../../plugins/es6-promise.js')

Promise.prototype.finally = function (callback) {
  let P = this.constructor;
  return this.then(
    value => P.resolve(callback()).then(() => { return value }),
    reason => P.resolve(callback()).then(() => { throw reason })
  );
};

Page({
  data: {
    searchLetter: [],
    showLetter: "",
    winHeight: 0,
    portList: [],
    getports: [],
    des: 0,
    start_port: "",
    des_port: "",
    searchport: [],
    searchValue: "",
    isShowLetter: false,
    scrollTop: 0,//置顶高度
    scrollTopId: '',//置顶id
    port: "",
    fromin: 0,
    togetStart: 0,
    showLoading:true,
    inputSearchText:null,
  },

  inputSearch: function (e) {
    var ports = [];
    var text = e.detail.value;
    this.setData({
      inputSearchText:text
    })
    if (this.data.inputSearchText == '' || this.data.inputSearchText == null) {
      this.setData({
        searchport: []
      })
      return;
    }
    
    if (text.length > 0) {
      var searchLetter = port.searchLetter;
      var firstChar = text.substr(0, 1);
      var uni = firstChar.charCodeAt(0);
      //如果不在汉字处理范围之内,返回原字符,也可以调用自己的处理函数  
      if (uni > 40869 || uni < 19968) {
        var reg = port.query(firstChar)[0];
        var temIndex = searchLetter.indexOf(reg);
        var portLists = this.data.portList;
        var temPortInfo = this.data.portList[temIndex].portInfo;
        for (var i = 0; i < temPortInfo.length; i++) {
          var temPort = temPortInfo[i].port;
          ports.push(temPort);
        }
      } else {
        //如果是汉字
        var regx = new RegExp(text, 'g');
        var reg = port.query(firstChar)[0];
        var temIndex = searchLetter.indexOf(reg);
        var portLists = this.data.portList;
        var temPortInfo = this.data.portList[temIndex].portInfo;
        for (var i = 0; i < temPortInfo.length; i++) {
          if (regx.test(temPortInfo[i].port)) {
            var temPort = temPortInfo[i].port;
            ports.push(temPort);
          }
        }
      }
      this.setData({
        searchport: ports
      })
    }
  },
  inputBlur:function(){
    if (this.data.inputSearchText == '' || this.data.inputSearchText==null){
      this.setData({
        searchport:[]
      })
    }
  },
  choosePort: function (e) {
    this.setData({
      port: e.currentTarget.dataset.item,
      searchport: [],
    })
    this.nowLetter(1, this)
  },

  // 返回运价查询界面，根据选择的港口信息
  getPort: function () {
    if (this.data.togetStart == 0 && this.data.port != "") {
      getApp().data.des_port_eng = (this.data.port).split("-")[0]
      getApp().data.des_port = (this.data.port).split("-")[1]
    } else if (this.data.togetStart == 1 && this.data.port != "") {
      getApp().data.start_port_eng = (this.data.port).split("-")[0]
      getApp().data.start_port = (this.data.port).split("-")[1]
    }
    if (this.data.fromin == 1) {
      wx.redirectTo({
        url: '../port_select/index',
      })
    } else {
      wx.switchTab({
        url: '../port_select_out/port_select_out',
      })
    }
  },

  onLoad: function (options) {
    // 生命周期函数--监听页面加载
    var searchLetter = port.searchLetter;
    var that = this
    var predicate = 'PORTTYPE==@0';
    var values = 'shipping';
    var pageNum = 1;
    var pageSize = 1000000000 
    var orderByProperty = 'NAMEEN';
    var rowsCount = 1000000000 ;
    //获取港口
    new Promise((resolve, reject) => {
      wx.request({
        url: wsdlurl +'GetPortsList',
        data: {
          predicate: predicate,
          values: values,
          pageNum: pageNum,
          pageSize: pageSize,
          orderByProperty: orderByProperty,
          rowsCount: rowsCount
        },
        method: 'GET',
        header: {
          'content-type': 'application/json'
        },
        // 设置请求的 header
        success: function (res) {
          // success
          var resData = res.data;
          var nodeValue = resData.result
          nodeValue = nodeValue + '';
          nodeValue = nodeValue.replace('[', '');
          nodeValue = nodeValue.replace(']', '');
          nodeValue = nodeValue.replace(new RegExp('},{', 'g'), '} , {');
          var resultArray = nodeValue.split(' , ');
          var array = [];
          for (var i = 0; i < resultArray.length; i++) {
            var ithResult = resultArray[i];
            var jsonData = JSON.parse(ithResult);
            var OriginalValues = jsonData.OriginalValues;
            array.push(jsonData.NAMEEN + "-" + jsonData.NAMECH);
          }
          resolve(array)
        },
        fail: function () {
          // fail
          wx.showModal({
            title: '提示',
            content: '访问服务器失败',
          })
        },
        complete: function () {
          // complete 
        }
      })
    }).then(res => {
      var portList = port.portList(res);
      that.setData({
        showLoading: false,
        portList: portList
      })
    })
    var sysInfo = wx.getSystemInfoSync();
    var winHeight = sysInfo.windowHeight;
    //添加要匹配的字母范围值
    //1、更加屏幕高度设置子元素的高度
    var itemH = winHeight / searchLetter.length;
    var tempObj = [];
    for (var i = 0; i < searchLetter.length; i++) {
      var temp = {};
      temp.name = searchLetter[i];
      temp.tHeight = i * itemH;
      temp.bHeight = (i + 1) * itemH;
      tempObj.push(temp)
    }
    this.setData({
      winHeight: winHeight,
      itemH: itemH,
      searchLetter: tempObj,
      togetStart: options.togetStart,
      fromin: options.fromin
    })
  },

  onReady: function () {
    // 生命周期函数--监听页面初次渲染完成

  },

  onShow: function () {
    // 生命周期函数--监听页面显示

  },

  onHide: function () {
    // 生命周期函数--监听页面隐藏

  },

  onUnload: function () {
    // 生命周期函数--监听页面卸载

  },

  onPullDownRefresh: function () {
    // 页面相关事件处理函数--监听用户下拉动作

  },

  onReachBottom: function () {
    // 页面上拉触底事件的处理函数

  },

  onShareAppMessage: function () {
    // 用户点击右上角分享
    return {
      title: 'title', // 分享标题
      desc: 'desc', // 分享描述
      path: 'path' // 分享路径
    }
  },

  searchStart: function (e) {
    var showLetter = e.currentTarget.dataset.letter;
    var pageY = e.touches[0].pageY;
    this.setScrollTop(this, showLetter);
    this.nowLetter(pageY, this);
    this.setData({
      showLetter: showLetter,
      startPageY: pageY,
      isShowLetter: true,
    })
  },

  searchMove: function (e) {
    var pageY = e.touches[0].pageY;
    var startPageY = this.data.startPageY;
    var tHeight = this.data.tHeight;
    var bHeight = this.data.bHeight;
    var showLetter = 0;
    if (startPageY - pageY > 0) { //向上移动
      if (pageY < tHeight) {
        this.nowLetter(pageY, this);
      }
    } else {//向下移动
      if (pageY > bHeight) {
        this.nowLetter(pageY, this);
      }
    }
  },

  searchEnd: function (e) {
    var that = this;
    setTimeout(function () {
      that.setData({
        isShowLetter: false
      })
    }, 1000)
  },

  nowLetter: function (pageY, that) {//当前选中的信息
    var letterData = this.data.searchLetter;
    var bHeight = 0;
    var tHeight = 0;
    var showLetter = "";
    for (var i = 0; i < letterData.length; i++) {
      if (letterData[i].tHeight <= pageY && pageY <= letterData[i].bHeight) {
        bHeight = letterData[i].bHeight;
        tHeight = letterData[i].tHeight;
        showLetter = letterData[i].name;
        break;
      }
    }
    this.setScrollTop(that, showLetter);
    that.setData({
      bHeight: bHeight,
      tHeight: tHeight,
      showLetter: showLetter,
      startPageY: pageY
    })
  },

  bindScroll: function (e) {
  },

  setScrollTop: function (that, showLetter) {
    var scrollTop = 0;
    var portList = that.data.portList;
    var portCount = 0;
    var initialCount = 0;
    for (var i = 0; i < portList.length; i++) {
      if (showLetter == portList[i].initial) {
        scrollTop = initialCount * 30 + portCount * 41;
        break;
      } else {
        initialCount++;
        portCount += portList[i].portInfo.length;
      }
    }
    that.setData({
      scrollTop: scrollTop
    })
  },

  bindPort: function (e) {
    this.nowLetter(1, this)
    var port = e.currentTarget.dataset.port;
    this.setData({ port: port })
    this.setData({ port: e.currentTarget.dataset.port })
  },

  clickLetter: function (e) {
    var showLetter = e.currentTarget.dataset.letter;
    this.setData({
      showLetter: showLetter,
      isShowLetter: true,
      scrollTopId: showLetter,
    })
    var that = this;
    setTimeout(function () {
      that.setData({
        isShowLetter: false
      })
    }, 1000)
  },

  //选择热门城市
  bindHotPort: function (e) {
    this.setData({
      port: e.currentTarget.dataset.port
    })
  },

  //点击热门城市回到顶部
  hotPort: function () {
    this.setData({
      scrollTop: 0,
    })
  },
})