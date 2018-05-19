// pages/forgot_password2/forgot_password.js
var app = getApp()
var Promise = require('../../plugins/es6-promise.js')
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

function timeDown(that) {
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
      getCode: '倒计时' + countNumber,
      countNumber: countNumber
    })
  }
  var time = setTimeout(function () {
    timeDown(that);
  }, 1000);
}

Page({
  data: {
    motto: 'Logo',
    userInfo: {},
    userName: '',
    userPhonenumber: '',
    userPassword: '',
    verificationCode: null,
    verificationResult: null,
    id_token: '',
    responseData: '',
    boo: false,
    forgetpwd_loading: false,//提交新密码loading
    eyeImage: '/images/eye-open.png',
    isPassword: true,
    getCode: '获取验证码',
    countNumber: 60,
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
        url: wsdlurl + 'IsExistUser',
        data: {
          UserCode: UserCode
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
          if(result==false){
            wx.showModal({
              title: '提示',
              content: '用户名不存在',
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
  isPhoneNumber:function(){
    if (this.isPhoneNumber1()==false){
      wx.showModal({
        title: '提示',
        content: '手机号码无效',
      })
    }
  },
  isPhoneNumber1: function () {
    // 验证130 - 139, 150 - 159, 180 - 189号码段的手机号码
    var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
    var userPhonenumber = this.data.userPhonenumber;
    if (userPhonenumber != '' && userPhonenumber != null && myreg.test(userPhonenumber) == false) {//手机号码无效
      return false;
    }
    return true;
  },

  eyeClick: function () {
    if (this.data.isPassword) {
      this.setData({
        isPassword: false,
        eyeImage: '/images/eye-close.png'
      })
    } else {
      this.setData({
        isPassword: true,
        eyeImage: '/images/eye-open.png'
      })
    }
    var that = this;
    that.setData({
      userPassword: that.data.userPassword
    })
  },

  verificationCodeInput: function (e) {
    this.setData({
      verificationCode: e.detail.value
    })
  },

  getVerificationCode: function () {
    if(this.isPhoneNumber1()==false){
      wx.showModal({
        title: '提示',
        content: '手机号码无效',
      })
      return
    }
    if (this.data.countNumber != 0 && this.data.countNumber != 60) {
      return
    }
    if (this.data.countNumber == 60) {
      timeDown(this);
    }
    var MobileNo = this.data.userPhonenumber
    wx.request({
      url: wsdlurl + 'GetVarificationCode',
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
        var result = resData.result;
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

  isVerificationCode: function () {
    var that = this;
    var MobileNo = this.data.userPhonenumber
    var Code = this.data.verificationCode
    new Promise((resolve, reject) => {
      wx.request({
        url: wsdlurl + 'IsValidCode',
        data: {
          MobileNo: MobileNo,
          Code: Code
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
          if (result == false) {
            wx.showModal({
              title: '提示',
              content: '验证码错误',
            })
          }
          resolve(result);
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
    }).then(res => {
      that.setData({
        verificationResult: res
      })
    })
  },

  submit: function () {
    var that = this
    if (this.data.userName == '' || this.data.userName == null) {
      wx.showModal({
        title: '提示',
        content: '请输入用户名',
      })
      return
    } 
    var UserCode = this.data.userName
    new Promise((resolve, reject) => {
      wx.request({
        url: wsdlurl + 'IsExistUser',
        data: {
          UserCode: UserCode
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
          if (result == false) {
            wx.showModal({
              title: '提示',
              content: '用户名不存在',
            })
            return
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
    if (this.data.userPhonenumber == '' || this.data.userPhonenumber == null) {
      wx.showModal({
        title: '提示',
        content: '请输入手机号',
      })
      return
    }
    if (this.isPhoneNumber1() == false) {
      wx.showModal({
        title: '提示',
        content: '手机号码无效',
      })
      return
    }
     if (this.data.userPassword == '' || this.data.userPassword == null) {
      wx.showModal({
        title: '提示',
        content: '请输入新密码',
      })
      return
    } 
    if (this.data.verificationCode == '' ||    this.data.verificationCode == null) {
      wx.showModal({
        title: '提示',
        content: '请输入验证码',
      })
      return
    }

      this.setData({
        forgetpwd_loading: true
      })
      //验证码是否正确
      var MobileNo = this.data.userPhonenumber
      var Code = this.data.verificationCode
      new Promise((resolve, reject) => {
        wx.request({
          url: wsdlurl + 'IsValidCode',
          data: {
            MobileNo: MobileNo,
            Code: Code
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
            resolve(result);
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
      }).then(res => {
        if (res == 'false') {
          that.setData({
            forgetpwd_loading: false
          })
          wx.showModal({
            title: '提示',
            content: '验证码错误',
          })
        } else {
          var UserCode = this.data.userName;
          var MobileNo = this.data.userPhonenumber;
          var NewPwd = this.data.userPassword;
          wx.request({
            url: wsdlurl + 'SaveNewPassWord',
            data: {
              UserCode: UserCode,
              MobileNo: MobileNo,
              NewPwd: NewPwd
            },
            method: 'GET',
            header: {
              'content-type': 'application/json'
            },
            // 设置请求的 header
            success: function (res) {
              // success
              that.setData({
                forgetpwd_loading: false
              })
              var resData = res.data;
              var result = resData.result;
              if (result == false) {
                wx.showModal({
                  title: '提示',
                  content: '修改密码失败',
                  success: function (res) {
                    wx.switchTab({
                      url: '../login/login',
                    })
                  }
                })
              } else if (result == true) {
                wx.showToast({
                  title: '修改密码成功',
                  icon: 'success',
                  duration: 1000,
                  success: function (res) {
                    wx.switchTab({
                      url: '../login/login',
                    })
                  }
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
        }
      })
  },

  onLoad: function () {
    var that = this
    wx.setNavigationBarTitle({
      title: '忘记密码',
    })
  }
})