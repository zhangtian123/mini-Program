// pages/shareStatusBackByOrder/shareStatusBackByOrder.js
var app = getApp()
var Promise = require('../../plugins/es6-promise.js')
var utils = require('../../utils/util.js');
var Parser = require('../../lib/dom-parser');
//wsdlurl中设置需要访问的webservice的url地址
var wsdlurl = app.data.wsdlurl;
var targetNamespace = app.data.targetNamespace;

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
    //账单
    isShowTable: false,
    isValidate:true,
    BILLID: "99dfd44735974cc7854705126139a200",
    showImageUrl: '../../images/expand-arrow-down.png',
    predicate: 'BILLID == @0',
    values: '',
    orderByProperty: 'BILLNO',
    item: null,
  },

  getData: function () {
    this.setData({
      searchLoading: true,  //把"上拉加载"的变量设为false，隐藏
      searchLoadingComplete: false,
    })
    var that = this;
    new Promise(function (resolve, reject) {
      wx.request({
        url: wsdlurl + 'GetSeBookingList',
        data: {
          predicate: that.data.predicate,
          values: that.data.BILLID,
          pageNum: 0,
          pageSize: 100,
          orderByProperty: that.data.orderByProperty,
          userCode: "",
        },
        method: 'GET',
        header: {
          'content-type': 'application/json'
        },
        // 设置请求的 header
        success: function (res) {
          that.setData({
            searchLoading: false  //把"上拉加载"的变量设为false，隐藏
          })
          // success
          var resData = res.data;
          var result = resData.result;
          result = result + '';
          result = result.replace('[', '');
          result = result.replace(']', '');
          var first = result.substring(result.lastIndexOf(']') + 1);
          var last = result.substring(0, result.lastIndexOf(']'));
          result = first + last;
          result = result.replace(new RegExp('},{', 'g'), '} $%,%$ {')
          var resultArray = result.split(' $%,%$ ')
          var jsonData = JSON.parse(resultArray[0]);
          var tempResult = {
            ORDERID: jsonData.ORDERID,
            ORDERNO: jsonData.ORDERNO,
            CUSTOMSCOMPANY: jsonData.REQUESTER,
            CUSTOMSOP: jsonData.REFNO,
            SONO: jsonData.BOOKINGNO,
            HBLNO: jsonData.HBLNO,
            CNTRNUMSTR: jsonData.CNTRNUMSTR,
            BILLID: jsonData.BILLID,
            CNTRNUMSTR: jsonData.CNTRNUMSTR,
          }
          that.setData({
            BILL: tempResult
          })
          resolve(tempResult)
        }
      })
    }).then(res => {
      var nodeCode = ['FMS_SO01', 'FMS_SO04',
        'FMS_SO47', 'FMS_SO48', 'FMS_SO52', 'FMS_SO51', 'FMS_SO50', 'FMS_SO49', 'FMS_SO53', 'FMS_SO12', 'FMS_SO09', 'FMS_SO54']
      var BILLID = res.BILLID;
      new Promise((resolve, reject) => {
        wx.request({
          url: wsdlurl + 'GetNodeViewInfos',
          data: {
            BillID: BILLID
          },
          method: 'GET',
          header: {
            'content-type': 'application/json'
          },
          //设置请求的 header
          success: function (res) {
            var TRACE = [];
            var resData = res.data;
            var result = resData.result;
            var detailArray = [];

            if (result == "[]") {
              that.setData({
                searchLoadingComplete: true, //把“已加载全部”设为true，显示
              })
            } else {
              result = result + '';
              result = result.replace('[', '');
              result = result.replace(']', '');
              var first = result.substring(result.lastIndexOf(']') + 1);
              var last = result.substring(0, result.lastIndexOf(']'));
              result = first + last;
              result = result.replace(new RegExp('},{', 'g'), '} $%,%$ {')
              var resultArray = result.split(' $%,%$ ')

              for (var j = 0; j < resultArray.length; j++) {
                var ithResult = resultArray[j];
                var jsonData = JSON.parse(ithResult);
                var OriginalValues = jsonData.OriginalValues;
                for (var ii = 0; ii < 12; ii++) {
                  if (jsonData.NODECODE == nodeCode[ii] && jsonData.NODESTATE == 'finished') {
                    var result = jsonData.FINISHEDDATE.split('.');
                    var date = result[0].replace(new RegExp('-', 'g'), '.');
                    date = date.replace('T', ' ');
                    var tempResult = {
                      date: date,
                      BILLID: jsonData.BILLID
                    }
                    TRACE.push(tempResult);
                  }
                }
              }
            }
            var SHOW = {
              isShowTable: false,
              showImageUrl: '../../images/expand-arrow-down.png'
            }
            var item = {
              ORDER: that.data.BILL,
              ORDERTRACE: TRACE,
              SHOW: SHOW
            }
            that.setData({
              item: item
            })
          }
        })
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var time = utils.formatTime1(new Date());
    this.setData({
      hasBinding: app.globalData.hasBinding,
      values: app.data.customer,
      userinfonickname: app.data.userName,
      screenHeight: wx.getSystemInfoSync().windowHeight,
      beginDate: time,
      endDate: time,
      isValidate : options.isValidate,
      BILLID:options.BILLID,
    })
    wx.setNavigationBarTitle({
      title: '订单跟踪',
    })
    this.getData();
  },

  table_show: function (e) {
    var ithItem = this.data.item;
    var SHOW = ithItem.SHOW;
    var isShowTable = SHOW.isShowTable;
    if (isShowTable) {
      SHOW = {
        isShowTable: false,
        showImageUrl: '../../images/expand-arrow-down.png'
      }
    } else {
      SHOW = {
        isShowTable: true,
        showImageUrl: '../../images/expand-arrow-up.png'
      }
    }
    ithItem.SHOW = SHOW;
    this.setData({
      item: ithItem
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
    return {
      title: '订单跟踪',
      desc: '佰信国际物流协同管理平台',
      path: '/pages/shareStatusBackByOrder/shareStatusBackByOrder?isValidate=' + this.data.isValidate + '&BILLID=' + this.data.BILLID,
    }
  }
})