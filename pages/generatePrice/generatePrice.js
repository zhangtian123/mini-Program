// pages/generatePrice/generatePrice.js
var app = getApp()
var utils = require('../../utils/util.js');
var Parser = require('../../lib/dom-parser');
//wsdlurl中设置需要访问的webservice的url地址
var wsdlurl = app.data.wsdlurl;
var targetNamespace = app.data.targetNamespace;
var Promise = require('../../plugins/es6-promise.js')

//无论promise对象最后状态如何都会执行
Promise.prototype.finally = function (callback) {
  let P = this.constructor;
  return this.then(
    value => P.resolve(callback()).then(() => value),
    reason => P.resolve(callback()).then(() => { throw reason })
  );
};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userCode: null,
    customer: null,
    remark: null,
    //有效时间起始
    beginDates: null,
    beginTimes: null,
    endDates: null,
    endTimes: null,

    BILLID: null,
    item: null,

    QUANTITY20GP: 0,
    QUANTITY40GP: 0,
    QUANTITY40HQ: 0,

    PRICE20GP: 0,
    PRICE40GP: 0,
    PRICE40HQ: 0,

    totalFee:0,
    totalFeeString:'',

    searchLoading: false,
    showCustomerList:false,
    customerList:null,
  },

  getPrice: function () {
    var that = this
    that.setData({
      searchLoading: true
    })
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
          console.log('resulthaha' + result)
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
        console.log(jsonData)
        var tempResult = {
          BILLID: jsonData.BILLID,
          BILLNO: jsonData.BILLNO,
          CUSTOMER: jsonData.CARRIER,
          SAILLINE: jsonData.SAILLINE,
          SAILINGDATE: jsonData.SAILINGDATE,
          DAYNUM: jsonData.DAYNUM,
          PORTLOADING: jsonData.PORTLOADING,
          PORTDISCHARGE: jsonData.PORTDISCHARGE,
          ISDIRECT: jsonData.ISDIRECT,
          BASEPORT: jsonData.BASEPORT,
          STARTDATE: (jsonData.STARTDATE).replace('T', ' '),
          ENDDATE: (jsonData.ENDDATE).replace('T', ' '),
          PRICE20GP: jsonData.BossPrice20GP.toFixed(2),
          PRICE40GP: jsonData.BossPrice40GP.toFixed(2),
          PRICE40HQ: jsonData.BossPrice40HQ.toFixed(2),
          TotalPrice: jsonData.TotalPrice.toFixed(2),
          CARRIER: jsonData.CARRIER,
        }
        that.setData({
          item: tempResult,
          beginDates: tempResult.STARTDATE.substring(0, 10),
          beginTimes: tempResult.STARTDATE.substring(10, 16),
          endDates: tempResult.ENDDATE.substring(0, 10),
          endTimes: tempResult.ENDDATE.substring(10, 16),
          PRICE20GP: tempResult.PRICE20GP,
          PRICE40GP: tempResult.PRICE40GP,
          PRICE40HQ: tempResult.PRICE40HQ,
        })
        console.log(tempResult)
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
  getCustomers:function(){
    var that = this
    var predicate = 'TYPECODE==@0 && (COMNAMECN.Contains(@1) || SHORTNAME.Contains(@1))'
    var values = 'Customer,' + that.data.customer;
    wx.request({
      url: wsdlurl + 'GetCustomers',
      data: {
        predicate: predicate,
        values: values,
      },
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      // 设置请求的 header
      success: function (res) {
        var resData = res.data;
        var result = resData.result;
        result = result.replace('[','');
        result = result.replace(']', '');
        var resultArray = result.split(',')
        var customerList = resultArray;
        var showList = customerList == "" ? false : true
        that.setData({
          customerList: customerList,
          showCustomerList: showList
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
  chooseCustomer:function(e){
    var temp = e.currentTarget.dataset.item;
    var index = e.currentTarget.dataset.index;
    this.setData({
      customer: this.data.customerList[index],
      showCustomerList:false
    })
  },
  saveAndShare: function (e) {
    var that = this;
    that.setData({
      searchLoading: true
    })
    var weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var curDate = new Date();
    curDate = new Date((curDate / 1000 + 86400) * 1000);
    while (weekday[curDate.getDay()] != that.data.item.SAILINGDATE) {
      curDate = new Date((curDate / 1000 + 86400) * 1000);
    }
    var quote = {
      CUSTOMER: that.data.customer,
      BEGINDATE: (that.data.beginDates + that.data.beginTimes + ':00').replace(' ','T'),
      ENDDATE: (that.data.endDates +  that.data.endTimes + ':00').replace(' ','T'),
      REMARK: that.data.remark,
      CREATEBY: app.data.userCode
    };
    var detail = {
      CARRIER: that.data.item.CARRIER,
      PORTLOADING: that.data.item.PORTLOADING,
      PORTDISCHARGE: that.data.item.PORTDISCHARGE,
      PRICE20GP: that.data.PRICE20GP,
      PRICE40GP: that.data.PRICE40GP,
      PRICE40HQ: that.data.PRICE40HQ,
      QUANTITY20GP: that.data.QUANTITY20GP,
      QUANTITY40GP: that.data.QUANTITY40GP,
      QUANTITY40HQ: that.data.QUANTITY40HQ,
      DAYNUM: that.data.item.DAYNUM,
      ISDIRECT: that.data.item.ISDIRECT,
      ETD: curDate
    }
    console.log(quote)
    console.log(detail)
    new Promise(function (resolve, reject) {
      wx.request({
        url: wsdlurl + 'SetCrQuoteReportSeaByApp',
        data: {
          quote: JSON.stringify(quote),
          detail: JSON.stringify(detail),
        },
        method: 'GET',
        header: {
          'content-type': 'application/json'
        },
        // 设置请求的 header
        success: function (res) {
          // success
          console.log(res.data)
          var result = res.data;
          resolve(result);
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
      var result = res.result+"";
      console.log(result)
      var ids = result.split(',');
      var shareID = ids[0];
      var BILLID = ids[1];
      console.log(ids)
      wx.request({
        url: wsdlurl + 'ValidOcShareLog',
        data: {
          shareId: shareID,
          hours: 48
        },
        method: 'GET',
        header: {
          'content-type': 'application/json'
        },
        // 设置请求的 header
        success: function (res) {
          that.setData({
            searchLoading: false
          })
          var resData = res.data;
          var result = resData.result;
          console.log(result)
          if (result == true) {
            var isValidate = true;
            if (app.data.customer) {
              // 自己分享的内容
              isValidate = false;
            }
            else {
              //重定向之后，打开的
            }
            console.log(BILLID)
            wx.navigateTo({
              url: '../shareStatusBackByQuote/shareStatusBackByQuote?isValidate=' + isValidate + '&QUOTEREPORTSEAID=' + BILLID
            })
          }
          else {
            wx.navigateTo({
              url: '../shareStatusBackInvalid/shareStatusBackInvalid',
            })
          }
        }
      })
    })

  },
  bindBeginDatesChange: function (e) {
    app.data.date = e.detail.value
    this.setData({
      beginDates: e.detail.value
    })
  },
  bindBeginTimeChange: function (e) {
    app.data.date = e.detail.value
    this.setData({
      beginTimes: e.detail.value
    })
  },
  bindEndDateChange: function (e) {
    app.data.date = e.detail.value
    this.setData({
      endDates: e.detail.value
    })
  },
  bindEndTimeChange: function (e) {
    app.data.date = e.detail.value
    this.setData({
      endTimes: e.detail.value
    })
  },
  subtract20GP: function (e) {
    var QUANTITY20GP = this.data.QUANTITY20GP - 1;
    this.setData({
      QUANTITY20GP: QUANTITY20GP
    })
    this.calculateTotalFee();
  },
  add20GP: function (e) {
    var QUANTITY20GP = this.data.QUANTITY20GP + 1;
    this.setData({
      QUANTITY20GP: QUANTITY20GP
    })
    this.calculateTotalFee();
  },
  subtract40GP: function (e) {
    var QUANTITY40GP = this.data.QUANTITY40GP - 1;
    this.setData({
      QUANTITY40GP: QUANTITY40GP
    })
    this.calculateTotalFee();
  },
  add40GP: function (e) {
    var QUANTITY40GP = this.data.QUANTITY40GP + 1;
    this.setData({
      QUANTITY40GP: QUANTITY40GP
    })
    this.calculateTotalFee();
  },
  subtract40HQ: function (e) {
    var QUANTITY40HQ = this.data.QUANTITY40HQ - 1;
    this.setData({
      QUANTITY40HQ: QUANTITY40HQ
    })
    this.calculateTotalFee();
  },
  add40HQ: function (e) {
    var QUANTITY40HQ = this.data.QUANTITY40HQ + 1;
    this.setData({
      QUANTITY40HQ: QUANTITY40HQ
    })
    this.calculateTotalFee();
  },
  input20GPPrice: function (e) {
    this.setData({
      PRICE20GP: e.detail.value
    })
    this.calculateTotalFee();
  },
  input40GPPrice: function (e) {
    this.setData({
      PRICE40GP: e.detail.value
    })
    this.calculateTotalFee();
  },
  input40HQPrice: function (e) {
    this.setData({
      PRICE40HQ: e.detail.value
    })
    this.calculateTotalFee();
  },
  calculateTotalFee:function(e){
    var totalFeeString = '';
    var totalFee = 0;
    if (this.data.QUANTITY20GP > 0) {
      if (totalFeeString != '') {
        totalFeeString += '+';
      }
      totalFeeString += this.data.QUANTITY20GP + 'x' + this.data.PRICE20GP + '(20GP)';
      totalFee += this.data.QUANTITY20GP * this.data.PRICE20GP;
    }
    if (this.data.QUANTITY40GP > 0) {
      if (totalFeeString != '') {
        totalFeeString += '+';
      }
      totalFeeString += this.data.QUANTITY40GP + 'x' + this.data.PRICE40GP + '(40GP)';
      totalFee += this.data.QUANTITY40GP * this.data.PRICE40GP;
    }
    if (this.data.QUANTITY40HQ > 0) {
      if (totalFeeString != '') {
        totalFeeString += '+';
      }
      totalFeeString += this.data.QUANTITY40HQ + 'x' + this.data.PRICE40HQ + '(40HQ)';
      totalFee += this.data.QUANTITY40HQ * this.data.PRICE40HQ;
    }
    this.setData({
      totalFeeString: totalFeeString,
      totalFee: totalFee
    })
  },
  inputRemark: function (e) {
    this.setData({
      remark: e.detail.value
    })
  },
  inputCustomer: function (e) {
    this.setData({
      customer: e.detail.value
    })
    this.getCustomers();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      BILLID: options.BILLID,
      userCode: app.data.userCode,
    })
    wx.setNavigationBarTitle({
      title: '生成报价',
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