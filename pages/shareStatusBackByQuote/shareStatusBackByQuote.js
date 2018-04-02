// pages/shareStatusBackByQuote/shareStatusBackByQuote.js
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
    QUOTEREPORTSEAID: null,
    totalFeeString: '',
    totalFee: 0,
    searchLoading:true,
  },
  getPrice: function () {
    this.setData({
      searchLoading: true,  
    })
    var that = this
    //分享多条
    var predicate = 'QUOTEREPORTSEAID == @0';
    var values = this.data.QUOTEREPORTSEAID;
    var that = this;
    console.log(values)
    wx.request({
      url: wsdlurl + 'GetCrQuoteReportSeaList',
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
        var nodeValue = result;
        nodeValue = nodeValue + '';
        nodeValue = nodeValue.replace('[', '');
        nodeValue = nodeValue.replace(']', '');
        nodeValue = nodeValue.replace(new RegExp('},{', 'g'), '} , {');
        var resultArray = nodeValue.split(' , ');
        var jsonData = JSON.parse(resultArray[0]);
        console.log(jsonData)
        var tempResult = {
          SAILLINE: jsonData.SAILLINE,
          // SAILINGDATE: jsonData.SAILINGDATE,
          ETD: jsonData.ETD.replace('T', ' ').substring(0, 10),
          Customer: jsonData.Customer,
          CARRIER: jsonData.CARRIER,
          DAYNUM: jsonData.DAYNUM,
          PORTLOADING: jsonData.PORTLOADING,
          PORTDISCHARGE: jsonData.PORTDISCHARGE,
          ISDIRECT:jsonData.ISDIRECT,
          BeginDate: (jsonData.BeginDate).replace('T', ' ').substring(0, 16),
          EndDate: (jsonData.EndDate).replace('T', ' ').substring(0, 16),
          PRICE20GP: jsonData.PRICE20GP.toFixed(2),
          PRICE40GP: jsonData.PRICE40GP.toFixed(2),
          PRICE40HQ: jsonData.PRICE40HQ.toFixed(2),
          QUANTITY20GP: jsonData.QUANTITY20GP,
          QUANTITY40GP: jsonData.QUANTITY40GP,
          QUANTITY40HQ: jsonData.QUANTITY40HQ,
          QUANTITY45HQ: jsonData.QUANTITY45HQ,
        }
        var totalFeeString= '';
        var totalFee = 0;
        if (tempResult.QUANTITY20GP > 0) {
          if (totalFeeString != '') {
            totalFeeString += '+';
          }
          totalFeeString += tempResult.QUANTITY20GP + 'x' + tempResult.PRICE20GP +'(20GP)';
          totalFee += tempResult.QUANTITY20GP * tempResult.PRICE20GP;
        }
        if (tempResult.QUANTITY40GP > 0) {
          if (totalFeeString != '') {
            totalFeeString += '+';
          }
          totalFeeString += tempResult.QUANTITY40GP + 'x' + tempResult.PRICE40GP +'(40GP)';
          totalFee += tempResult.QUANTITY40GP * tempResult.PRICE40GP;
        }
        if (tempResult.QUANTITY40HQ > 0) {
          if (totalFeeString != '') {
            totalFeeString += '+';
          }
          totalFeeString += tempResult.QUANTITY40HQ + 'x' + tempResult.PRICE40HQ +'(40HQ)';
          totalFee += tempResult.QUANTITY40HQ * tempResult.PRICE40HQ;
        }
        that.setData({
          totalFeeString: totalFeeString,
          totalFee:totalFee
        })
        console.log(tempResult)
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
      QUOTEREPORTSEAID: options.QUOTEREPORTSEAID
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