var app = getApp()
var utils = require('../../utils/util.js');
var Parser = require('../../lib/dom-parser');
//wsdlurl中设置需要访问的webservice的url地址
var wsdlurl = app.data.wsdlurl;
var targetNamespace = app.data.targetNamespace;

Page({
  data: {
  },
  //事件处理函数
  onLoad: function () {
    console.log('onLoad')
    var that = this
    var systemCode = "BestFMS8"
    var statusCode = 0
    {
      //datacopy中拼字符串，即http传输中的soap信息
      new Promise(function (resolve, reject) {
      wx.getStorage({
        key: 'openid',
        success: function(res) {
          resolve(res.data)
        },
        fail:function(res){
          resolve('')
        }
      })}).then(res=>{
        if(res!=''&&res!=null&&res!='null'){
          wx.request({
            url: wsdlurl +'UserLogin',
            data: {
              OpenID:res,
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
              var result=resData.result;
              console.log(status)
              if (status != -1) {//登陆成功
                wx.showToast({
                  title: '登录成功',
                  icon: 'success',
                  duration: 1000
                })
                var jsonData = JSON.parse(result);
                var tempResult = {
                  UserID: jsonData.UserID,
                  UserCode: jsonData.UserCode,
                  MobileNo: jsonData.MobileNo,
                  UserFlag: jsonData.UserFlag,
                  UserName: jsonData.UserName,
                  OpenID: jsonData.OpenID,
                  DingID: jsonData.DingID,
                  Sex: jsonData.Sex
                }
                //记录用户类别
                app.data.userflag = jsonData.UserFlag
                app.data.userCode = jsonData.UserCode
                app.data.userName = jsonData.UserName
                app.data.customer = jsonData.Customer
                app.data.OPENID = jsonData.OpenID
                app.data.USERID=jsonData.UserID
                if(app.data.OPENID!=null&&app.data.OPENID!='null')
                {
                  app.globalData.hasBinding=true
                }
                else app.globalData.hasBinding=false
                console.log(app.globalData.hasBinding);
                wx.redirectTo({
                  url: '../port_select/index?fromlog=1',
                })
              }
              else {
                console.log('转到登录界面')
                wx.switchTab({
                  url: '../login/login',
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
              // complete 
            }
          })
        }
        else {
          console.log('转到登录界面')
          wx.switchTab({
            url: '../login/login',
          })
        }
      })
    }
  }
})