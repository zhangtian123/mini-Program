var utils = require('../../utils/util.js');
var Parser = require('../../lib/dom-parser');
//wsdlurl中设置需要访问的webservice的url地址
var app = getApp()
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
  data: {
    //左侧栏
    open: false,
    mark: 0,
    newmark: 0,
    startmark: 0,
    endmark: 0,
    windowWidth: wx.getSystemInfoSync().windowWidth,
    screenHeight: wx.getSystemInfoSync().windowHeight,
    staus: 1,
    translate: '',
    userinfoavatar: '../../images/vehicle.png',
    userinfonickname: '',
    showModalStatus: false,
    itemList: [],
    BILLArray: [],
    DETAILArray: [],
    //下拉加载
    searchPageNum: 1,   // 设置加载的第几次，默认是第一次
    callbackcount: app.data.callbackcount,      //返回数据的个数
    searchLoading: true, //"上拉加载"的变量，默认false，隐藏
    searchLoadingComplete: false, //“没有数据”的变量，默认false，隐藏
    // 绑定与解除绑定进度
    isBinding: false,
    isUnbinding: false,
    hasBinding: getApp().globalData.hasBinding,
    predicate: 'TRAILERCOMPANY==@0',
    values: app.data.customer,
    orderByProperty: 'CREATEDATE',
    rowsCount: 0,
  },

  getData: function () {
    this.setData({
      searchLoading: true, //把"上拉加载"的变量设为false，隐藏
      searchLoadingComplete: false
    })
    var that = this
    new Promise(function (resolve, reject) {
      wx.request({
        url: wsdlurl + 'GetDisPatchList',
        data: {
          predicate: that.data.predicate,
          values: that.data.values,
          pageNum: that.data.searchPageNum,
          pageSize: that.data.callbackcount,
          orderByProperty: that.data.orderByProperty,
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
          if (resultArray.length != 0 && resultArray.length < that.data.callbackcount && that.data.itemList.length == 0) {//最后一页
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
              BILLCODE: jsonData.BILLCODE,
              CONTAINERNO: jsonData.CONTAINERNO != null ? jsonData.CONTAINERNO:'',
              SIZE: jsonData.SIZE == null ? '' : jsonData.SIZE,
              TYPE: jsonData.TYPE,
              TRUCKNO: jsonData.TRUCKNO != null ? jsonData.TRUCKNO:'',
              DRIVER: jsonData.DRIVER != null ? jsonData.DRIVER:'',
              TELEPHONE: jsonData.TELEPHONE != null ? jsonData.TELEPHONE:'',
              DETAIL: result
            }
            res.push(tempResult)
          }
          that.setData({
            BILLArray: res
          })
          resolve(res)
        },
        fail: function () {
          wx.showModal({
            title: '提示',
            content: '访问服务器失败',
          })
        }
      })
    }).then(res => {
      var item = [];
      for (var i = 0; i < res.length; i++) {
        var BILL = res[i];
        var BILLID = BILL.BILLID;
        var BILLNO = BILL.BILLNO;
        var BILLCODE = BILL.BILLCODE;
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
              var resData = res.data;
              var result = resData.result;
              var DETAIL = [];
              if (result == "[]") {
                that.setData({
                  searchLoadingComplete: true,
                })
              } else {
                var rowsCount = resData.rowsCount;
                result = result + '';
                result = result.replace('[', '');
                result = result.replace(']', '');
                result = result.replace(new RegExp('},{', 'g'), '} , {')
                var resultArray = result.split(' , ')
                if (resultArray.length == 0 || resultArray == "") {
                  //没有对应的节点数据
                  that.setData({
                    searchLoadingComplete: true, //把“没有数据”设为true，显示
                    searchLoading: false  //把"上拉加载"的变量设为false，隐藏
                  })
                } else {
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
                        NODENAME: jsonData.NODENAME,
                        FINISHEDDATE: jsonData.FINISHEDDATE.replace('T', ' '),
                        IsFinished: jsonData.IsFinished,
                        BILLID: jsonData.BILLID
                      };
                      DETAIL.push(tempResult);
                    } else {
                      var tempResult = {
                        NODECODE: jsonData.NODECODE,
                        NODENAME: jsonData.NODENAME,
                        FINISHEDDATE: jsonData.FINISHEDDATE.replace('T', ' '),
                        IsFinished: jsonData.IsFinished,
                        BILLID: jsonData.BILLID
                      };
                      DETAIL.splice(index, 1, tempResult)
                    }
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
          for (var i = 0; i < BILLArray.length ;i++) {
            for(var j=0;j<detail.length;j++){
              var BILL = BILLArray[i];
              var DETAIL = detail[j];
              if (BILL.BILLID == DETAIL[0].BILLID) {
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

  feedback: function (e) {
    wx.navigateTo({
      url: '../vehicle/vehicle',
    })
  },

  feedbackMain: function (e) {
    var index = e.target.dataset.index;//the index of order
    var data = this.data.itemList;
    var ithData = data[index];
    var detail = ithData.DETAIL;
    var BILL = ithData.BILL;
    var resultIndex = 0;
    var tempNodeCode=null;
    for (var i = 0; i < detail.length; i++) {
      var ithDetail = detail[i];
      if (ithDetail.IsFinished == false) {
        tempNodeCode = null;
        var nodeCode = ithDetail.NODECODE;
        var BILLNO = BILL.BILLNO;
        var BILLID = BILL.BILLID;
        var BILLCODE = BILL.BILLCODE;
        switch (nodeCode) {
          case 'FMS_TCMX01':
          //创建
          case 'FMS_TCMX05':
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
              url: '../vehicle_feedback/index?data=' + data,
            })
            break;
          case 'FMS_TCMX06':
            //派车
            var state = '派车中'
            var data = {
              BILLID: BILLID,
              BILLNO: BILLNO,
              BILLCODE: BILLCODE,
              nodeCode: nodeCode
            }
            data = JSON.stringify(data);//将json转成字符串传值
            wx.navigateTo({
              url: '../vehicle_sendingcar/sendingcar?data=' + data,
            })
            break;
          case 'FMS_TCMX07':
            //提箱
            var state = '提箱中'
            var data = {
              BILLID: BILLID,
              BILLNO: BILLNO,
              BILLCODE: BILLCODE,
              nodeCode: nodeCode
            }
            data = JSON.stringify(data);//将json转成字符串传值
            wx.navigateTo({
              url: '../vehicle_takingbox/feedback-takebox?data=' + data,
            })
            break;
          case 'FMS_TCMX10':
            //到场
            var state = '到场中'
            var data = {
              state: state,
              BILLID: BILLID,
              BILLNO: BILLNO,
              BILLCODE: BILLCODE,
              nodeCode: nodeCode
            }

            data = JSON.stringify(data);//将json转成字符串传值
            wx.navigateTo({
              url: '../vehicle_feedback/index?data=' + data,
            })
            break;
          case 'FMS_TCMX09':
            //装箱
            var state = '装箱中'
            var data = {
              state: state,
              BILLID: BILLID,
              BILLNO: BILLNO,
              BILLCODE: BILLCODE,
              nodeCode: nodeCode
            }
            data = JSON.stringify(data);//将json转成字符串传值
            wx.navigateTo({
              url: '../vehicle_feedback/index?data=' + data,
            })
            break;
          case 'FMS_TCMX08':
            //装完 
            var state = '装完中'
            var data = {
              BILLID: BILLID,
              BILLNO: BILLNO,
              BILLCODE: BILLCODE,
              nodeCode: nodeCode
            }
            data = JSON.stringify(data);//将json转成字符串传值
            wx.navigateTo({
              url: '../vehicle_loaded/loaded?data=' + data,
            })
            break
          case 'FMS_TCMX11':
            //进港
            var state = '进港中'
            var data = {
              state: state,
              BILLID: BILLID,
              BILLNO: BILLNO,
              BILLCODE: BILLCODE,
              nodeCode: nodeCode
            }
            data = JSON.stringify(data);//将json转成字符串传值
            wx.navigateTo({
              url: '../vehicle_feedback/index?data=' + data,
            })
            break;
        }
        break;
      }else{
        tempNodeCode = ithDetail.NODECODE;
      }
    }
    if (tempNodeCode == "FMS_TCMX11") {//如果DETAIL数据都是IsFinished：true
      wx.showModal({
        title: '提示',
        content: '该拖车单已经完成！',
      })
    }
  },

  //左侧栏用户
  tap_ch: function (e) {
    this.setData(
      {
        showModalStatus: true,
        filterSrc: '../../images/filter.png',
        isFiltered: false,
        isChoosed: false
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

  requestFunds: function (e) {
    wx.redirectTo({
      url: '../requestFunds/requestFunds',
    })
  },

  billVerify: function (e) {
    wx.redirectTo({
      url: '../billVerify/billVerify',
    })
  },

  registerVerify: function (e) {
    wx.redirectTo({
      url: '../registerVerify/RegisterVerify',
    })
  },

  leaveVerify: function (e) {
    wx.redirectTo({
      url: '../leaveVerify/leaveVerify',
    })
  },

  priceResearch: function (e) {
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
    app.data.userName = ''
    app.data.userflag = ''
    app.data.unit_index = 0
    app.data.num20gp = 0
    app.data.num40gp = 0
    app.data.num40hc = 0
    app.data.start_port = "厦门"
    app.data.start_port_eng = "XIAMEN"
    app.data.des_port = "名古屋"
    app.data.des_port_eng = "NAGOYA"
    app.data.date = 'yyyy-mm-dd'
    app.data.weight = 0
    app.data.vol = 0
    app.data.num = 0
    app.data.packageType = []
    app.data.allports = []
    app.data.date = utils.formatDate(new Date())
    app.data.weight = 0
    app.data.vol = 0
    app.data.num = 0
    app.data.packageType = []
    app.data.allports = []
    wx.setStorageSync('UserCode', '')
    wx.setStorageSync('Password', '')
    // 跳转到登录界面
    wx.switchTab({
      url: '../login/login',
    })
  },

  onLoad: function () {
    this.setData({
      userinfonickname: app.data.userName,
      predicate: 'TRAILERCOMPANY==@0',
      values: app.data.customer,
      screenHeight: wx.getSystemInfoSync().windowHeight
    })
    wx.setNavigationBarTitle({
      title: '状态反馈',
    })
    this.getData()
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
  },
  refresh: function () {
    let that = this;
    if (!that.data.searchLoading && !that.data.searchLoadingComplete) {
      that.setData({
        searchPageNum: 1 //每次触发上拉事件，把searchPageNum+1
      });
      that.getData();
    }
  }
})