// pages/orderOnline/orderOnline.js
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
    userinfoavatar: '../../images/exUser.png',
    userinfonickname: '',
    showModalStatus: false,
    // 信息
    name: app.data.customer,
    refno: '',
    sale: '',
    sales: [],
    goods_name: '',
    num: -1,
    packagetypes: {},
    packagetype:'',
    weight: -1,
    vol: -1,
    num20gp: 0,
    num40gp: 0,
    num40hc: 0,
    CRD_date: '',
    CRD_time: '',
    CRD: '',
    ETD_date: '',
    ETD_time: '',
    ETD: '',
    start_port: '--请选择或输入--',
    showstartlist: false,
    start: '',
    start_ports: [],
    des_port: '--请选择或输入--',
    showdeslist: false,
    des: '',
    des_ports: [],
    shipcompany: '',
    shipcompanys: {},
    sailline: '',
    saillines: [],
    shipname: '',
    shipnames: [],
    saillinenum: '',
    declare_service: '',
    ds_list: [],
    vehicle_service: '',
    vs_list: [],
    overseas_service: '',
    os_list: [],
    order_loading: false,//提交加载中
  },
  bindDeclareServiceChange: function (e) {
    var t = e.detail.value
    var temp = this.data.ds_list
    this.setData({
      declare_service: temp[t]
    })
  },
  bindOverSeasServiceChange: function (e) {
    var t = e.detail.value
    var temp = this.data.os_list
    this.setData({
      overseas_service: temp[t]
    })
  },
  bindVehicleServiceChange: function (e) {
    var t = e.detail.value
    var temp = this.data.vs_list
    this.setData({
      vehicle_service: temp[t]
    })
  },
  // change装运港
  bindStartPortChange: function (e) {
    var temp = e.currentTarget.dataset.item
    this.setData({
      start_port: temp,
      start_ports: [],
      showstartlist: false,
      start: '',
    })
  },
  // change目的港
  bindDesPortChange: function (e) {
    var temp = e.currentTarget.dataset.item
    this.setData({
      des_port: temp,
      des_ports: [],
      showdeslist: false,
      des: '',
    })
  },
  clearStart: function () {
    if (this.data.showstartlist) {
      this.setData({
        showstartlist: false
      })
    }
  },
  clearDes: function () {
    if (this.data.showdeslist) {
      this.setData({
        showdeslist: false
      })
    }
  },
  // change船公司
  bindShipCompanyChange: function (e) {
    var that = this
    new Promise((resolve, reject) => {
      var t = e.detail.value
      var temp = this.data.shipcompanys
      var old_shipcom = this.data.shipcompany
      that.setData({
        shipcompany: temp[t]
      })
      resolve(old_shipcom)
    }).then(res => {
      this.getSailLine();
      if (res != that.data.shipcompany) {
        this.setData({
          sailline: ''
        })
      }
    })
  },
  // change航线
  bindSailLineChange: function (e) {
    var t = e.detail.value
    var temp = this.data.saillines[t]
    this.setData({
      sailline: temp
    })
  },
  // change船名
  bindShipNameChange: function (e) {
    var t = e.detail.value
    var temp = this.data.shipnames
    this.setData({
      shipname: temp[t]
    })
  },
  // change单位
  bindPackageTypeChange: function (e) {
    var t = e.detail.value
    var temp=this.data.packagetypes[t]
    this.setData({
      packagetype: temp.TYPENAMEEN
    })
  },
  // change销售
  bindSalesChange: function (e) {
    var t = e.detail.value
    var temp = this.data.sales[t]
    this.setData({
      sale: temp.split('|')[1]
    })
  },
  bindCRDDateChange: function (e) {
    var t = e.detail.value
    this.setData({
      CRD_date: t,
    })
    if (this.data.CRD_date != '' && this.data.CRD_time != '') {
      this.setData({
        CRD: this.data.CRD_date + " " + this.data.CRD_time
      })
    }
  },
  bindCRDTimeChange: function (e) {
    var t = e.detail.value
    this.setData({
      CRD_time: t
    })
    if (this.data.CRD_date != '' && this.data.CRD_time != '') {
      this.setData({
        CRD: this.data.CRD_date + " " + this.data.CRD_time
      })
    }
  },
  bindETDDateChange: function (e) {
    var t = e.detail.value
    this.setData({
      ETD_date: t,
    })
    if (this.data.ETD_date != '' && this.data.ETD_time != '') {
      this.setData({
        ETD: this.data.ETD_date + " " + this.data.ETD_time
      })
    }
  },
  bindETDTimeChange: function (e) {
    var t = e.detail.value
    this.setData({
      ETD_time: t
    })
    if (this.data.ETD_date != '' && this.data.ETD_time != '') {
      this.setData({
        ETD: this.data.ETD_date + " " + this.data.ETD_time
      })
    } 
  },
  desc20gp: function (e) {
    var temp = this.data.num20gp
    temp--
    if (temp >= 0) {
      this.setData({
        num20gp: temp
      })
    }
  },

  add20gp: function (e) {
    var temp = this.data.num20gp
    temp++
    this.setData({
      num20gp: temp
    })
  },

  desc40gp: function (e) {
    var temp = this.data.num40gp
    temp--
    if (temp >= 0) {
      this.setData({
        num40gp: temp
      })
    }
  },

  add40gp: function (e) {
    var temp=this.data.num40gp
    temp++
    this.setData({
      num40gp: temp
    })
  },

  desc40hc: function (e) {
    var temp = this.data.num40hc
    temp--
    if (temp >= 0) {
      this.setData({
        num40hc: temp
      })
    }
  },

  add40hc: function (e) {
    var temp=this.data.num40hc
    temp++
    this.setData({
      num40hc: temp
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
    wx.redirectTo({
      url: '../external_billVerify/billVerify',
    })
  },

  priceResearch: function (e) {
    wx.redirectTo({
      url: '../port_select/index',
    })
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
        showModalStatus: false,
      }
    );
  },
  tap_desk:function(){
    this.setData(
      {
        showstartlist:false,
        showdeslist:false
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
    // 跳转到登录界面
    wx.setStorageSync('UserCode', '')
    wx.setStorageSync('Password', '')
    wx.switchTab({
      url: '../login/login',
    })
  },
  // 获取客户名称
  getName: function (e) {
    var temp = e.detail.value
    this.setData({
      name: temp
    })
  },
  // 获取客户委托号
  getRefno: function (e) {
    var temp = e.detail.value
    this.setData({
      refno: temp
    })
  },
  // 获取货物名称
  getGoodsName: function (e) {
    var temp = e.detail.value
    this.setData({
      goods_name: temp
    })
  },
  // 获取货物件数
  getNum: function (e) {
    var temp = e.detail.value
    this.setData({
      num: temp
    })
  },
  // 获取毛重
  getWeight: function (e) {
    var t = e.detail.value
    this.setData({
      weight: t
    })
  },
  // 获取体积
  getVol: function (e) {
    var t = e.detail.value
    this.setData({
      vol: t
    })
  },
  // 获取销售list
  getSalesList: function () {
    var that = this
    new Promise((resolve, reject) => {
      wx.request({
        url: wsdlurl + 'GetRoleUsers',
        data: {
          billCode: "FMS_OD",
          roleCode: "SALES",
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
          var array = []
          for (var i = 0; i < resultArray.length; i++) {
            var ithResult = resultArray[i];
            var jsonData = JSON.parse(ithResult);
            var OriginalValues = jsonData.OriginalValues;
            //包装类型英文名
            array.push(jsonData.USERNAME + '|' + jsonData.USERCODE);
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
      this.setData({
        sales: res
      })
    })
  },
  // 获取装运港
  getStartPort: function (e) {
    var that = this
    var t = e.detail.value

    var predicate = 'PORTTYPE==@0 AND NAMEEN.CONTAINS(@1) '
    var values = 'shipping,' + t
    var iCounts = 5
    new Promise((resolve, reject) => {
      wx.request({
        url: wsdlurl + 'GetPorts',
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
          var array = []
          array.push('--请选择或输入--')
          for (var i = 0; i < resultArray.length; i++) {
            var ithResult = resultArray[i];
            var jsonData = JSON.parse(ithResult);
            var OriginalValues = jsonData.OriginalValues;
            //包装类型英文名
            array.push(jsonData.NAMECH + '|' + jsonData.NAMEEN);
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
      that.setData({
        start_ports: res,
        showstartlist: true
      })
    })
  },
  // 获取目的港
  getDesPort: function (e) {
    var that = this
    var t = e.detail.value

    var predicate = 'PORTTYPE==@0 AND NAMEEN.CONTAINS(@1) '
    var values = 'shipping,' + t
    var iCounts = 5
    new Promise((resolve, reject) => {
      wx.request({
        url: wsdlurl + 'GetPorts',
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
          var array = []
          array.push('--请选择或输入--')
          for (var i = 0; i < resultArray.length; i++) {
            var ithResult = resultArray[i];
            var jsonData = JSON.parse(ithResult);
            var OriginalValues = jsonData.OriginalValues;
            //包装类型英文名
            array.push(jsonData.NAMECH + '|' + jsonData.NAMEEN);
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
      that.setData({
        des_ports: res,
        showdeslist: true
      })
    })
  },
  // 获取船公司
  getShipCompany: function () {
    var that = this

    var predicate = 'TYPECODE==@0'
    var values = 'ShipOwner'
    var iCounts = 100

    new Promise((resolve, reject) => {
      wx.request({
        url: wsdlurl + 'GetCustomers',
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

          var array = []
          for (var i = 0; i < resultArray.length; i++) {
            var ithResult = resultArray[i];
            var jsonData = JSON.parse(ithResult);
            var OriginalValues = jsonData.OriginalValues;
            //包装类型英文名
            array.push(jsonData.SHORTNAME);
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
      if (res.length == 0) {
        wx.showModal({
          title: '提示',
          content: '无可选船公司',
        })
        return
      }
      that.setData({
        shipcompanys: res
      })
    })

  },
  // 获取航线
  getSailLine: function (e) {
    var that = this
    var shipcom = this.data.shipcompany
    if (shipcom == '' || shipcom == null) {
      this.setData({
        saillines: []
      })
      wx.showModal({
        title: '提示',
        content: '请先选择船公司',
      })
      return
    }

    var predicate = 'SHIPOWNER==@0'
    var values = shipcom
    var iCounts = 100

    new Promise((resolve, reject) => {
      wx.request({
        url: wsdlurl + 'GetSailLines',
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

          var array = []

          for (var i = 0; i < resultArray.length; i++) {
            var ithResult = resultArray[i];
            var jsonData = JSON.parse(ithResult);
            var OriginalValues = jsonData.OriginalValues;
            //包装类型英文名
            var str = {
              LINECNNAME: jsonData.LINECNNAME,
              SAILCODE: jsonData.SAILCODE
            }
            array.push(str);
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
      if (res.length == 0) {
        wx.showModal({
          title: '提示',
          content: '无可选航线',
        })
        return
      }
      that.setData({
        saillines: res
      })
    })

  },
  // 获取船名
  getShipName: function (e) {
    var that = this

    var predicate = '1==1'
    var values = ""
    var iCounts = 100

    new Promise((resolve, reject) => {
      wx.request({
        url: wsdlurl + 'GetShips',
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
          var array = []
          for (var i = 0; i < resultArray.length; i++) {
            var ithResult = resultArray[i];
            var jsonData = JSON.parse(ithResult);
            var OriginalValues = jsonData.OriginalValues;
            //包装类型英文名
            var str = {
              NAMEEN: jsonData.NAMEEN,
              SHIPCODE: jsonData.SHIPCODE
            }
            array.push(str);
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
      if (res.length == 0) {
        wx.showModal({
          title: '提示',
          content: '无可选船名',
        })
        return
      }
      that.setData({
        shipnames: res
      })
    })
  },
  // 获取航次
  getSailLineNum: function (e) {
    this.setData({
      saillinenum: e.detail.value
    })
  },
  // 获取服务
  getService: function (codeType) {
    var that = this
    var predicate = "CODETYPE ==@0"
    var values = codeType
    var iCounts = 100
    new Promise((resolve, reject) => {
      wx.request({
        url: wsdlurl + 'GetBaseCodes',
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
          var array = []
          for (var i = 0; i < resultArray.length; i++) {
            var ithResult = resultArray[i];
            var jsonData = JSON.parse(ithResult);
            var OriginalValues = jsonData.OriginalValues;
            //包装类型英文名
            array.push(jsonData.CODEATTRNAME);
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
      if (res.length == 0) {
        wx.showModal({
          title: '提示',
          content: '无可选信息',
        })
        return
      }
      switch (codeType) {
        case "DECLARATIONTYPE":
          that.setData({
            ds_list: res
          });
          break;
        case "DESTSERVICETYPE":
          that.setData({
            os_list: res
          });
          break;
        case "TRAILERTYPE":
          that.setData({
            vs_list: res
          });
          break;
      }
    })

  },
  // 下单
  placeOrder: function () {
    var name = this.data.name
    var refno = this.data.refno
    var sale = this.data.sale

    var goods_name = this.data.goods_name
    var weight = this.data.weight==-1?'':this.data.weight
    var vol = this.data.vol==-1?'':this.data.vol
    var num = this.data.num==-1?'':this.data.num
    var packagetype = this.data.packagetype
    var num20gp = this.data.num20gp
    var num40gp = this.data.num40gp
    var num40hc = this.data.num40hc
    var CRD = this.data.CRD
    var ETD = this.data.ETD

    var start_port = this.data.start_port
    if (start_port == '--请选择或输入--') { start_port = '' }
    var des_port = this.data.des_port
    if (des_port == '--请选择或输入--') { des_port = '' }
    var shipcom = this.data.shipcompany
    var sailline = this.data.sailline.SAILCODE
    var shipname = this.data.shipname.SHIPCODE
    var saillinenum = this.data.saillinenum

    var declare_service = this.data.declare_service
    var vehicle_service = this.data.vehicle_service
    var overseas_service = this.data.overseas_service


    if (sale == null || sale == "") {
      wx.showModal({
        title: '提示',
        content: '销售不可为空',
        duration: 100000
      })
      return
    }
    var that = this
    this.setData({
      order_loading: true
    })
    var shippingOrder = {
      REQUESTER:name,
      REFNO: refno,
      SALES: sale,
      CARGONAME: goods_name,
      CTNS: num,
      PACK: packagetype,
      WEIGHT: weight,
      MEASURE: vol,
      CARGOREADDATE: CRD,
      SEA_ETD: ETD,
      SEA_ORIGINPORT: start_port,
      SEA_DISCHARGEPORT: des_port,
      SEA_SAILLINE: sailline,
      SEA_VESSEL: shipname,
      SEA_VOYNO: saillinenum,
      SEA_SHIPOWNER: shipcom,
      CONTAINERTUE1: num20gp,
      CONTAINERTUE2: num40gp,
      CONTAINERTUE3: num40hc,
      BGTYPE: declare_service,
      TCTYPE: vehicle_service,
      HYFWTYPE: overseas_service
    }


    wx.request({
      url: wsdlurl + 'PlaceShippingOrder',
      data: {
        order: JSON.stringify(shippingOrder)
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      // 设置请求的 header
      success: function (res) {
        // success
        that.setData({
          order_loading: false
        })
        var resData = res.data;
        var result = resData.result;
        result = JSON.parse(result)
        var status = result.Status
        var info = result.Info
        if (status == 0) {
          wx.showToast({
            title: '下单成功',
            icon: 'success',
            duration: 1000
          })
          wx.redirectTo({
            url: '../port_select/index?fromlog=1',
          })
        } else {
          wx.showModal({
            title: '' + info,
            duration: 100000
          })
        }
      },
      fail: function () {
        // fail
        that.setData({
          order_loading: false
        })
        wx.showModal({
          title: '提示',
          content: '访问服务器失败',
        })
      },
      complete: function () {
        // complete 
        that.setData({
          order_loading: false
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取销售list
    this.getSalesList();
    this.getShipCompany();
    this.getShipName();
    this.getService("DECLARATIONTYPE");
    this.getService("DESTSERVICETYPE");
    this.getService("TRAILERTYPE");
    // 获取单位list
    var arr = app.data.packageType

    this.setData({
      name: app.data.customer,
      packagetypes: arr,
      start_port: '--请选择或输入--',
      des_port: '--请选择或输入--',
    })
    wx.setNavigationBarTitle({
      title: '在线下单',
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

  }
})