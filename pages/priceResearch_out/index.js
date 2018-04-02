//index.js
//获取应用实例
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

function formatDate(timeS) {
  var year = timeS.substring(0, 4)
  year = parseInt(year)
  var mon = timeS.substring(5, 7)
  mon = parseInt(mon)
  console.log('mon:' + mon)
  //传参日期为输入的完货日期+2
  var day = timeS.substring(8, 10)
  console.log('day:' + day)
  day = parseInt(day);
  day += 2
  console.log('day:' + day)
  if (mon == 1 || mon == 3 || mon == 5 || mon == 7 || mon == 8 || mon == 10 || mon == 12) {
    if (day > 31) {
      mon++;
      day -= 31;
    }
  } else if (mon == 2) {
    if (year % 4 == 0 && year % 100 != 0 || year % 400 == 0) {
      if (day > 29) {
        mon++;
        day -= 29;
      }
    } else {
      if (day > 28) {
        mon++;
        day -= 28;
      }
    }
  }
  else {
    if (day > 30) {
      mon++;
      day -= 30;
    }
  }
  if (mon < 10) mon = "0" + mon
  if (day < 10) day = "0" + day
  return year + "-" + mon + "-" + day
}

Page({
  data: {
    // currentdate: utils.formatDate(new Date()),
    count: 0,
    search: false,
    pricelist: [],
    packageType: app.data.packageType,
    unit_index: app.data.unit_index,
    num20gp: app.data.num20gp,
    num40gp: app.data.num40gp,
    num40hc: app.data.num40hc,
    start_port: app.data.start_port,
    des_port: app.data.des_port,
    start_port_eng: app.data.start_port_eng,
    des_port_eng: app.data.des_port_eng,
    date: app.data.date,
    isChangeDate:false,
    weight: app.data.weight,
    vol: app.data.vol,
    num: app.data.num,
    open: false,
    mark: 0,
    newmark: 0,
    startmark: 0,
    endmark: 0,
    windowWidth: wx.getSystemInfoSync().windowWidth,
    staus: 1,
    translate: '',
    userinfoavatar: '../../images/userImage.jpg',
    userinfonickname: '',
    showModalStatus: false,
    arr: [1, 2, 3, 4, 5],
    showLoading:true,
    searchLoading: true, //"上拉加载"的变量，默认false，隐藏
    searchLoadingComplete: false,  //“没有数据”的变量，默认false，隐藏
    // 绑定与解除绑定进度
    isBinding: false,
    isUnbinding: false,
    hasBinding: getApp().globalData.hasBinding
  },

  changePort: function () {
    console.log(this.data.des_port)
    wx.switchTab({
      url: '../port_select_out/port_select_out',
    })
  },

  tap_ch: function (e) {
    this.setData(
      {
        showModalStatus: true,
        cover: false,
        search: false
      }
    );
    if (this.data.search) {
      this.setData({
        search: false
      });
    }
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
    wx.navigateTo({
      url: '../declare/feedback',
    })
  },

  supplierPriceResearch: function (e) {
    wx.navigateTo({
      url: '../priceResearch/index',
    })
  },

  binding: function (e) {
    this.setData({
      isBinding: true
    })
    console.log(this.data.isBinding)
    var app = getApp();
    var that = this;
    wx.login({
      success: function (loginCode) {
        //method中设置你想调用的方法名
        var method = 'ContactCompanyBll_GetOpenID';
        //datacopy中拼字符串，即http传输中的soap信息
        var addstring = '<ContactCompanyBll_GetOpenID xmlns="http://tempuri.org/">' +
          '<LoginCode>' + loginCode.code + '</LoginCode>' +
          '</ContactCompanyBll_GetOpenID>';
        var datacopy = '<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">' +
          '<Header />' +
          '<Body>' +
          addstring +
          '</Body>' +
          '</Envelope>';
        new Promise((resolve, reject) => {
          wx.request({
            url: wsdlurl,
            data: datacopy,
            method: 'POST',
            header: {
              'content-type': 'text/xml; charset=utf-8',
              'SOAPAction': targetNamespace + method,
            },
            // 设置请求的 header
            success: function (res) {
              // success
              var resData = res.data;
              var XMLParser = new Parser.DOMParser();
              var doc = XMLParser.parseFromString(resData, function (response) { });
              var result = doc.getElementsByTagName("ContactCompanyBll_GetOpenIDResult");
              console.log(resData)
              var tempResult = result[0]
              var nodeValue = null;
              if (tempResult.childNodes.length != 0) {
                nodeValue = tempResult.firstChild.nodeValue;
                resolve(nodeValue)
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
            },
            complete: function () {
              // complete 
            }
          })
        }).then(res => {
          //method中设置你想调用的方法名
          var method = 'ContactCompanyBll_BindingOpenID';
          //datacopy中拼字符串，即http传输中的soap信息
          var addstring = '<ContactCompanyBll_BindingOpenID xmlns="http://tempuri.org/">' +
            '<UserID>' + app.data.USERID + '</UserID>' +
            '<OpenID>' + res + '</OpenID>' +
            '<UserFlag>' + app.data.userflag + '</UserFlag>' +
            '</ContactCompanyBll_BindingOpenID>';
          var datacopy = '<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">' +
            '<Header />' +
            '<Body>' +
            addstring +
            '</Body>' +
            '</Envelope>';
          var openid = res;
          wx.request({
            url: wsdlurl,
            data: datacopy,
            method: 'POST',
            header: {
              'content-type': 'text/xml; charset=utf-8',
              'SOAPAction': targetNamespace + method,
            },
            // 设置请求的 header
            success: function (res) {
              // success
              var resData = res.data;
              var XMLParser = new Parser.DOMParser();
              var doc = XMLParser.parseFromString(resData, function (response) { });
              var result = doc.getElementsByTagName("ContactCompanyBll_BindingOpenIDResult");
              var nodeValue = result[0].firstChild.nodeValue;
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
      isUnbinding: true })
    var that = this;
    var app = getApp();
    //method中设置你想调用的方法名
    var method = 'ContactCompanyBll_BindingOpenID';
    //datacopy中拼字符串，即http传输中的soap信息
    var addstring = '<ContactCompanyBll_BindingOpenID xmlns="http://tempuri.org/">' +
      '<UserID>' + app.data.USERID + '</UserID>' +
      '<OpenID>' + '' + '</OpenID>' +
      '<UserFlag>' + app.data.userflag + '</UserFlag>' +
      '</ContactCompanyBll_BindingOpenID>';
    var datacopy = '<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">' +
      '<Header />' +
      '<Body>' +
      addstring +
      '</Body>' +
      '</Envelope>';
    wx.request({
      url: wsdlurl,
      data: datacopy,
      method: 'POST',
      header: {
        'content-type': 'text/xml; charset=utf-8',
        'SOAPAction': targetNamespace + method,
      },
      // 设置请求的 header
      success: function (res) {
        // success
        var resData = res.data;
        var XMLParser = new Parser.DOMParser();
        var doc = XMLParser.parseFromString(resData, function (response) { });
        var result = doc.getElementsByTagName("ContactCompanyBll_BindingOpenIDResult");
        var nodeValue = result[0].firstChild.nodeValue;
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
  },

  onShow: function () {
    this.setData({
      hasBinding: getApp().globalData.hasBinding
    })
  },

  search: function () {
    if (search = true) {
    }
  },

  addressPage: function () {
    wx.navigateTo({
      url: '../address/address',
    })
  },

  getback: function (e) {
    this.setData({
      cover: false,
      search: false
    })
  },

  bindTimeChange: function (e) {
    this.setData({
      date: e.detail.value,
      isChangeDate:true
    })
  },

  bindUnitChange: function (e) {
    this.setData({
      unit_index: e.detail.value
    })
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
    console.log(temp)
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
    var temp = this.data.num40gp
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
    var temp = this.data.num40hc
    temp++
    this.setData({
      num40hc: temp
    })
  },

  tap_search: function (e) {
    if (!this.data.search) {
      this.setData({
        search: true,
      })
    } else {
      this.setData({
        search: false
      })
    }
  },

  search_price: function (e) {
    //查询运价
    this.getPrice();
    this.setData({
      search: false,
    })
  },

  getPrice: function () {
    var that = this
    var predicate = '';
    var values = '';
    // 起始港
    predicate += 'PORTLOADING==@0 ';
    values += this.data.start_port_eng
    // 目的港
    predicate += 'and PORTDISCHARGE==@1 '
    values += ',' + this.data.des_port_eng
    // 完货时间
    if (this.data.isChangeDate == true) {
      predicate += 'and ENDDATE>=MDFunctions.ParseDateTime(@2)';
      var endday = formatDate(this.data.date)
      values += ',' + endday
    }
    //箱量
    var numStr = this.data.num20gp + ',' + this.data.num40gp + ',' + this.data.num40hc;
    wx.request({
      url: wsdlurl + 'GetQuoteFCLList',
      data: {
        predicate: predicate,
        values: values,
        numStr: numStr
      },
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      // 设置请求的 header
      success: function (res) {
        // success
        that.setData({
          showLoading: false
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
        // console.log(nodeValue)
        nodeValue = nodeValue + '';
        nodeValue = nodeValue.replace('[', '');
        nodeValue = nodeValue.replace(']', '');
        nodeValue = nodeValue.replace(new RegExp('},{', 'g'), '} , {');
        var resultArray = nodeValue.split(' , ');
        // console.log('resultArray' + resultArray.length);
        for (var i = 0; i < resultArray.length; i++) {
          var ithResult = resultArray[i];
          var jsonData = JSON.parse(ithResult);
          var OriginalValues = jsonData.OriginalValues;
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
            TotalPrice: jsonData.TotalPrice.toFixed(2),
            BILLID: jsonData.BILLID
          }
          console.log(tempResult)
          array.push(tempResult);
        }
        that.setData({
          pricelist: array,
          searchLoading: false  //把"上拉加载"的变量设为false，隐藏
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
  sharePrice:function(e){
    var index = e.target.dataset.index;
    var pricelist = this.data.pricelist;
    var ithPrice = pricelist[index];
    console.log(ithPrice)
    var BILLID = ithPrice.BILLID;
    console.log(BILLID)
    var that = this;
    wx.navigateTo({
      url: '../shareStatusBackByPrice/shareStatusBackByPrice?BILLID=' + BILLID,
    })
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '查询结果',
    })
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
      packageType: app.data.packageType,
      userinfonickname: app.data.userCode,
    })
    console.log('out:' + this.data.start_port_eng)
    console.log(this.data.des_port_eng)
    this.getPrice();
    console.log(this.data.num20gp)
    console.log(this.data.num40gp)
    console.log(this.data.num40hc)
  }
})
