// pages/login/login.js
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
  data: {
    motto: 'Logo',
    userInfo: {},
    userName: '',
    userPassword: '',
    id_token: '',
    responseData: '',
    boo: false,
    login_loading: false//登陆中loading
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

  isUserNameExist: function () {
    var options = {
      UserCode: this.data.userName
    }
  },

  userPasswordInput: function (e) {
    this.setData({
      userPassword: e.detail.value
    })
  },

  logIn: function () {
    var that = this
    var userCode = this.data.userName
    var password = this.data.userPassword
    var systemCode = "BestFMS8"
    var statusCode = 0
    if (userCode == '')//用户名为空
    {
      wx.showModal({
        title: '提示',
        content: '请输入用户名',
      })
    } else if (password == '') {
      wx.showModal({
        title: '提示',
        content: '请输入密码',
      })
    } else {
      this.setData({
        login_loading: true
      })
      //method中设置你想调用的方法名
      new Promise(function (resolve, reject) {
        wx.request({
          url: wsdlurl + 'UserLogin',
          data: {
            UserCode: userCode,
            Password: password,
            SystemCode: systemCode,
            StatusCode: statusCode
          },
          method: 'GET',
          header: {
            'content-type': 'application/json'
          },
          // 设置请求的 header
          success: function (res) {
            // success
            //显示登陆中
            that.setData({
              login_loading: false
            })
            var resData = res.data;
            var status = resData.statusCode;
            var jsonData = resData.result;
            //获取登录状态
            if (status == -1) {
              wx.showModal({
                title: '提示',
                content: '用户不存在',
              })
            } else if (status == 1) {
              wx.showModal({
                title: '提示',
                content: '禁止登录',
              })
            } else if (status == 2) {
              wx.showModal({
                title: '提示',
                content: '密码错误',
              })
            } else if (status == 3) {
              wx.showModal({
                title: '提示',
                content: '未审核用户',
              })
            } else {//登陆成功
              wx.showToast({
                title: '登录成功',
                icon: 'success',
                duration: 1000
              })
              that.setData({
                userName: '',
                userPassword: ''
              })
              jsonData = JSON.parse(jsonData);
              var tempResult = {
                UserID: jsonData.UserID,
                UserCode: jsonData.UserCode,
                MobileNo: jsonData.MobileNo,
                UserFlag: jsonData.UserFlag,
                UserName: jsonData.UserName,
                OpenID: jsonData.OpenID,
                DingID: jsonData.DingID,
                Sex: jsonData.Sex,
                Customer: jsonData.Customer
              }
              //记录用户类别
              app.data.userflag = jsonData.UserFlag
              app.data.userCode = jsonData.UserCode
              app.data.userName = jsonData.UserName
              app.data.customer = jsonData.Customer
              app.data.OPENID = jsonData.OpenID
              app.data.USERID = jsonData.UserID
              if (app.data.OPENID != null && app.data.OPENID != '' && app.data.OPENID != 'null') {
                app.globalData.hasBinding = true
              }
              else app.globalData.hasBinding = false
              wx.redirectTo({
                url: '../port_select/index?fromlog=1',
              })
            }
            resolve(status)
          },
          fail: function () {
            // fail
            that.setData({
              login_loading: false
            })
            wx.showModal({
              title: '提示',
              content: '访问服务器失败',
            })
            resolve(-1)
          },
          complete: function () {
            // complete 
          }
        })
      }).then(res => {
        if (res != -1 && res != 1 && res != 2 && res != 3) {
          wx.login({
            success: function (loginCode) {
              //method中设置你想调用的方法名
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
                  var result = resData.result;
                  if (result == app.data.OPENID) {
                    wx.setStorage({
                      key: 'openid',
                      data: result,
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
            }
          })
        }
      })
    }
  },

  onLoad: function () {
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