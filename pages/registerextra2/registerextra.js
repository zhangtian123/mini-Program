// pages/registerextra1/registerextra.js
var app = getApp()
var util = require('../../utils/util.js');
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
    userPhonenumber: '',
    companyChineseName: '',
    companyEnglishName: '',
    companyChineseAddress: '',
    companyEnglishAddress: '',
    taxNumber: '',
    email: '',
    lenMore: 0,
    id_token: '',
    responseData: '',
    boo: false,
    src: [],
    src1: [],
    register_loading: false,
    navbar: ['填写信息', '拍照上传'],
    currentTab: 1,
    winWidth: 0,
    winHeight: 0,
    currentTab: 0,
    dates: util.formatTime1(new Date),
    times: util.formatTime2(new Date),
    tempFilePaths: '',
    imgs: [],
    uploadedImage: [],
    showProtocol: false,
    isScroll: true,
    screen_height: wx.getSystemInfoSync().windowHeight
  },

  showProtocol: function () {
    this.setData({
      showProtocol: true,
      isScroll: false
    })
  },

  protocolOK: function () {
    this.setData({
      showProtocol: false,
      isScroll: true
    })
  },

  companyChineseNameInput: function (e) {
    this.setData({
      companyChineseName: e.detail.value
    })
  },

  companyEnglishNameInput: function (e) {
    this.setData({
      companyEnglishName: e.detail.value
    })
  },

  companyChineseAddressInput: function (e) {
    this.setData({
      companyChineseAddress: e.detail.value
    })
  },

  companyEnglishAddressInput: function (e) {
    this.setData({
      companyEnglishAddress: e.detail.value
    })
  },

  taxNumberInput: function (e) {
    this.setData({
      taxNumber: e.detail.value
    })
  },
  // 校验地址码,行政区划码
  checkAddressCode: function (addressCode) {
    var provinceAndCitys = {
      11: "北京", 12: "天津", 13: "河北", 14: "山西", 15: "内蒙古", 21: "辽宁", 22: "吉林", 23: "黑龙江",
      31: "上海", 32: "江苏", 33: "浙江", 34: "安徽", 35: "福建", 36: "江西", 37: "山东", 41: "河南", 42: "湖北", 43: "湖南", 44: "广东",
      45: "广西", 46: "海南", 50: "重庆", 51: "四川", 52: "贵州", 53: "云南", 54: "西藏", 61: "陕西", 62: "甘肃", 63: "青海", 64: "宁夏",
      65: "新疆", 71: "台湾", 81: "香港", 82: "澳门", 91: "国外"
    };
    var check = /^[1-9]\d{5}$/.test(addressCode);
    if (!check) return false;
    if (provinceAndCitys[parseInt(addressCode.substring(0, 2))]) {
      return true;
    } else {
      return false;
    }

  },
  // 校验组织机构代码
  isValidOrgCode: function (value) {
    if (value != "") {
      var part1 = value.substring(0, 8);
      var part2 = value.substring(value.length - 1, 1);
      var ws = [3, 7, 9, 10, 5, 8, 4, 2];
      var str = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      var reg = /^([0-9A-Z]){8}$/;
      if (!reg.test(part1)) {
        return true
      }
      var sum = 0;
      for (var i = 0; i < 8; i++) {
        sum += str.indexOf(part1.charAt(i)) * ws[i];
      }
      var C9 = 11 - (sum % 11);
      var YC9 = part2 + '';
      if (C9 == 11) {
        C9 = '0';
      } else if (C9 == 10) {
        C9 = 'X';
      } else {
        C9 = C9 + '';
      }
      return YC9 != C9;
    }
  },
  emailInput: function (e) {
    this.setData({
      email: e.detail.value
    })
  },

  isTaxNumber: function () {
    // var myreg = /^[A-Z0-9]{15}$|^[A-Z0-9]{17}$|^[A-Z0-9]{18}$|^[A-Z0-9]{20}$/;
    // var taxNumber = this.data.taxNumber
    // if (taxNumber != '' && taxNumber!=null && myreg.test(taxNumber) == false) {
    // wx.showToast({
    //   title: '纳税号无效!',
    //   duration: 1000
    // })
    // this.setData({
    //   taxNumber: ''
    // })
    // }
    var taxNumber = this.data.taxNumber
    if (taxNumber != '' && taxNumber != null) {
      if (taxNumber.length == 15) {//
        console.log(15)
        var addressCode = taxNumber.substring(0, 6);
        // 校验地址码
        var check = this.checkAddressCode(addressCode);
        if (!check) {
          wx.showToast({
            title: '纳税号无效!',
            duration: 1000
          })
          // this.setData({
          //   taxNumber: ''
          // })
        }
        // 校验组织机构代码
        var orgCode = taxNumber.substring(6, 9);
        check = this.isValidOrgCode(orgCode);
        if (!check) {
          wx.showToast({
            title: '纳税号无效!',
            duration: 1000
          })
          // this.setData({
          //   taxNumber: ''
          // })
        }
      } else if (taxNumber.length == 18 || taxNumber.length == 20) {

      } else {
        wx.showModal({
          title: '提示',
          content: '纳税号无效',
        })
      }
    }
  },

  isEmail: function () {
    var myreg = /^([0-9A-Za-z\-_\.]+)@([0-9a-z]+\.[a-z]{2,3}(\.[a-z]{2})?)$/g;
    var email = this.data.email;
    if (email != null && email != '' && myreg.test(email) == false) {
      wx.showToast({
        title: '邮箱地址无效!',
        duration: 1000
      })
      // this.setData({
      //   email: ''
      // })
    }
  },

  previewImg: function (res) {
    //获取当前图片的下标
    var index = res.fileList[0].filePath;
    //所有图片
    var imgs = this.data.imgs;
    wx.getSavedFileList({
      info: function () {
        wx.previewImage({
          //当前显示图片
          current: imgs[index],
          //所有图片
          urls: imgs
        })
      }
    })
  },

  deleteBtn: function () {
    var that = this
    wx.getSavedFileList({
      success: function (res) {
        console.log(res.fileList.length)
        if (res.fileList.length > 0) {
          wx.removeSavedFile({
            filePath: res.fileList[0].filePath,
            complete: function (res) {
              wx.getSavedFileList({
                success: function (res) {
                  if (res.fileList.length > 2) {
                    that.setData({
                      src: res.fileList[0].filePath,
                      src2: res.fileList[1].filePath,
                      src3: res.fileList[2].filePath
                    })
                  }
                  else if (res.fileList.length > 1) {
                    that.setData({
                      src: res.fileList[0].filePath,
                      src2: res.fileList[1].filePath,
                      src3: "",
                    })
                  }
                  else if (res.fileList.length > 0) {
                    that.setData({
                      src: res.fileList[0].filePath,
                      src2: "",
                      src3: "",
                    })
                  }
                  else if (res.fileList.length > -1) {
                    that.setData({
                      src: ""
                    })
                  }
                }
              }),
                wx.getSavedFileList({
                  success: function (res) {
                    console.log(res.fileList.length)
                  }
                })
            }
          })
        }
      }
    })
  },

  listenerBtnChooseImage: function () {
    var that = this
    // Upload an image
    wx.chooseImage({
      count: 3,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        var tempFilePaths = res.tempFilePaths
        wx.saveFile({
          tempFilePath: tempFilePaths[0],
          success: function (res) {
            var savedFilePath = res.savedFilePath
            print = "test"
          }
        })
        console.log('success')
        wx.getSavedFileList({
          success: function (res) {
            if (res.fileList.length > 2) {
              that.setData({
                src: res.fileList[0].filePath,
                src2: res.fileList[1].filePath,
                src3: res.fileList[2].filePath
              })
            }
            else if (res.fileList.length > 1) {
              that.setData({
                src: res.fileList[0].filePath,
                src2: res.fileList[1].filePath,
                src3: "",
              })
            }
            else if (res.fileList.length > 0) {
              that.setData({
                src: res.fileList[0].filePath
              })
            }
          }
        }),
          // show the file list
          wx.getSavedFileList({
            success: function (res) {
              console.log(res.fileList.length)
            }
          })
        // Get image info
        wx.getImageInfo({
          src: res.tempFilePaths[0],
          success: function (res) {
            console.log(res.width)
            console.log(res.height)
            console.log(res.path)
          }
        })
      }
    })
  },

  //事件处理函数
  bindViewTap: function () {
    wx.redirectTo({
      url: '../logs/logs'
    })
  },

  onLoad: function (options) {
    var that = this
    var data = options.data;
    data = JSON.parse(data);
    this.setData({
      userName: data.userName,
      userPassword: data.userPassword,
      userPhonenumber: data.userPhonenumber
    })
    wx.setNavigationBarTitle({
      title: '注册',
    })
  },

  onShow: function () {
    console.log('index is show')
  },

  boo: function () {
    this.setData({
      boo: !this.data.boo
    });
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
      // count: 1, // 默认9
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
    //显示提示
    this.setData({
      register_loading: true
    })
    var that = this
    // 生成ID
    var guid1 = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    var guid2 = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    var Contactor = {
      COMCONTACTID: guid1,
      ONLINEID: this.data.userName,//USERCODE
      IDPASSWORD: this.data.userPassword,
      MOBILEPHONE: this.data.userPhonenumber,
      REGDATE: new Date(),
      RowState: 4
    }
    console.log(Contactor)
    // 注册企业信息
    var Company = {
      BILLID: guid2,
      ISCUSTOMER: true,
      TAXNUMBER: this.data.taxNumber,
      COMNAMECN: this.data.companyChineseName,
      COMNAME: this.data.companyEnglishName,
      REGADDRESS: this.data.companyChineseAddress,
      REGADDRESSEN: this.data.companyEnglishAddress,
      EMAIL: this.data.email,
      RowState: 4
    }
    var DocumentList = [];
    var uploadedImage = that.data.uploadedImage;
    for (var i = 0; i < uploadedImage.length; i++) {
      var guid3 = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
          v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      var Document = {
        DOCUMENTID: guid3,
        FILENAME: uploadedImage[i],
        STORAGEPATH: 'WechatUpload/' + uploadedImage[i],
        RowState: 4
      }
      wx.uploadFile({
        url: wsdlurl + 'Upload',
        filePath: path,
        name: filename,
        success: function (res) {
          console.log('图片上传成功' + path)
        },
        fail: function (res) {

        }
      })
      DocumentList.push(Document)
    }
    wx.request({
      url: wsdlurl + 'WeChatRegister',
      data: {
        Contactor: JSON.stringify(Contactor),
        Company: JSON.stringify(Company),
        DocumentList: JSON.stringify(DocumentList)
      },
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
      header: {
        'content-type': 'application/json'
      },
      // 设置请求的 header
      success: function (res) {
        // success
        //关闭loading提示
        that.setData({
          register_loading: false
        })
        var resData = res.data;
        var result = resData.result;
        result = JSON.parse(result)
        var status = result.Status
        console.log(status)
        var info = result.Info
        if (status == 0) {
          wx.showModal({
            title: '注册完成，请耐心等待审核！',
            duration: 100000
          })
          wx.switchTab({
            url: '../login/login',
          })
        } else {
          wx.showModal({
            title: "" + info,
            duration: 10000
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
  }
})