// pages/shareStatusBackByBill/shareStatusBackByBill.js
var app = getApp()
var utils = require('../../utils/util.js');
var Parser = require('../../lib/dom-parser');
//wsdlurl中设置需要访问的webservice的url地址
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
    //账单
    isShowTable: false,
    showImageUrl: '../../images/expand-arrow-down.png',
    tableData: [
      { 'id': '1', 'name': '报关费', 'type': 'XX', 'number': 'XX' },
      { 'id': '2', 'name': '拖车费', 'type': 'XX', 'number': 'XX' },
      { 'id': '3', 'name': '合计', 'type': 'XX', 'number': 'XX' }
    ],

    searchPageNum: 1,   // 设置加载的第几次，默认是第一次
    callbackcount: 4,      //返回数据的个数

    item: null,
    BILLID: "982c9d3c84df4a329c07e1f70931937b",
    predicate: 'DUNNINGORREQUESTS==@0 and NODECODE==@1  and BILLID == @2',
    values: 'Dunning,Fee_CQK05,',
    orderByProperty: 'BILLDATE',
    rowsCount: 0,
  },
  getData: function (e) {
    this.setData({
      searchLoading: true,  //把"上拉加载"的变量设为false，隐藏
      searchLoadingComplete: false,
    })
    var that = this;
    new Promise(function (resolve, reject) {
      that.setData({
        values: 'Dunning,Fee_CQK05,' + that.data.BILLID,
      })
      wx.request({
        url: wsdlurl + 'GetAccountingList',
        data: {
          predicate: that.data.predicate,
          values: that.data.values,
          pageNum: that.data.searchPageNum,
          pageSize: that.data.callbackcount,
          orderByProperty: that.data.orderByProperty,
          // userCode:null,
          rowsCount: that.data.rowsCount
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
          var resData = res.data;
          var result = resData.result;
          if (result == "[]") {
            return
          }
          var rowsCount = resData.rowsCount;
          result = result + '';
          result = result.replace('[', '');
          result = result.replace(']', '');
          result = result.replace(new RegExp('},{', 'g'), '} , {')
          var resultArray = result.split(' , ')
          var jsonData = JSON.parse(resultArray[0]);
          //获取账单ID，账单号，总金额币别，总金额，提交日期，最迟处理日期，往来单位，支付方式，银行，银行账号
          var tempResult = {
            BILLID: jsonData.BILLID,
            BILLNO: jsonData.BILLNO,
            CURRENCY: jsonData.CURRENCY,
            TOTALAMOUNT: jsonData.TOTALAMOUNT.toFixed(2),
            CUSTOMER: jsonData.CUSTOMER,
            BILLDATE: jsonData.BILLDATE == null ? jsonData.BILLDATE : jsonData.BILLDATE.replace('T', ' '),
            LASTDATE: jsonData.LASTDATE == null ? jsonData.LASTDATE : jsonData.LASTDATE.replace('T', ' '),
            PAYTYPE: jsonData.PAYTYPE,
            BRANCHCODE: jsonData.BRANCHCODE,
            BANKNAME: jsonData.BANKNAME,
            BANKADDRESS: jsonData.BANKADDRESS,
            ACCOUNTNO: jsonData.ACCOUNTNO,
            ISAPPLY: jsonData.ISAPPLY,
            // ISCHECK: jsonData.ISCHECK,
            WTNODES: jsonData.WTNODES
          }
          that.setData({
            BILL: tempResult
          })
          resolve(tempResult)
        }
      })
    }).then(res => {

      var BillID = res.BILLID;
      new Promise((resolve, reject) => {
        wx.request({
          url: wsdlurl + 'GetAccountingDetails',
          data: {
            BillID: BillID,
          },
          method: 'GET',
          header: {
            'content-type': 'application/json'
          },
          // 设置请求的 header
          success: function (res) {
            var resData = res.data;
            var detailArray = [];
            var result = resData.result;
            if (result == "[]") {
              that.setData({
                searchLoadingComplete: true, //把“已加载全部”设为true，显示
              })
            } else {
              result = result + '';
              result = result.replace('[', '');
              result = result.replace(']', '');
              result = result.replace(new RegExp('},{', 'g'), '} , {')
              var resultArray = result.split(' , ')
              for (var j = 0; j < resultArray.length; j++) {
                var ithResult = resultArray[j];
                var jsonData = JSON.parse(ithResult);
                var FeeName = jsonData.FeeName;
                var Currency = jsonData.Currency;
                var Price = jsonData.Price.toFixed(2);
                var detail = {
                  FeeName: FeeName,
                  Currency: Currency,
                  Price: Price,
                  BILLID: jsonData.BILLID
                };
                detailArray.push(detail);
              }
            }
            resolve(detailArray);
            var SHOW = {
              isShowTable: false,
              showImageUrl: '../../images/expand-arrow-down.png'
            }
            var item = {
              BILL: that.data.BILL,
              DETAIL: detailArray,
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

  confirm: function (e) {
    var that = this;
    var index = e.target.dataset.index;
    var itemList = that.data.itemList;
    var BillID = itemList[index].BILL.BILLID;
    var NodeCode = 'Fee_CQK14';//Fee_CQK14
    // var UserCode = app.data.userCode;
    var UserCode = 'VIRTUAL_USER';
    var that = this;
    wx.showModal({
      title: "",
      content: "是否通过该审核",
      success: function (res) {
        if (res.confirm) {
          that.setData({
            searchLoading: true,
          })
          wx.request({
            url: wsdlurl + 'AccountingNodeFinish',
            data: {
              BillID: BillID,
              NodeCode: NodeCode,
              UserCode: UserCode
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
              var result = resData.result;
              var jsonData = JSON.parse(result);
              var info = jsonData.Info;
              var status = jsonData.Status;
              if (status == 0) {
                wx.showToast({
                  title: '审核通过！',
                  icon: 'success',
                  duration: 100000,
                  success: function (res) {
                    wx.redirectTo({
                      url: '../external_billVerify/billVerify',
                    })
                  }
                })
              } else {
                wx.showModal({
                  title: '提示',
                  content: info,
                })
              }
            },
            fail: function () {
              // fail
            },
            complete: function () {
              // complete 
            }
          })
        } else {
        }
      }
    })
  },
  // 弹窗
  remarkInput: function (e) {
    this.setData({
      Remark: e.detail.value
    })
  },

  refuse: function (e) {
    this.setData({
      showModal: true
    })
    this.setData({
      refuseIndex: e.target.dataset.index
    })
  },

  // 弹出框蒙层截断touchmove事件
  preventTouchMove: function () {
  },

  // 隐藏模态对话框
  hideModal: function () {
    this.setData({
      showModal: false
    });
  },

  //对话框取消按钮点击事件
  onCancel: function () {
    this.hideModal();
  },

  //对话框确认按钮点击事件
  onConfirm: function () {
    this.hideModal();
    this.setData({
      searchLoading: true,
    })
    var index = this.data.refuseIndex;
    var itemList = this.data.itemList;
    var BillID = itemList[index].BILL.BILLID;
    var NodeCode = 'Fee_CQK14';
    // var UserCode = app.data.userCode;
    var UserCode = 'VIRTUAL_CUSTOMER_01'
    var Remark = this.data.Remark;
    var that = this;
    wx.request({
      url: wsdlurl + 'CancelAccountingNode',
      data: {
        BillID: BillID,
        NodeCode: NodeCode,
        UserCode: UserCode,
        Remark: Remark
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
        var resData = res.data;
        var result = resData.result;
        var jsonData = JSON.parse(result);
        var info = jsonData.Info;
        var status = jsonData.Status;
        if (info == "" || info == null || info == []) {
          wx.showToast({
            title: '驳回成功',
            icon: 'success',
            duration: 2000,
            success: function (res) {
              wx.redirectTo({
                url: '../external_billVerify/billVerify',
              })
            }
          })
        } else {
          wx.showModal({
            title: '提示',
            content: info,
          })
        }
      },
      fail: function () {
        // fail
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
    var time = utils.formatTime1(new Date());
    this.setData({
      userinfonickname: app.data.userName,
      screenHeight: wx.getSystemInfoSync().windowHeight,
      beginDate: time,
      endDate: time,
      hasBinding: app.globalData.hasBinding,
      BILLID:options.BILLID,
      isValidate:options.isValidate,
    })
    this.getData();
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