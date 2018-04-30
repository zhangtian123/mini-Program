// pages/register2/register.js
var app = getApp()
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

function timeDown (that) {
  var countNumber = that.data.countNumber;
  if (countNumber == 0) {
    that.setData({
      countNumber: 60,
      getCode: '重新获取'
    })
    return;
  } else {
    countNumber = countNumber - 1;
    that.setData({
      getCode: '倒计时'+countNumber,
      countNumber: countNumber
    })
  }
  var time=setTimeout(function(){
    timeDown(that);
  },1000);
}

Page({
  data: {
    motto: 'Logo',
    userInfo: {},
    userName: '',
    userPassword: '',
    userPhonenumber: '',
    verificationCode: '',
    id_token: '',
    responseData: '',
    boo: false,
    VerificationCodeFlag: false,
    eyeImage: '/images/eye-close.png',
    isPassword: true,
    getCode:'获取验证码',
    countNumber:60,
  },

  //事件处理函数
  bindViewTap: function () {
    wx.redirectTo({
      url: '../logs/logs'
    })
  },

  userNameInput: function (e) {
    this.setData({
      userName: e.detail.value
    })
  },

  isUserExist: function () {
    var UserCode = this.data.userName
    new Promise((resolve, reject) => {
      wx.request({
        url: wsdlurl+'IsExistUser',
        data: {
          UserCode:UserCode
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
          if (result == true) {
            wx.showModal({
              title: '提示',
              content: '用户名已存在',
            })
          }
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
    })
  },

  userPasswordInput: function (e) {
    this.setData({
      userPassword: e.detail.value
    })
  },

  PhonenumberInput: function (e) {
    this.setData({
      userPhonenumber: e.detail.value
    })
  },

  isPhoneNumber: function () {
    // 验证130 - 139, 150 - 159, 180 - 189号码段的手机号码
    var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
    var userPhonenumber = this.data.userPhonenumber;
    if (userPhonenumber != '' && userPhonenumber!=null && myreg.test(userPhonenumber) == false) {//手机号码无效
      wx.showModal({
        title: '提示',
        content: '手机号码无效',
      })
    }
  },

  verificationCodeInput: function (e) {
    this.setData({
      verificationCode: e.detail.value
    })
  },
  
  getVerificationCode: function () {
    if (this.data.userPhonenumber == '' || this.data.userPhonenumber==null){
      wx.showModal({
        title: '提示',
        content: '请先输入手机号',
      })
      return;
    }
    if (this.data.countNumber != 0 && this.data.countNumber != 60) {
      return
    }
    if (this.data.countNumber==60){
      timeDown(this);
    }
    var MobileNo = this.data.userPhonenumber
    wx.request({
      url: wsdlurl +'GetVarificationCode',
      data: {
        MobileNo: MobileNo,
      },
      method: 'GET',
      header: {
        'content-type': 'application/json' 
      },
      // 设置请求的 header
      success: function (res) {
        // success
        var resData = res.data;
        var result=resData.result;
        if (result == false) {
          wx.showModal({
            title: '提示',
            content: '验证码发送失败',
          })
        } else {
          wx.showToast({
            title: '短信已发送!',
            icon: 'loading',
            duration: 2000
          })
        }
      },
      fail: function () {
        wx.showModal({
          title: '提示',
          content: '访问服务器失败',
        })
      },
      complete: function () {
      }
    })
  },
  
  eyeClick: function () {
    if (this.data.isPassword) {
      this.setData({
        isPassword: false,
        eyeImage: '/images/eye-open.png'
      })
    } else {
      this.setData({
        isPassword: true,
        eyeImage: '/images/eye-close.png'
      })
    }
    var that=this;
    this.setData({
      userPassword: that.data.userPassword
    })
  },

  next: function () {
    var phone = this.data.userPhonenumber
    var code = this.data.verificationCode
    var that = this
    if (that.data.userName == '') {
      wx.showModal({
        title: '提示',
        title: '请输入用户名',
      })
    } else if (that.data.userPassword == '') {
      wx.showModal({
        title: '提示',
        title: '请输入密码',
      })
    } else if (that.data.userPhonenumber == '') {
      wx.showModal({
        title: '提示',
        title: '请输入手机号',
      })
    } else if (this.data.verificationCode == '') {
      wx.showModal({
        title: '提示',
        content: '请输入验证码',
      })
    } else {
      //method中设置你想调用的方法名
      var method = 'ContactCompanyBll_IsValidCode';
      //datacopy中拼字符串，即http传输中的soap信息
      var addstring = '<ContactCompanyBll_IsValidCode xmlns="http://tempuri.org/">' +
        '<MobileNo>' + phone + '</MobileNo>' +
        '<Code>' + code + '</Code>' +
        '</ContactCompanyBll_IsValidCode>';
      var datacopy = '<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">' +
        '<Header />' +
        '<Body>' +
        addstring +
        '</Body>' +
        '</Envelope>';
      new Promise((resolve, reject) => {
        wx.request({
          url: wsdlurl +'IsValidCode',
          data: {
            MobileNo:phone,
            Code:code,
          },
          method: 'GET',
          header: {
            'content-type': 'application/json' 
          },
          // 设置请求的 header
          success: function (res) {
            // success
            var resData = res.data;
            var result=resData.result;
            if (result == false) {
              that.setData({
                VerificationCodeFlag: false
              })
            } else {
              that.setData({
                VerificationCodeFlag: true
              })
            }
            var res = that.data.VerificationCodeFlag;
            resolve(res)
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
        if (res == false) {
          wx.showModal({
            title: '提示',
            content: '验证码错误',
          })
          that.setData({
            verificationCode: ''
          })
        }else{
          var data = {
            userName: that.data.userName,
            userPassword: that.data.userPassword,
            userPhonenumber: that.data.userPhonenumber
          }
          data = JSON.stringify(data)
          wx.redirectTo({
            url: '/pages/registerextra2/registerextra?data=' + data
          })
        }
      })
    }
  },

  logIn: function () {
    var that = this
    wx.request({
      url: 'http://localhost:8000/index/ajax_dict',
      method: 'GET',
      login: function (res) {
        if (this.data.userNameInput['this.data.userNameInput']) {
          print("text")
        }
      },
      success: function (res) {
        that.setData({
          responseData: res.data.result[0].body
        });
        wx.setStorage({
          key: "responseData",
          data: that.data.responseData
        });
        try {
          wx.setStorageSync('id_token', res.data.id_token)
        } catch (e) {
        }
        wx.redirectTo({
          url: '../components/welcome/welcome'
        })
      },
      fail: function (res) {
      }
    })
  },

  onLoad: function () {
    var that = this
    wx.setNavigationBarTitle({
      title: '注册',
    })
  },

  onShow: function () {
  },

  shuaxin: function () {
    wx.redirectTo({
      url: '../index/index'
    })
  },

  onReady: function () {
  },

  onHide: function () {
  },

  onUnload: function () {
  },

  boo: function () {
    this.setData({
      boo: !this.data.boo
    });
  }
})