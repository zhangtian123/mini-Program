//账单确认、账单审核、请款单审核、
var Parser = require('../lib/dom-parser');
//wsdlurl中设置需要访问的webservice的url地址
var wsdlurl = 'http://localhost:8888/BestLOG80/WebAPI?wsdl';
var targetNamespace = 'http://tempuri.org/IWebAPIService/';

// string FeAccountingBll_GetAccountingList(string predicate, string values, int pageNum, int pageSize, string orderByProperty, out int rowsCount);
function getOpenid(code) {
  var codes=code+'';
  //method中设置你想调用的方法名
  var method = 'ContactCompanyBll_GetOpenID';
  //datacopy中拼字符串，即http传输中的soap信息
  var addstring = '<ContactCompanyBll_GetOpenID xmlns="http://tempuri.org/">' +
    '<LoginCode>' + codes + '</LoginCode>' +
    '</ContactCompanyBll_GetOpenID>';
  var datacopy = '<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">' +
    '<Header />' +
    '<Body>' +
    addstring +
    '</Body>' +
    '</Envelope>';
  wx.request({
    url: wsdlurl,
    data: datacopy,
    method: 'ContactCompanyBll_GetOpenID',
    header: {
      'content-type': 'text/xml; charset=utf-8',
      'SOAPAction': targetNamespace + method,
    },
    // 设置请求的 header
    success: function (res) {
      // success
      var resData = res.data;
      var XMLParser = new Parser.DOMParser();
      var doc = XMLParser.parseFromString(resData, function (response) { });
    },
    fail: function () {
      // fail
    },
    complete: function () {
      // complete 
    }
  })
}

module.exports = {
  ContactCompanyBll_GetOpenID: ContactCompanyBll_GetOpenID
}