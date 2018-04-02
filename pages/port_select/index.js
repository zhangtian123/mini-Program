//index.js
//获取应用实例
var app = getApp()
var timeS = new Date()
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
    showModalStatus: false,
    fromlog: 0,
    userflag: '',
    userinfoavatar: '',
    userinfonickname: '',
    // 绑定与解除绑定进度
    isBinding: false,
    isUnbinding: false,
    hasBinding: getApp().globalData.hasBinding
  },

  getStartPort: function () {
    wx.redirectTo({
      url: '../switchport/switchport?togetStart=1&&fromin=1',
    })
  },

  getDesPort: function () {
    wx.redirectTo({
      url: '../switchport/switchport?togetStart=0&&fromin=1',
    })
  },

  tap_ch: function (e) {
    this.setData(
      {
        showModalStatus: true,
      }
    )
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
    wx.navigateTo({
      url: '../requestFunds/requestFunds',
    })
  },
  internal_OrderTrace: function (e) {
    wx.redirectTo({
      url: '../internal_ordertrace/ordertrace',
    })
  },
  orderTrace: function (e) {
    wx.navigateTo({
      url: '../ordertrace/ordertrace',
    })
  },

  billVerify: function (e) {
    wx.navigateTo({
      url: '../billVerify/billVerify',
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
              if (result!='' && result!=null) {
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
              console.log(nodeValue)
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
        console.log(nodeValue)
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
  orderOnline: function (e) {
    wx.redirectTo({
      url: '../orderOnline/orderOnline',
    })
  },
  orderList: function (e) {
    wx.redirectTo({
      url: '../orderList/orderList',
    })
  },
  exter_billVerify: function (e) {
    wx.navigateTo({
      url: '../external_billVerify/billVerify',
    })
  },

  registerVerify: function (e) {
    wx.navigateTo({
      url: '../registerVerify/RegisterVerify',
    })
  },

  leaveVerify: function (e) {
    wx.navigateTo({
      url: '../leaveVerify/leaveVerify',
    })
  },

  priceResearch: function (e) {
    wx.navigateTo({
      url: '../port_select/index',
    })
  },

  feedback: function (e) {
    if (this.data.userflag == 'TRAILER') {
      wx.navigateTo({
        url: '../vehicle/vehicle',
      })
    }
    else {
      wx.navigateTo({
        url: '../declare/feedback',
      })
    }
  },

  supplierPriceResearch: function (e) {
    wx.navigateTo({
      url: '../priceResearch/index',
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
    //跳转到登录界面
    wx.switchTab({
      url: '../login/login',
    })
    console.log('app.data.date' + app.data.date)
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
      url: '../priceResearch/index',
    })
  },

  getPackageType: function () {
    var predicate = '1==1';
    var values = '';
    var iCounts = 1000000000 ;
    var that = this
    wx.request({
      url: wsdlurl + 'GetPackageType',
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
          console.log(ithResult)
          var jsonData = JSON.parse(ithResult);
          var OriginalValues = jsonData.OriginalValues;
          //包装类型英文名
          var str={
            TYPENAMECH: jsonData.TYPENAMECH,
            TYPENAMEEN:jsonData.TYPENAMEEN
          }
          array.push(str);
        }
        app.data.packageType = array
        that.setData({
          packageType: array
        })
        console.log(app.data.packageType)
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
      hasBinding: app.globalData.hasBinding,
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
      userflag: app.data.userflag,
      userinfonickname: app.data.userName,
    })
    switch (this.data.userflag) {
      case 'CUSTOMER':
        this.setData({
          userinfoavatar: '../../images/exUser.png',
        })
        break;
      case 'USER':
        this.setData({
          userinfoavatar: '../../images/inUser.png',
        })
        break;
      case 'TRAILER':
        this.setData({
          userinfoavatar: '../../images/vehicle.png',
        })
        break;
      case 'DECLARATION':
        this.setData({
          userinfoavatar: '../../images/declare.png',
        })
        break;
    }
    console.log(this.data.userflag)
    if (options.fromlog == 1) {
      this.setData({
        showModalStatus: true
      })
    }
    console.log(this.data.date)
  }
})
