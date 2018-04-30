//app.js
var util=require('utils/util.js')
App({
  onLaunch: function () {
  },

  globalData: {
    userInfo: null,
    hasBinding:false
  },  
  data: {
    customer:'',
    userflag:'',
    USERID:'',
    userCode:'',
    unit_index: 0,
    num20gp:0,
    num40gp: 0,
    num40hc: 0,
    start_port: "厦门",
    start_port_eng:"XIAMEN",
    des_port: "名古屋",
    des_port_eng:"NAGOYA",
    date: util.formatDate(new Date()),
    weight: 0,
    vol: 0,
    num:0,
    packageType:[],
    allports:[],
    callbackcount:6, //每页返回的数据个数
    //wsdlurl中设置需要访问的webservice的url地址
    wsdlurl:'http://101.132.79.96:8888/BestLOG80/WxaAPI/',
    targetNamespace : 'http://tempuri.org/IWebAPIService/',
  }
})