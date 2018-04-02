// template/registerDetail/registerDetail.js
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
    itemDetail: [],
    // pictures: ['https://p0.meituan.net/movie/ea4ac75173a8273f3956e514a4c78018253143.jpeg',
    //   'https://p0.meituan.net/movie/5d4fa35c6d1215b5689257307c461dd2541448.jpeg',
    //   'https://p0.meituan.net/movie/0c49f98a93881b65b58c349eed219dba290900.jpg'],
    pictures: [],
    showModal: false,
    showModalText: "驳回该注册审核",
    Remark: null,
    showLoading: false,
    storagePathArray: [],
    fileNameArray: [],
    showDocuments:false,
  },

  remarkInput: function (e) {
    this.setData({
      Remark: e.detail.value
    })
  },

  previewImage: function (e) {
    var that = this,
      //获取当前图片的下表
      index = e.currentTarget.dataset.index,
      //数据源
      pictures = this.data.pictures;
    wx.previewImage({
      //当前显示下表
      current: pictures[index],
      //数据源
      urls: pictures
    })
  },

  confirm: function () {
    var that = this;
    wx.showModal({
      title: "",
      content: "是否通过该审核",
      success: function (res) {
        if (res.confirm) {
          that.setData({
            showLoading: true
          })
          var item = that.data.itemDetail
          var BillID = item.BillID;
          var NodeCode = "CR_CUST03"
          // var UserCode = app.data.userCode;
          var UserCode = 'VIRTUAL_CUSTOMER_01'
          wx.request({
            url: wsdlurl + 'ContactorNodeFinish',
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
                showLoading: false  //把"上拉加载"的变量设为false，隐藏
              })
              var resData = res.data;
              var result = resData.result;
              var jsonres = JSON.parse(result);
              var status = jsonres.Status;
              var info = jsonres.Info;
              console.log(status)
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
                  content: info
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
  refuse: function () {
    this.setData({
      showModal: true
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

  //对话框取消按钮点击事件
  onCancel: function () {
    this.hideModal();
  },

  //对话框确认按钮点击事件
  onConfirm: function () {
    this.hideModal();
    this.setData({
      showLoading: true
    })
    var item = this.data.itemDetail
    var BillID = item.BillID;
    var NodeCode = "CR_CUST03"
    // var UserCode = app.data.userCode;
    var UserCode = 'VIRTUAL_CUSTOMER_01'
    var Remark = this.data.Remark;
    var that = this;
    wx.request({
      url: wsdlurl + 'CancelContactorNode',
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
          showLoading: false  //把"上拉加载"的变量设为false，隐藏
        })
        var resData = res.data;
        var result = resData.result;
        var jsonres = JSON.parse(result);
        var status = jsonres.Status;
        var info = jsonres.Info;
        console.log('status ' + status)
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

  //生命周期函数--监听页面加载
  onLoad: function (options) {
    var data = options.data;
    data = JSON.parse(data);
    this.setData({
      itemDetail: data
    })
    wx.setNavigationBarTitle({
      title: '注册审核详情',
    })
    console.log(data.BILLID)
    var BILLID = data.BILLID;
    var predicate = '';
    var values = '';
    var that = this;
    that.setData({
      showDocuments: true
    })
    new Promise(function (resolve, reject) {
      wx.request({
        url: wsdlurl + 'GetDocumentsList',
        data: {
          BillID: BILLID,
          predicate: predicate,
          values: values
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
          if(result=="[]"){
            that.setData({
              showDocuments: false
            })
            return;
          }
          result = result + '';
          result = result.replace('[', '');
          result = result.replace(']', '');
          result = result.replace(new RegExp('},{', 'g'), '} , {')
          var resultArray = result.split(' , ')
          var storagePathArray = [];
          var fileNameArray = [];
          for (var i = 0; i < resultArray.length; i++) {
            var ithResult = resultArray[i];
            var jsonData = JSON.parse(ithResult);
            var STORAGEPATH = jsonData.STORAGEPATH;
            var FILENAME = jsonData.FILENAME;
            storagePathArray.push(STORAGEPATH);
            fileNameArray.push(FILENAME);
          }
          that.setData({
            storagePathArray: storagePathArray,
            fileNameArray: fileNameArray,
          })
          resolve(res = {
            storagePathArray: storagePathArray,
            fileNameArray: fileNameArray
          })
        },
        fail: function () {
          // fail
        },
        complete: function () {
          // complete 
        }
      })
    }).then(res => {
      console.log(res)
      
      var storagePathArray = res.storagePathArray;
      var fileNameArray = res.fileNameArray;
      for (var i = 0; i < storagePathArray.length; i++) {
        var STORAGEPATH = storagePathArray[i].replace(new RegExp('\/','g'),'%2F');
        var FILENAME = fileNameArray[i];
        new Promise(function (resolve, reject) {
          console.log(STORAGEPATH)
          wx.downloadFile({
            url: encodeURI(wsdlurl + 'Download?filePath=' + STORAGEPATH) ,
            method: 'GET',
            header: {
              "Content-Type": "multipart/form-data",
            },
            success: function (res) {
              console.log('download')
              console.log(res.tempFilePath)
              resolve(res.tempFilePath);
            },
            fail: function () {
              // fail
            },
            complete: function () {
              // complete 
            }
          })
        }).then(res => {
          var pictures = that.data.pictures;
          pictures.push(res);
          that.setData({
            pictures: pictures
          })
          console.log(pictures)
        })

      }
      that.setData({
        showDocuments: false
      })
    })


  }
})