var app = getApp()
var utils = require('../../utils/util.js');
var Promise = require('../../plugins/es6-promise.js')

Promise.prototype.finally = function (callback) {
  let P = this.constructor;
  return this.then(
    value => P.resolve(callback()).then(() => { return value }),
    reason => P.resolve(callback()).then(() => { throw reason })
  );
};

var Parser = require('../../lib/dom-parser');
//wsdlurl中设置需要访问的webservice的url地址
var wsdlurl = app.data.wsdlurl;
var targetNamespace = app.data.targetNamespace;
Page({
  data: {
    open: false,
    mark: 0,
    newmark: 0,
    startmark: 0,
    endmark: 0,
    windowWidth: wx.getSystemInfoSync().windowWidth,
    screenHeight: wx.getSystemInfoSync().windowHeight,
    staus: 1,
    translate: '',
    userinfoavatar: '../../images/declare.png',
    userinfonickname: '',
    showModalStatus: false,
    hasBinding: getApp().globalData.hasBinding,

    itemList: [],
    BILLArray: [],
    DETAILArray: [],

    userCode: null,
    //下拉加载
    searchPageNum: 1,   // 设置加载的第几次，默认是第一次
    callbackcount: app.data.callbackcount,      //返回数据的个数
    searchLoading: true, //"上拉加载"的变量，默认false，隐藏
    searchLoadingComplete: false,  //“没有数据”的变量，默认false，隐藏

    predicate: 'CUSTOMSCOMPANY==@0',
    values: app.data.customer,
    orderByProperty: 'CREATEDATE',
    rowsCount: 0,

    // 绑定与解除绑定进度
    isBinding: false,
    isUnbinding: false,
    hasBinding: getApp().globalData.hasBinding
  },

  tap_ch: function (e) {
    this.setData(
      {
        showModalStatus: true
      }
    );
  },

  tap_view: function (e) {
    this.setData(
      {
        showModalStatus: false
      }
    );
  },

  tap_start: function (e) {
    utils.tap_start(e, this)
  },

  tap_drag: function (e) {
    utils.tap_drag(e, this)
  },

  tap_end: function (e) {
    utils.tap_end(e, this)
  },

  getData: function () {
    this.setData({
      searchLoading: true,  //把"上拉加载"的变量设为false，隐藏
      searchLoadingComplete: false,
    })
    var that = this
    new Promise((resolve, reject) => {
      wx.request({
        url: wsdlurl + 'GetFWDeclarationList',
        data: {
          predicate: that.data.predicate,
          values: that.data.values,
          pageNum: that.data.searchPageNum,
          pageSize: that.data.callbackcount,
          orderByProperty: that.data.orderByProperty,
          rowsCount: that.data.rowsCount
        },
        method: 'GET',
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          that.setData({
            searchLoading: false  //把"上拉加载"的变量设为false，隐藏
          })
          var resData = res.data;
          var result = resData.result;
          if (result == "[]") {
            wx.showToast({
              title: '查询数据完毕',
            })
            that.setData({
              searchLoadingComplete: true, //把“没有数据”设为true，显示
            })
            return;
          }
          result = result + '';
          result = result.replace('[', '');
          result = result.replace(']', '');
          result = result.replace(new RegExp('},{', 'g'), '} , {')
          var resultArray = result.split(' , ')

          var res = [];
          if (resultArray.length != 0 && resultArray.length < that.data.callbackcount && that.data.itemList.length == 0) {
            that.setData({
              searchLoadingComplete: true, //把“没有数据”设为true，显示
            })
          }
          for (var i = 0; i < resultArray.length; i++) {
            var ithResult = resultArray[i];
            var jsonData = JSON.parse(ithResult);
            var tempResult = {
              BILLID: jsonData.BILLID,
              BILLNO: jsonData.BILLNO,
              BILLCODE: jsonData.BILLCODE
            }
            res.push(tempResult);
          }
          that.setData({
            BILLArray: res
          })
          resolve(res);
        },
        fail: function () {
          wx.showModal({
            title: '提示',
            content: '访问服务器失败',
          })
        }
      })
    }).then(res => {
      for (var i = 0; i < res.length; i++) {
        var BILL = res[i];
        var BILLID = BILL.BILLID;
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
            // 设置请求的 header
            success: function (res) {
              // success
              var resData = res.data;
              var result = resData.result;
              var DETAIL = [];
              if (result == "[]") {
                that.setData({
                  searchLoadingComplete: true, 
                })
                return;
              } else {
                var rowsCount = resData.rowsCount;
                result = result + '';
                result = result.replace('[', '');
                result = result.replace(']', '');
                result = result.replace(new RegExp('},{', 'g'), '} , {')
                var resultArray = result.split(' , ')

                var finishNode = [];
                for (var i = 0; i < resultArray.length; i++) {
                  var ithResult = resultArray[i];
                  var jsonData = JSON.parse(ithResult);
                  var NODECODE = jsonData.NODECODE;
                  var index = finishNode.indexOf(NODECODE)
                  if (index == -1) {
                    finishNode.push(NODECODE);
                    var tempResult = {
                      NODECODE: jsonData.NODECODE,
                      FINISHEDDATE: jsonData.FINISHEDDATE.replace('T', ' '),
                      IsFinished: jsonData.IsFinished,
                      BILLID: jsonData.BILLID
                    }
                    DETAIL.push(tempResult);
                  } else {
                    var tempResult = {
                      NODECODE: jsonData.NODECODE,
                      FINISHEDDATE: jsonData.FINISHEDDATE.replace('T', ' '),
                      IsFinished: jsonData.IsFinished,
                      BILLID: jsonData.BILLID
                    }
                    DETAIL.splice(index, 1, tempResult)
                  }
                }
                resolve(DETAIL);
              }
              
            },
            fail: function () {
              wx.showModal({
                title: '提示',
                content: '访问服务器失败',
              })
            }
          })
        }).then(res => {
          var result = that.data.DETAILArray;
          result.push(res);
          that.setData({
            DETAILArray: result
          })
        }).then(res => {
          var item = [];
          var itemList = that.data.itemList;
          var detail = that.data.DETAILArray
          var BILLArray = that.data.BILLArray;
          for(var i=0;i<BILLArray.length;i++){
            for(var j=0;j<detail.length;j++){
              if (BILLArray[i].BILLID == detail[j][0].BILLID){
                var BILL = BILLArray[i];
                var DETAIL = detail[j];
                var tempResult = {
                  BILL: BILL,
                  DETAIL: DETAIL
                }
                var flag = true
                for (var k = itemList.length - 1; k >= 0 && flag; k--) {
                  var str1 = JSON.stringify(itemList[k]);
                  var str2 = JSON.stringify(tempResult);
                  var result = (str1 == str2)
                  if (result == true) {
                    flag = false;
                  }
                }
                if (flag == true) {
                  item.push(tempResult)
                }
              }
            }
          }
          itemList = itemList.concat(item)
          that.setData({
            itemList: itemList
          })
        })
      }
    })
  },

  onLoad: function () {
    wx.setNavigationBarTitle({
      title: '状态反馈',
    })
    this.setData({
      hasBinding: app.globalData.hasBinding,
      userCode: app.data.userCode,
      values: app.data.customer,
      userinfonickname: app.data.userName,
      screenHeight: wx.getSystemInfoSync().windowHeight,
    })
    this.getData()
  },

  feedback: function (e) {
    wx.navigateTo({
      url: '../declare/feedback',
    })
  },

  feedbackMain: function (e) {
    var index = e.target.dataset.index;//the index of order
    var itemList = this.data.itemList;
    var ithItem = itemList[index];
    var BILL = ithItem.BILL;
    var DETAIL = ithItem.DETAIL;

    for (var i = 0; i < DETAIL.length; i++) {
      var ithDetail = DETAIL[i];
      if (ithDetail.IsFinished == false) {
        var nodeCode = ithDetail.NODECODE;
        var BILLID = BILL.BILLID;
        var BILLNO = BILL.BILLNO;
        var BILLCODE = BILL.BILLCODE;
        switch (nodeCode) {
          case 'FMS_BG03':
            //接单
            var state = '接单中'
            var data = {
              state: state,
              BILLID: BILLID,
              BILLNO: BILLNO,
              BILLCODE: BILLCODE,
              nodeCode: nodeCode
            }
            data = JSON.stringify(data);//将json转成字符串传值
            wx.navigateTo({
              url: '../declare_accept_release/index?data=' + data,
            })
            break;
          case 'FMS_BG04':
            // 申报
            var state = '申报中'
            var data = {
              state: state,
              BILLID: BILLID,
              BILLNO: BILLNO,
              BILLCODE: BILLCODE,
              nodeCode: nodeCode
            }
            data = JSON.stringify(data);//将json转成字符串传值
            wx.navigateTo({
              url: '../declaring/declaring?data=' + data,
            })
            break;
          case 'FMS_BG05':
            // 放行
            var state = '放行中'
            var data = {
              state: state,
              BILLID: BILLID,
              BILLNO: BILLNO,
              BILLCODE: BILLCODE,
              nodeCode: nodeCode
            }
            data = JSON.stringify(data);//将json转成字符串传值
            wx.navigateTo({
              url: '../declare_accept_release/index?data=' + data,
            })
            break;
          default:
            break;
        }
        break;
      }
    }

  },

  priceResearch: function () {
    wx.redirectTo({
      url: '../port_select/index',
    })
  },

  binding: function (e) {
    this.setData({
      isBinding: true
    })
    var that = this;
    wx.login({
      success: function (loginCode) {
        new Promise((resolve, reject) => {
          wx.request({
            url: wsdlurl + 'GetOpenID',
            data: {
              LoginCode: loginCode.code
            },
            method: 'GET',
            header: {
              'content-type': 'application/json'
            },
            // 设置请求的 header
            success: function (res) {
              // success
              var resData = res.data;
              var result = resData.result
              if (result != '' && result != null) {
                resolve(result)
              } else {
                that.setData({
                  isBinding: false
                })
                wx.showModal({
                  title: '提示',
                  content: '获取绑定信息失败，请稍后再试！',
                })
                return
              }
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
          var openid = res;
          wx.request({
            url: wsdlurl + 'BindingOpenID',
            data: {
              UserID: app.data.USERID,
              OpenID: openid,
              UserFlag: app.data.userflag
            },
            method: 'GET',
            header: {
              'content-type': 'application/json'
            },
            // 设置请求的 header
            success: function (res) {
              // success
              var resData = res.data;
              var nodeValue = resData.result;
              that.setData({
                isBinding: false
              })
              if (nodeValue == true) {
                wx.showToast
                  ({
                    title: '绑定成功！',
                    icon: 'success',
                    duration: 1200
                  })
                wx.setStorage({
                  key: 'openid',
                  data: openid,
                })
                getApp().globalData.hasBinding = true;
                that.setData({
                  hasBinding: true
                })
              }
              else {
                wx.showToast
                  ({
                    title: '绑定失败！',
                    image: '../../images/fail.png',
                    duration: 1200
                  })
              }
            },
            fail: function () {
              // fail
              that.setData({
                isBinding: false
              })
              wx.showModal({
                title: '提示',
                content: '访问服务器失败',
              })
            },
            complete: function () {
              // complete
              that.setData({
                isBinding: false
              })
            }
          })
        })
      }
    })
  },
  unbinding: function (e) {
    this.setData({
      isUnbinding: true
    })
    var that = this;
    wx.request({
      url: wsdlurl + 'BindingOpenID',
      data: {
        UserID: app.data.USERID,
        OpenID: '',
        UserFlag: app.data.userflag
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
        that.setData({
          isUnbinding: false
        })
        if (nodeValue == true) {
          wx.showToast
            ({
              title: '解绑成功！',
              icon: 'success',
              duration: 1200
            })
          wx.setStorage({
            key: 'openid',
            data: '',
          })
          that.setData({
            hasBinding: false
          })
          getApp().globalData.hasBinding = false;
        }
        else {
          wx.showToast
            ({
              title: '解绑失败！',
              image: '../../images/fail.png',
              duration: 1200
            })
        }
      },
      fail: function () {
        // fail
        that.setData({
          isUnbinding: false
        })
        wx.showModal({
          title: '提示',
          content: '访问服务器失败',
        })
      },
      complete: function () {
        // complete
        that.setData({
          isUnbinding: false
        })
      }
    })
  },

  exit: function (e) {
    //格式化全局变量
    app.data.customer = ''
    app.data.userName = ''
    app.data.userflag = ''
    app.data.unit_index = 0
    app.data.num20gp = 0
    app.data.num40gp = 0
    app.data.num40hc = 0
    app.data.start_port = "上海"
    app.data.start_port_eng = "SHANGHAI"
    app.data.des_port = "迪拜"
    app.data.des_port_eng = "DUBAI"
    app.data.date = utils.formatDate(new Date())
    app.data.weight = 0
    app.data.vol = 0
    app.data.num = 0
    app.data.packageType = []
    app.data.allports = []
    // 跳转到登录界面
    wx.switchTab({
      url: '../login/login',
    })
  },

  onShow: function () {
    this.setData({
      hasBinding: getApp().globalData.hasBinding
    })
  },

  //滚动到底部触发事件
  scrollToLower: function () {
    let that = this;
    if (!that.data.searchLoading && !that.data.searchLoadingComplete) {
      that.setData({
        searchPageNum: that.data.searchPageNum + 1 //每次触发上拉事件，把searchPageNum+1
      });
      that.getData();
    }
  }
})

