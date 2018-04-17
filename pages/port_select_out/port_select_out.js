//index.js
//获取应用实例
var app = getApp()
var utils = require('../../utils/util.js');
var Parser = require('../../lib/dom-parser');
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
    // currentdate: utils.formatDate(new Date()),
    count: 0,
    search: false,
    packageType: [],
    unit: app.data.unit,//单位
    unit_index: app.data.unit_index,
    num20gp: app.data.num20gp,
    num40gp: app.data.num40gp,
    num40hc: app.data.num40hc,
    start_port: app.data.start_port,
    des_port: app.data.des_port,
    start_port_eng: app.data.start_port_eng,
    des_port_eng: app.data.des_port_eng,
    date: app.data.date,
    weight: app.data.weight,
    vol: app.data.vol,
    num: app.data.num,
    windowWidth: wx.getSystemInfoSync().windowWidth,
    arr: [1, 2, 3, 4, 5],
    fromlog: 0
  },

  getStartPort: function () {
    wx.redirectTo({
      url: '../switchport/switchport?togetStart=1&fromin=0',
    })
  },

  getDesPort: function () {
    wx.redirectTo({
      url: '../switchport/switchport?togetStart=0&fromin=0',
    })
  },

  getNum: function (e) {
    app.data.num = e.detail.value
  },

  getWeight: function (e) {
    app.data.weight = e.detail.value
  },

  getVol: function (e) {
    app.data.vol = e.detail.value
  },

  bindTimeChange: function (e) {
    app.data.date = e.detail.value
    this.setData({
      date: e.detail.value
    })
  },

  bindUnitChange: function (e) {
    this.setData({
      unit_index: e.detail.value
    })
  },

  desc20gp: function (e) {
    var temp = app.data.num20gp
    temp--
    if (temp >= 0) {
      app.data.num20gp = temp
      this.setData({
        num20gp: temp
      })
    }
  },

  add20gp: function (e) {
    app.data.num20gp++
    this.setData({
      num20gp: app.data.num20gp
    })
  },

  desc40gp: function (e) {
    var temp = app.data.num40gp
    temp--
    if (temp >= 0) {
      app.data.num40gp = temp
      this.setData({
        num40gp: temp
      })
    }
  },

  add40gp: function (e) {
    app.data.num40gp++
    this.setData({
      num40gp: app.data.num40gp
    })
  },

  desc40hc: function (e) {
    var temp = app.data.num40hc
    temp--
    if (temp >= 0) {
      app.data.num40hc = temp
      this.setData({
        num40hc: temp
      })
    }
  },

  add40hc: function (e) {
    app.data.num40hc++
    this.setData({
      num40hc: app.data.num40hc
    })
  },

  searchPrice: function (e) {
    //查询运价
    wx.redirectTo({
      url: '../priceResearch_out/index',
    })
  },

  getPackageType: function () {
    var predicate = '1==1';
    var values = '';
    var iCounts = 1000000000 ;
    var that = this
    wx.request({
      url: wsdlurl +'GetPackageType',
      data: {
        predicate: predicate,
        values: values,
        iCounts: iCounts
      },
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      // 设置请求的 header
      success: function (res) {
        // success
        var ans = [];
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
          //包装类型英文名
          var str={
            TYPENAMECH: jsonData.TYPENAMECH,
            TYPENAMEEN: jsonData.TYPENAMEEN
          }
          array.push(str);
        }
        app.data.packageType = array
        that.setData({
          packageType: array
        })
      },
      fail: function () {
        wx.showModal({
          title: '提示',
          content: '访问服务器失败',
        })
        // fail
      },
      complete: function () {
        // complete 
      }
    })
  },

  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '运价查询',
    })
    this.getPackageType();
    this.setData({
      // currentdate: utils.formatDate(new Date()),
      unit_index: app.data.unit_index,
      num20gp: app.data.num20gp,
      num40gp: app.data.num40gp,
      num40hc: app.data.num40hc,
      start_port: app.data.start_port,
      des_port: app.data.des_port,
      start_port_eng: app.data.start_port_eng,
      des_port_eng: app.data.des_port_eng,
      date: app.data.date,
      weight: app.data.weight,
      vol: app.data.vol,
      num: app.data.num
    })
  }
})
