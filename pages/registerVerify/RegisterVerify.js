// template/registerVerify/RegisterVerify.js
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
    filterRadioButton: ['过去一周', '过去一个月', '过去三个月', '过去半年', '自定义'],
    date: '',
    radioBeginDate: '',
    isSelfDefineTime: false,
    beginDate: '',
    endDate: '',
    //类别选择
    isChoosed: false,
    typeIndex: 1,
    typeData: ['全部分类', '待审核', '已审核'],
    itemList: [],
    //驳回弹窗
    showModal: false,
    showModalText: "驳回该注册审核",
    Remark: null,
    //下拉加载
    searchPageNum: 1,   // 设置加载的第几次，默认是第一次
    callbackcount: app.data.callbackcount,       //返回数据的个数
    searchLoading: true, //"上拉加载"的变量，默认false，隐藏
    searchLoadingComplete: false, //“没有数据”的变量，默认false，隐藏
    predicate: '',
    values:'',
    orderByProperty: 'CREATEDATE',
    rowsCount: 0,
    // 绑定与解除绑定进度
    isBinding: false,
    isUnbinding: false,
    hasBinding: getApp().globalData.hasBinding
  },

  getData: function () {
    this.setData({
      searchLoading: true,  //把"上拉加载"的变量设为false，隐藏
      searchLoadingComplete: false
    })
    var that = this;
    new Promise(function (resolve, reject) {
      wx.request({
        url: wsdlurl +'GetRegisterList',
        data: {
          predicate:that.data.predicate,
          values: that.data.values,
          pageNum: that.data.searchPageNum,
          pageSize: that.data.callbackcount,
          orderByProperty: that.data.orderByProperty,
          userCode: app.data.userCode,
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
          var result=resData.result;
          if(result=="[]"){
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

          if (resultArray.length != 0 && resultArray.length < that.data.callbackcount && that.data.itemList.length == 0) {
            that.setData({
              searchLoadingComplete: true, //把“没有数据”设为true，显示
            })
          }
          var array = [];
          for (var i = 0; i < resultArray.length; i++) {
            var ithResult = resultArray[i];
            ithResult = ithResult.replace(']', '');
            var jsonData = JSON.parse(ithResult);
            var OriginalValues = jsonData.OriginalValues;
            var str4 = {
              BILLID: jsonData.BILLID,
              BILLCODE: jsonData.BILLCODE,
              RegisterUser: jsonData.RegisterUser,
              COMNAME: jsonData.COMNAME,
              COMNAMECN: jsonData.COMNAMECN,
              TAXNUMBER: jsonData.TAXNUMBER,
              CREATEDATE: jsonData.CREATEDATE == null ? jsonData.CREATEDATE : jsonData.CREATEDATE.replace('T', ' '),
              REGADDRESS: jsonData.REGADDRESS,
              REGADDRESSEN: jsonData.REGADDRESSEN,
              EMAIL: jsonData.EMAIL,
              ORGLEVEL: jsonData.ORGLEVEL,
              RegisterDate: jsonData.RegisterDate,
              ISCHECKED: jsonData.ISCHECKED
            };
            array.push(str4);
          }
          resolve(array)
        },
        fail: function () {
          wx.showModal({
            title: '提示',
            content: '访问服务器失败',
          })
        }
      })
    }).then(res => {
      var itemList = that.data.itemList;
      itemList = itemList.concat(res);
      that.setData({
        itemList: itemList
      })
    })

  },

  remarkInput: function (e) {
    this.setData({
      Remark: e.detail.value
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
      case '待审核':
        pre = 'ISCHECKED==false or ISCHECKED==null'
        break;
      case '已审核':
        pre = 'ISCHECKED==true'
        break;
      default:
        break;
    }
    this.setData({
      itemList: [],
      searchPageNum: 1,
      searchLoading: true, //"上拉加载"的变量，默认false，隐藏
      searchLoadingComplete: false, //“没有数据”的变量，默认false，隐藏
      predicate: pre,
      values: ""
    })
    this.getData()
  },

  table_show: function () {
    if (this.data.isShowTable) {
      this.setData({
        isShowTable: false,
        showImageUrl: '../../images/icons8-Expand Arrow Filled-50.png'
      })
    } else {
      this.setData({
        isShowTable: true,
        showImageUrl: '../../images/icons8-Expand Arrow Filled-50-opposite.png'
      })
    }
  },

  showDetail: function (e) {
    var index = e.target.dataset.index;
    var itemList = this.data.itemList;
    var item = itemList[index];
    var data = {
      BILLID: item.BILLID,
      COMNAME: item.COMNAME,
      COMNAMECN: item.COMNAMECN,
      TAXNUMBER: item.TAXNUMBER,
      EMAIL: item.EMAIL,
      REGADDRESS: item.REGADDRESS,
      REGADDRESSEN: item.REGADDRESSEN,
      RegisterUser: item.RegisterUser,
      ISAPPLY: item.ISAPPLY
    }
    data = JSON.stringify(data);
    wx.navigateTo({
      url: '../registerDetail/registerDetail?data=' + data,
    })
  },

  confirm: function (e) {
    var that = this;
    wx.showModal({
      title: "",
      content: "是否通过该审核",
      success: function (res) {
        if (res.confirm) {
          that.setData({
            searchLoading: true  //把"上拉加载"的变量设为false，隐藏
          })
          var index = e.target.dataset.index
          var item = that.data.itemList[index];
          var BillID = item.BillID;
          var NodeCode = "CR_CUST03"
          // var UserCode = app.data.userCode;
          var UserCode = 'VIRTUAL_CUSTOMER_01'
          wx.request({
            url: wsdlurl +'ContactorNodeFinish',
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
                searchLoading: false  //把"上拉加载"的变量设为false，隐藏
              })
              var resData = res.data;
              var result=resData.result;
              var jsonres = JSON.parse(result);
              var status = jsonres.Status;
              var info = jsonres.Info;
              if (status == 0) {
                wx.showToast({
                  title: '审核通过！',
                  icon: 'success',
                  duration: 100000,
                  success: function (res) {
                    wx.redirectTo({
                      url: '../registerVerify/RegisterVerify',
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
              wx.showModal({
                title: '提示',
                content: '访问服务器失败',
              })
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

  //弹窗
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

  //隐藏模态对话框
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
      searchLoading: true 
    })
    var index = this.data.refuseIndex;
    var item = this.data.itemList[index];
    var BillID = item.BillID;
    var NodeCode = "CR_CUST03"
    // var UserCode = app.data.userCode;
    var UserCode = 'VIRTUAL_CUSTOMER_01'
    var Remark = this.data.Remark;
    var that = this;
    wx.request({
      url: wsdlurl +'CancelContactorNode',
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
          searchLoading: false  //把"上拉加载"的变量设为false，隐藏
        })
        var resData = res.data;
        var result=resData.result;
        var jsonres = JSON.parse(result);
        var status = jsonres.Status;
        var info = jsonres.Info;
        if (info == '') {
          wx.showToast({
            title: '驳回成功！',
            icon: 'success',
            duration: 2000,
            success: function (res) {
              wx.redirectTo({
                url: '../registerVerify/RegisterVerify',
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
      isFiltered: false
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
        pre='';
      }else{
        pre = ' CREATEDATE >= MDFunctions.ParseDateTime(@0) and MDFunctions.ParseDateTime(@1) >= CREATEDATE ';
        v = radioBeginDate + "," + endDate;
      }
    }else{
      pre = ' CREATEDATE >= MDFunctions.ParseDateTime(@0) and MDFunctions.ParseDateTime(@1) >= CREATEDATE ';
      v = beginDate + "," + endDate;
    }
    // if (this.data.beginDate == time) {
    //   if (radioBeginDate == '') {
    //     pre = '';
    //   } else//系统时间分类
    //     pre = ' CREATEDATE >= MDFunctions.ParseDateTime(@0) and MDFunctions.ParseDateTime(@1) >= CREATEDATE ';
    //   v = radioBeginDate + "," + endDate;
    // } else {//如果自定义了时间，则以自定义为准
    //   pre = ' CREATEDATE >= MDFunctions.ParseDateTime(@0) and MDFunctions.ParseDateTime(@1) >= CREATEDATE ';
    //   v = beginDate + "," + endDate;
    // }
    this.setData({
      itemList: [],
      searchPageNum: 1,
      searchLoading: true, //"上拉加载"的变量，默认false，隐藏
      searchLoadingComplete: false,  //“没有数据”的变量，默认false，隐藏
      predicate: pre,
      values: v,
      isSelfDefineTime:false
    })
    this.getData()
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
      hasBinding: app.globalData.hasBinding,
      userinfonickname: app.data.userName,
      screenHeight: wx.getSystemInfoSync().windowHeight,
      beginDate: time,
      endDate: time,
    })
    wx.setNavigationBarTitle({
      title: '注册审核',
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
  }
})