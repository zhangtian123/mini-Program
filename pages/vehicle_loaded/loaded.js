// pages/test/test.js
var utils = require('../../utils/util.js');
var Parser = require('../../lib/dom-parser');
//wsdlurl中设置需要访问的webservice的url地址
var app = getApp()
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
  data: {
    navbar: ['填写信息', '拍照上传'],
    currentTab: 1,
    winWidth: 0,
    winHeight: 0,
    currentTab: 0,
    dates: utils.formatTime1(new Date),
    times: utils.formatTime2(new Date),
    tempFilePaths: '',
    imgs: [],
    uploadedImage: [],
    pack: 0,
    typeArray: [],
    typeIndex: 0,
    weight: null,
    volume: null,
    remark: null,
    state: null,
    finishTime: utils.formatTime1(new Date) + "T" + utils.formatTime2(new Date) + ":00.000",
    desription: null,
    BILLID: null,
    BILLNO: null,
    BILLCODE: null,
    nodeCode: null,
    showLoading: false,
  },

  packInput: function (e) {
    this.setData({
      pack: e.detail.value
    })
  },

  weightInput: function (e) {
    this.setData({
      weight: e.detail.value
    })
  },

  volumeInput: function (e) {
    this.setData({
      volume: e.detail.value
    })
  },

  remarkInput: function (e) {
    this.setData({
      remark: e.detail.value
    })
  },

  navbarTap: function (e) {
    var that = this;
    that.setData({
      currentTab: e.currentTarget.dataset.idx,
      TypeItem: that.data.navbar[that.data.currentTab]
    })
  },

  onLoad: function (options) {
    var that = this;
    var data = JSON.parse(options.data);
    console.log(data)
    this.setData({
      state: data.state,
      BILLID: data.BILLID,
      BILLNO: data.BILLNO,
      BILLCODE: data.BILLCODE,
      nodeCode: data.nodeCode,
    })
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
    wx.setNavigationBarTitle({
      title: '状态反馈',
    })
    /* 获取货物件数  单位列表*/
    var predicate = '1==1';
    var values = '';
    var iCounts = 10000000;
    wx.request({
      url: wsdlurl + 'GetPackageType',
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
        var result = resData.result;
        result = result + '';
        result = result.replace('[', '');
        result = result.replace(']', '');
        result = result.replace(new RegExp('},{', 'g'), '} , {')
        var resultArray = result.split(' , ')

        var typeArray = []
        for (var i = 0; i < resultArray.length; i++) {
          var ithResult = resultArray[i];
          var jsonData = JSON.parse(ithResult);
          typeArray.push(jsonData.TYPENAMECH);
        }
        that.setData({
          typeArray: typeArray,
          typeIndex: 0
        })
        console.log(that.data.typeArray)
      },
      fail: function () {
        wx.showModal({
          title: '提示',
          content: '访问服务器失败',
        })
      }
    })
  },

  bindTypeChange: function (e) {
    this.setData({
      typeIndex: e.detail.value
    })
  },

  bindDateChange: function (e) {
    this.setData({
      dates: e.detail.value
    })
    this.setData({
      finishTime: this.data.dates + "T" + this.data.times + ":00.000"
    })
  },

  bindTimeChange: function (e) {
    console.log(e.detail.value)
    this.setData({
      times: e.detail.value
    })
    this.setData({
      finishTime: this.data.dates + "T" + this.data.times + ":00.000"
    })
  },
  uploadImages: function () {
    var imgs = this.data.imgs;
    var that = this;
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      new Promise(function (resolve, reject) {
        wx.uploadFile({
          url: wsdlurl + 'Upload',
          filePath: img,
          name: '1.jpg',
          header: { "Content-Type": "multipart/form-data" },
          success: function (res) {
            console.log("上传结果 " + res.data);
            if (res.statusCode != 200) {
              wx.showModal({
                title: '提示',
                content: '上传失败',
                showCancel: false
              })
              return;
            } else {
              var resData = res.data;
              resData = resData.replace('\\', '');
              resolve(resData)
              // uploadedImage.push(res.data);
            }
          },
          fail: function (e) {
            console.log(e);
            wx.showModal({
              title: '提示',
              content: '上传失败',
              showCancel: false
            })
          },
          complete: function () {
            wx.hideToast();  //隐藏Toast
          }
        })
      }).then(res => {
        var uploadedImage = that.data.uploadedImage;
        uploadedImage.push(res);
        that.setData({
          uploadedImage: uploadedImage
        })
        console.log(that.data.uploadedImage)
      })

    }
    return (this.data.uploadedImage)
  },
  submit: function () {
    var weight = this.data.weight;
    var volume = this.data.volume;
    var pack = this.data.pack;
    if (pack == "" || pack == null) {
      wx.showModal({
        title: '提示',
        content: '请输入件数',
      })
    }
    else if (weight == "" || weight == null) {
      wx.showModal({
        title: '提示',
        content: '请输入毛重',
      })
    } else if (volume == "" || volume == null) {
      wx.showModal({
        title: '提示',
        content: '请输入体积',
      })
    } else {
      var that = this
      that.setData({
        showLoading: true
      })
      var Trailer = {
        BILLID: this.data.BILLID,
        BILLCODE: this.data.BILLCODE,
        PACK: this.data.pack,
        TYPE: this.data.typeArray[this.data.typeIndex],
        WEIGHT: this.data.weight,
        MEASURE: this.data.volume,
        REMARK: this.data.remark,
        RowState: 16
      };
      console.log(Trailer)
      Trailer = JSON.stringify(Trailer);//将json转成字符串传值
      var NodeCode = this.data.nodeCode;
      console.log(NodeCode)
      // var UserCode = 'admin'//app.data.userCode;
      // var UserCode = 'VIRTUAL_TRAILER_01';
      var UserCode = 'VIRTUAL_USER'; 
      var DocumentList = [];
      var uploadedImage = that.data.uploadedImage;
      for (var i = 0; i < uploadedImage.length; i++) {
        var guid3 = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
        console.log(uploadedImage[i])
        var Document = {
          DOCUMENTID: guid3,
          FILENAME: uploadedImage[i],
          STORAGEPATH: 'WechatUpload/' + uploadedImage[i],
          RowState: 4
        }
        DocumentList.push(Document)
      }
      DocumentList = JSON.stringify(DocumentList);
      wx.request({
        url: wsdlurl + 'DispatchNodeFinish',
        data: {
          Trailer: Trailer,
          NodeCode: NodeCode,
          UserCode: UserCode,
          DocumentList: DocumentList
        },
        method: 'POST',
        header: {
          'content-type': 'application/json'
        },
        // 设置请求的 header
        success: function (res) {
          // success
          that.setData({
            showLoading: true
          })
          var resData = res.data;
          var result = resData.result;
          var jsonres = JSON.parse(result);
          var status = jsonres.Status;
          var info = jsonres.Info;
          console.log(status);
          if (status == 0) {
            wx.showToast({
              title: '状态反馈成功！',
              icon: 'success',
              duration: 100000,
              success: function (res) {
                wx.redirectTo({
                  url: '../vehicle/vehicle',
                })
              }
            })
          } else {
            wx.showModal({
              title: '提示',
              content: info,
              success: function (res) {
                wx.redirectTo({
                  url: '../vehicle/vehicle',
                })
              }
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
    }
  },
  fillsubmit: function () {
    var imgs = this.data.imgs;
    var that = this;
    if (imgs.length != 0) {
      new Promise(function (resolve, reject) {
        resolve(that.uploadImages())
      }).then(res => {
        that.submit();
      })
    } else {
      this.submit();
    }
  },

  chooseImg: function (e) {
    var that = this;
    var imgs = this.data.imgs;
    if (imgs.length >= 3) {
      this.setData({
        lenMore: 1
      });
      setTimeout(function () {
        that.setData({
          lenMore: 0
        });
      }, 2500);
      return false;
    }
    wx.chooseImage({
      // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        var imgs = that.data.imgs;
        for (var i = 0; i < tempFilePaths.length; i++) {
          if (imgs.length >= 3) {
            that.setData({
              imgs: imgs
            });
            return false;
          } else {
            imgs.push(tempFilePaths[i]);
          }
        }
        that.setData({
          imgs: imgs
        });
      }
    });
  },

  // 删除图片
  deleteImg: function (e) {
    var imgs = this.data.imgs;
    var index = e.currentTarget.dataset.index;
    imgs.splice(index, 1);
    this.setData({
      imgs: imgs
    })
  },

  // 预览图片
  previewImg: function (e) {
    //获取当前图片的下标
    var index = e.currentTarget.dataset.index;
    //所有图片
    var imgs = this.data.imgs;
    wx.previewImage({
      //当前显示图片
      current: imgs[index],
      //所有图片
      urls: imgs
    })
  }
})