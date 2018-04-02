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
    start_port: "上海",
    start_port_eng:"SHANGHAI",
    des_port: "迪拜",
    des_port_eng:"DUBAI",
    date: util.formatDate(new Date()),
    weight: 0,
    vol: 0,
    num:0,
    packageType:[],
    allports:[],
    callbackcount:6, //每页返回的数据个数
    //wsdlurl中设置需要访问的webservice的url地址
    wsdlurl: 'http://localhost:8888/BestLOG80/WxaAPI/',
    // wsdlurl: 'https://api.best-hint.com/BestLOG8Demo/BestLOG80/WxaAPI/',
    // wsdlurl:'https://api.best-hint.com/BestLOG8Demo2/BestLOG80/WxaAPI/',
    wsdlurl:'http://101.132.79.96:8888/BestLOG80/WxaAPI/',
    // wsdlurl: 'http://localhost:8888/BestLOG80/WxaAPI/',
    //  wsdlurl :'https://wxa2.best-hint.com/BestLOG80/WebAPI?wsdl',
    targetNamespace : 'http://tempuri.org/IWebAPIService/',
  }
})