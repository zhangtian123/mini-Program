// template/billVerify/billVerify.js
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
    userinfoavatar: '../../images/exUser.png',
    userinfonickname: '',
    showModalStatus: false,

    //右侧栏过滤
    isFiltered: false,
    filterSrc: '../../images/filter.png',
    filterRadioButton: ['过去一周', '过去一个月', '过去三个月', '过去半年','自定义'],
    date: '',
    radioBeginDate: '',
    isSelfDefineTime: false,
    beginDate: '',
    endDate: '',

    //类别选择
    isChoosed: false,
    typeIndex: 1,
    typeData: ['全部分类', '待确认', '已确认'],
    itemList: [],
    BILLArray: [],
    DETAILArray: [],

    //账单
    isShowTable: false,
    showImageUrl: '../../images/expand-arrow-down.png',
    tableData: [
      { 'id': '1', 'name': '报关费', 'type': 'XX', 'number': 'XX' },
      { 'id': '2', 'name': '拖车费', 'type': 'XX', 'number': 'XX' },
      { 'id': '3', 'name': '合计', 'type': 'XX', 'number': 'XX' }
    ],

    //驳回弹窗
    showModal: false,
    showModalText: "驳回该账单",
    hasBinding: getApp().globalData.hasBinding,
    Remark: '',

    //下拉加载
    searchPageNum: 1,   // 设置加载的第几次，默认是第一次
    callbackcount: app.data.callbackcount,      //返回数据的个数
    searchLoading: true, //"上拉加载"的变量，默认false，隐藏
    searchLoadingComplete: false,  //“没有数据”的变量，默认false，隐藏

    predicate: 'CUSTOMER==@0 and DUNNINGORREQUESTS==@1 and NODECODE==@2 ',
    values: app.data.customer +',Dunning,Fee_CQK14',
    orderByProperty: 'BILLDATE',
    rowsCount: 0,

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
          // success
          var resData = res.data;
          var result = resData.result;
          if (result == "[]") {
            that.setData({
              searchLoadingComplete: true, //把“没有数据”设为true，显示
            })
            wx.showToast({
              title: '查询数据完毕',
            })
            return
          }
          var rowsCount = resData.rowsCount;
          result = result + '';
          result = result.replace('[', '');
          result = result.replace(']', '');
          result = result.replace(new RegExp('},{', 'g'), '} , {')
          var resultArray = result.split(' , ')

          if (resultArray.length != 0 && resultArray.length < that.data.callbackcount && that.data.itemList.length == 0) {
            that.setData({
              searchLoadingComplete: true, //把“没有数据”设为true，显示
            })
          }
          var res = []
          for (var i = 0; i < resultArray.length; i++) {
            var ithResult = resultArray[i];
            var jsonData = JSON.parse(ithResult)
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
            res.push(tempResult)
          }
          that.setData({
            BILLArray: res
          })
          resolve(res)
        }
      })
    }).then(res => {
      var item = [];
      for (var i = 0; i < res.length; i++) {
        var BILL = res[i];
        var BILLID = BILL.BILLID;
        new Promise((resolve, reject) => {
          wx.request({
            url: wsdlurl + 'GetAccountingDetails',
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
                    BILLID:jsonData.BILLID
                  };
                  detailArray.push(detail);
                }
              }
              resolve(detailArray);
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
              var BILL = BILLArray[i];
              var DETAIL = detail[j];
              if (BILL.BILLID == DETAIL[0].BILLID) {
                var SHOW = {
                  isShowTable: false,
                  showImageUrl: '../../images/expand-arrow-down.png'
                }
                var tempResult = {
                  BILL: BILL,
                  DETAIL: DETAIL,
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
    var values='';
    switch (typeDetail) {
      case '全部分类':
        pre = 'CUSTOMER==@0 and DUNNINGORREQUESTS==@1'
        values = app.data.customer + ',Dunning';
        break;
      case '待确认':
        pre = 'CUSTOMER==@0 and DUNNINGORREQUESTS==@1 and NODECODE==@2';
        values = app.data.customer + ',Dunning,Fee_CQK14';
        break;
      case '已确认':
        pre = 'CUSTOMER==@0 and DUNNINGORREQUESTS==@1 and NODECODE==@2 and NODESTATE==@3'
        values=app.data.customer + ',Dunning,Fee_CQK15,finished';
        break;
      default:
        break;
    }
    this.setData({
      BILLArray: [],
      DETAILArray: [],
      itemList: [],
      searchPageNum: 1,
      searchLoading: true, //"上拉加载"的变量，默认false，隐藏
      searchLoadingComplete: false,  //“没有数据”的变量，默认false，隐藏
      predicate: pre,
      values: values
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
    app.data.userName=''
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

  //  点击时间组件确定事件  
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
    var time = utils.formatTime1(new Date());
    this.setData({
      beginDate: time,
      endDate: time,
     
    })
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

  radioChange: function (e) {
    var filterRadioButton = this.data.filterRadioButton;// ['过去一周', '过去一个月', '过去三个月', '过去半年'],
    var chooseRadio = e.detail.value;
    var endDate = this.data.endDate;
    var beginDate = '';
    this.setData({
      isSelfDefineTime: false
    })
    switch (chooseRadio) {
      case '过去一周':
        beginDate = utils.lastWeek(new Date());
        break;
      case '过去一个月':
        beginDate = utils.lastMonth(new Date());
        break;
      case '过去三个月':
        beginDate = utils.lastThreeMonth(new Date());
        break;
      case '过去半年':
        beginDate = utils.lastHalfYear(new Date());
        break;
      case '自定义':
        this.setData({
          isSelfDefineTime: true
        })
      default: break;
    }
    this.setData({
      radioBeginDate: beginDate
    })
  },
  
  filterConfirm: function () {
    this.setData({
      filterSrc: '../../images/filter.png',
      isFiltered: false,
      typeIndex: 0
    })

    //格式"2017-11-21T15:38:38"
    var radioBeginDate = this.data.radioBeginDate;
    var beginDate = utils.beginFormatTime(this.data.beginDate, new Date());
    var endDate = utils.endFormatTime(this.data.endDate, new Date());

    var time = utils.formatTime1(new Date());
    var pre = '';
    var v = '';
    if (this.data.isSelfDefineTime==false){
      //系统分类
      if(radioBeginDate==''){
        pre = 'CUSTOMER==@0 and DUNNINGORREQUESTS==@1 and NODECODE==@2' ;
        v = app.data.customer +',Dunning,Fee_CQK14';
      }else{
        pre = 'CUSTOMER==@0 and DUNNINGORREQUESTS==@1 and NODECODE==@2 and BILLDATE >= MDFunctions.ParseDateTime(@3) and MDFunctions.ParseDateTime(@4) >= BILLDATE ';
        v = app.data.customer +',Dunning,Fee_CQK14,'+radioBeginDate + "," + endDate;
      }
    }else{
      //自定义时间
      pre = 'CUSTOMER==@0 and DUNNINGORREQUESTS==@1 and NODECODE==@2 and BILLDATE >= MDFunctions.ParseDateTime(@3) and MDFunctions.ParseDateTime(@4) >= BILLDATE ';
      v = app.data.customer+',Dunning,Fee_CQK14,'+ beginDate + "," + endDate;
    }
    // if (this.data.beginDate == time) {
    //   if (radioBeginDate == '') {
    //     pre = 'CUSTOMER==@0';
    //     v = app.data.customer;
    //   } else //系统时间分类
    //     pre = 'CUSTOMER==@0 and BILLDATE >= MDFunctions.ParseDateTime(@1) and MDFunctions.ParseDateTime(@2) >= BILLDATE ';
    //   v = app.data.customer + ',' +radioBeginDate + "," + endDate;
    // } else { //如果自定义了时间，则以自定义为准
    //   pre = 'CUSTOMER==@0 and BILLDATE >= MDFunctions.ParseDateTime(@1) and MDFunctions.ParseDateTime(@2) >= BILLDATE ';
    //   v = app.data.customer+','+beginDate + "," + endDate;
    // }
    this.setData({
      BILLArray: [],
      DETAILArray: [],
      itemList: [],
      searchPageNum: 1,
      searchLoading: true, //"上拉加载"的变量，默认false，隐藏
      searchLoadingComplete: false,  //“没有数据”的变量，默认false，隐藏
      predicate: pre,
      values: v,
      isSelfDefineTime:false
    })
    this.getData();
    this.setData({
      radioBeginDate: '',
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
      userinfonickname: app.data.userName,
      screenHeight: wx.getSystemInfoSync().windowHeight,
      beginDate: time,
      endDate: time,
      hasBinding: app.globalData.hasBinding,
      values: app.data.customer + ',Dunning,Fee_CQK14',
    })
    wx.setNavigationBarTitle({
      title: '账单确认',
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