// template/billVerify/billVerify.js
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
  //页面的初始数据
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
    userinfoavatar: '../../images/inUser.png',
    userinfonickname: '',
    showModalStatus: false,
    //右侧栏过滤
    isFiltered: false,
    filterSrc: '../../images/filter.png',
    date: '',
    radioBeginDate: '',
    beginDate: '',
    endDate: '',
    //类别选择
    isChoosed: false,
    typeIndex: 1,
    typeData: ['全部分类', '未开航', '历史记录'],
    itemList: [],
    BILLArray: [],
    DETAILArray: [],
    OrderID: '',
    //账单
    isShowTable: false,
    showImageUrl: '../../images/expand-arrow-down.png',
    //筛选条件
    filterTypeData: ['订单号', '客户委托号', 'SO NO', 'H/BL NO'],
    filterTypeIndex: 0,
    filterIsChoosed: false,
    predicate: 'IsSail==false',
    values: '',
    orderByProperty: 'BILLNO',
    //下拉加载
    searchPageNum: 1,   // 设置加载的第几次，默认是第一次
    callbackcount: app.data.callbackcount,       //返回数据的个数
    searchLoading: true, //"上拉加载"的变量，默认false，隐藏
    searchLoadingComplete: false,  //“没有数据”的变量，默认false，隐藏
    // 绑定与解除绑定进度
    isBinding: false,
    isUnbinding: false,
    hasBinding: getApp().globalData.hasBinding
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
          values: that.data.values,
          pageNum: that.data.searchPageNum,
          pageSize: that.data.callbackcount,
          orderByProperty: that.data.orderByProperty,
          userCode: app.data.userCode
        },
        method: 'GET',
        header: {
          'content-type': 'application/json'
        },
        // 设置请求的 header
        success: function (res) {
          // success
          that.setData({
            searchLoading: false  //把"上拉加载"的变量设为false，隐藏
          })
          var resData = res.data;
          var result = resData.result;
          if (result == "[]") {
            that.setData({
              searchLoadingComplete: true, //把“没有数据”设为true，显示
            })
            wx.showToast({
              title: '查询数据完毕',
            })
            return;
          }
          result = result + '';
          result = result.replace('[', '');
          result = result.replace(']', '');
          var first = result.substring(result.lastIndexOf(']') + 1);
          var last = result.substring(0, result.lastIndexOf(']'));
          result = first + last;
          result = result.replace(new RegExp('},{', 'g'), '} $%,%$ {')
          var resultArray = result.split(' $%,%$ ')

          var res = [];
          if (resultArray.length != 0 && resultArray.length < that.data.callbackcount && that.data.itemList.length == 0) {
            that.setData({
              searchLoadingComplete: true, //把“没有数据”设为true，显示
            })
          }
          for (var i = 0; i < resultArray.length; i++) {
            var ithResult = resultArray[i];
            var jsonData = JSON.parse(ithResult);
            var OriginalValues = jsonData.OriginalValues;
            //获取账单ID，账单号，总金额币别，总金额，提交日期，最迟处理日期，往来单位，支付方式，银行，银行账号
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
            res.push(tempResult)
          }
          that.setData({
            BILLArray: res
          })
          resolve(res)
        }
      })
    }).then(res => {
      var nodeCode = ['FMS_SO01', 'FMS_SO04',
        'FMS_SO47', 'FMS_SO48', 'FMS_SO52', 'FMS_SO51', 'FMS_SO50', 'FMS_SO49', 'FMS_SO53', 'FMS_SO12', 'FMS_SO09', 'FMS_SO54']
      var item = [];
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
              resolve(TRACE);
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
          var itemList = that.data.itemList
          var detail = that.data.DETAILArray
          var BILLArray = that.data.BILLArray;
          for (var i = 0; i < BILLArray.length; i++) {
            for (var j = 0; j < detail.length; j++) {
              var ORDER = BILLArray[i];
              var ORDERTRACE = detail[j];
              if (ORDER.BILLID == ORDERTRACE[0].BILLID) {
                var SHOW = {
                  isShowTable: false,
                  showImageUrl: '../../images/expand-arrow-down.png'
                }
                var tempResult = {
                  ORDER: ORDER,
                  ORDERTRACE: ORDERTRACE,
                  SHOW: SHOW
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
  chooseTypeList: function () {
    if (this.data.isChoosed) {
      this.setData({
        isChoosed: false
      });
    } else {
      this.setData({
        isChoosed: true
      });
    }
    if (this.data.isFiltered) {
      this.setData({
        filterSrc: '../../images/filter.png',
        isFiltered: false
      });
    }
  },

  filterSelectType: function (e) {
    this.setData({
      filterTypeIndex: e.currentTarget.dataset.index
    });
    this.chooseFilterList();
  },

  chooseFilterList: function () {
    if (this.data.filterIsChoosed) {
      this.setData({
        filterIsChoosed: false
      });
    } else {
      this.setData({
        filterIsChoosed: true
      });
    }
  },
  closeTypeList: function () {
    if (this.data.isChoosed) {
      this.setData({
        isChoosed: false
      });
    }
  },
  selectType: function (e) {
    this.setData({
      typeIndex: e.currentTarget.dataset.index
    });
    this.chooseTypeList();
    var typeIndex = this.data.typeIndex;
    var typeData = this.data.typeData;// typeData: ['全部分类', '待审核', '已审核'],
    var typeDetail = typeData[typeIndex];
    var pre = '';
    switch (typeDetail) {
      case '全部分类':
        pre = ''
        break;
      case '未开航':
        pre = 'IsSail==false'
        break;
      case '历史记录':
        pre = 'IsSail==true'
        break;
      default:
        break;
    }
    this.setData({
      BILLArray: [],
      DETAILArray: [],
      itemList: [],
      searchPageNum: 1,
      predicate: pre,
      values: '',
    })
    this.getData();
  },

  table_show: function (e) {
    var index = e.target.dataset.index;
    var itemList = this.data.itemList;
    var ithItem = itemList[index];
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
    itemList[index] = ithItem;
    this.setData({
      itemList: itemList
    })
  },

  //弹出框蒙层截断touchmove事件
  preventTouchMove: function () {
  },

  //隐藏模态对话框
  hideModal: function () {
    this.setData({
      showModal: false
    });
  },

  //对话框确认按钮点击事件
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
  shareOrder: function (e) {
    var index = e.target.dataset.index;
    var itemList = this.data.itemList;
    var ithItem = itemList[index];
    var BILLID = ithItem.ORDER.BILLID;
    var that = this;

    new Promise(function (resolve, reject) {
      wx.request({
        url: wsdlurl + 'SetOcShareLog',
        data: {
        },
        method: 'GET',
        header: {
          'content-type': 'application/json'
        },
        // 设置请求的 header
        success: function (res) {
          var resData = res.data;
          var result = resData.result;
          resolve(result);
        }
      })
    }).then(sid => {
      if (sid != '') {
        wx.request({
          url: wsdlurl + 'ValidOcShareLog',
          data: {
            shareId: sid,
            hours: 48
          },
          method: 'GET',
          header: {
            'content-type': 'application/json'
          },
          // 设置请求的 header
          success: function (res) {
            var resData = res.data;
            var result = resData.result;
            var response = null;
            if (result == true) {
              response = 1;
            } else {
              response = 0;
            }
            if (response == 1) {
              var isValidate = true;
              if (app.data.customer) {
                // 自己分享的内容
                isValidate = false;
              }
              else {
                //重定向之后，打开的
              }
              wx.navigateTo({
                url: '../shareStatusBackByOrder/shareStatusBackByOrder?isValidate=' + isValidate + '&BILLID=' + BILLID
              })
            }
            else {
              wx.navigateTo({
                url: '../shareStatusBackInvalid/shareStatusBackInvalid',
              })
            }
          }
        })
      }
    })
  },
  registerVerify: function (e) {
    wx.redirectTo({
      url: '../registerVerify/RegisterVerify',
    })
  },
  internal_OrderTrace: function (e) {
    wx.redirectTo({
      url: '../internal_ordertrace/ordertrace',
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

  onShow: function () {
    this.setData({
      hasBinding: getApp().globalData.hasBinding
    })
  },

  //右侧过滤器
  //点击时间组件确定事件  
  bindBeginDateChange: function (e) {
    if (e.detail.value > this.data.endDate) {
      utils.timeError();
    } else {
      this.setData({
        beginDate: e.detail.value
      })
    }
  },

  //点击时间组件确定事件  
  bindEndDateChange: function (e) {
    if (e.detail.value < this.data.beginDate) {
      utils.timeError();
    } else {
      this.setData({
        endDate: e.detail.value
      })
    }
  },

  filter: function () {
    if (this.data.isChoosed) {
      this.setData({
        isChoosed: false
      });
    }
    if (this.data.isFiltered) {
      this.setData({
        filterSrc: '../../images/filter.png',
        isFiltered: false
      });
    } else {
      this.setData({
        filterSrc: '../../images/filter-filled.png',
        isFiltered: true,
        showModalStatus: false
      });
    }
  },

  filterConfirm: function () {
    this.setData({
      filterSrc: '../../images/filter.png',
      isFiltered: false,
      typeIndex: 0
    })
    //格式"2017-11-21T15:38:38"
    var beginDate = utils.beginFormatTime(this.data.beginDate, new Date());
    var endDate = utils.endFormatTime(this.data.endDate, new Date());
    var time = utils.formatTime1(new Date());
    var pre = '';
    var v = '';
    if (this.data.OrderID != '') {
      switch (this.data.filterTypeData[this.data.filterTypeIndex]) {
        case '订单号':
          pre = pre + ' and ORDERNO'
          break;
        case '客户委托号':
          pre = pre + ' and REFNO'
          break;
        case 'SO NO':
          pre = pre + ' and BOOKINGNO'
          break;
        case 'H/BL NO':
          pre = pre + ' and HBLNO'
          break;
        default:
          break;
      }
      pre = pre + '==\"' + this.data.OrderID + '\"'
      this.setData({
        OrderID: ''
      })
    }
    else if (this.data.beginDate != time) {//如果自定义了时间，则以自定义为准
      pre = pre + ' and ETA>= MDFunctions.ParseDateTime(@1) and MDFunctions.ParseDateTime(@2)>= ETA ';
      v = v + ',' + beginDate + "," + endDate;
    }
    this.setData({
      BILLArray: [],
      DETAILArray: [],
      itemList: [],
      searchPageNum: 1,
      predicate: pre,
      values: v
    })
    this.getData();
  },

  orderTrace: function (e) {
    wx.redirectTo({
      url: '../ordertrace/ordertrace',
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

  OrderIDInput: function (e) {
    this.setData({
      OrderID: e.detail.value
    })
  },

  filter_view: function () {
    this.setData({
      filterSrc: '../../images/filter.png',
      isFiltered: false
    })
  },

  onLoad: function () {
    var time = utils.formatTime1(new Date());
    this.setData({
      hasBinding: app.globalData.hasBinding,
      values: app.data.customer,
      userinfonickname: app.data.userName,
      screenHeight: wx.getSystemInfoSync().windowHeight,
      beginDate: time,
      endDate: time,
    })
    wx.setNavigationBarTitle({
      title: '订单跟踪',
    })
    this.getData();
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