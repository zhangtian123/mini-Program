// pages/shareStatusBackByPrice/shareStatusBackByPrice.js
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

  /**
   * 页面的初始数据
   */
  data: {
    item: null,
    BILLID:null,
    searchLoading: true
  },
  getPrice: function () {
    var that = this
    that.setData({
      searchLoading: true
    })
    //分享多条
    var predicate = 'BILLID == @0';
    var values = this.data.BILLID;
    wx.request({
      url: wsdlurl + 'GetQuoteFCLList',
      data: {
        predicate: predicate,
        values: values,
        numStr: '0,0,0'
      },
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      // 设置请求的 header
      success: function (res) {
        // success
        that.setData({
          searchLoading: false
        })
        var resData = res.data;
        var result = resData.result
        var array = [];
        if (result == null || result == '') {
          wx.showToast({
            title: '未查询到数据',
          })
          return;
        }
        var nodeValue = result;
        nodeValue = nodeValue + '';
        nodeValue = nodeValue.replace('[', '');
        nodeValue = nodeValue.replace(']', '');
        nodeValue = nodeValue.replace(new RegExp('},{', 'g'), '} , {');
        var resultArray = nodeValue.split(' , ');
        var jsonData = JSON.parse(resultArray[0]);
        var tempResult = {
          SAILLINE: jsonData.SAILLINE,
          SAILINGDATE: jsonData.SAILINGDATE,
          DAYNUM: jsonData.DAYNUM,
          PORTLOADING: jsonData.PORTLOADING,
          PORTDISCHARGE: jsonData.PORTDISCHARGE,
          STARTDATE: (jsonData.STARTDATE).substring(0, 10),
          ENDDATE: (jsonData.ENDDATE).substring(0, 10),
          PRICE20GP: jsonData.BossPrice20GP.toFixed(2),
          PRICE40GP: jsonData.BossPrice40GP.toFixed(2),
          PRICE40HQ: jsonData.BossPrice40HQ.toFixed(2),
          TotalPrice: jsonData.TotalPrice.toFixed(2)
        }
        that.setData({
          item: tempResult,
        })
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
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      BILLID : options.BILLID
    })
    this.getPrice();
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