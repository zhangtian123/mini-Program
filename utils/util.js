const formatTime1 = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return [year, month, day].map(formatNumber).join('-')
}

const formatTime2 = date => {
  const hour = date.getHours()
  const minute = date.getMinutes()
  return [hour, minute].map(formatNumber).join(':')
}

const formatDate=timeS=> {
  var year = timeS.getFullYear()
  var mon = timeS.getMonth() + 1
  var day = timeS.getDate()
  if (mon < 10) mon = "0" + mon
  if (day < 10) day = "0" + day
  return year + "-" + mon + "-" + day
}

function beginFormatTime(beginDate, today) {
  const hour = today.getHours()
  const minute = today.getMinutes()
  const second = today.getSeconds()
  return beginDate + 'T' + [hour, minute, second].map(formatNumber).join(':');
}

function endFormatTime(endDate, today) {
  const hour = today.getHours()
  const minute = today.getMinutes()
  const second = today.getSeconds()
  return endDate + 'T' + [hour, minute, second].map(formatNumber).join(':');
}

function lastWeek(date) {
  var today = Date.parse(date);
  var n = today - 24 * 60 * 60 * 7 * 1000;
  var before = new Date(n);
  var year = before.getFullYear();
  var month = before.getMonth() + 1;
  var day = before.getDate();
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  var beforeDate = [year, month, day].map(formatNumber).join('-')
  var beforeTime = [hour, minute, second].map(formatNumber).join(':')
  before = beforeDate + 'T' + beforeTime
  return before
}

function lastMonth(date) {
  var today = Date.parse(date);
  var n = today - 24 * 60 * 60 * 30 * 1000;
  var before = new Date(n);
  var year = before.getFullYear();
  var month = before.getMonth() + 1;
  var day = before.getDate();
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  var beforeDate = [year, month, day].map(formatNumber).join('-')
  var beforeTime = [hour, minute, second].map(formatNumber).join(':')
  before = beforeDate + 'T' + beforeTime
  return before
}

function lastThreeMonth(date) {
  var today = Date.parse(date);
  var n = today - 24 * 60 * 60 * 90 * 1000;
  var before = new Date(n);
  var year = before.getFullYear();
  var month = before.getMonth() + 1;
  var day = before.getDate();
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  var beforeDate = [year, month, day].map(formatNumber).join('-')
  var beforeTime = [hour, minute, second].map(formatNumber).join(':')
  before = beforeDate + 'T' + beforeTime
  return before
}

function lastHalfYear(date) {
  var today = Date.parse(date);
  var n = today - 24 * 60 * 60 * 180 * 1000;
  var before = new Date(n);
  var year = before.getFullYear();
  var month = before.getMonth() + 1;
  var day = before.getDate();
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  var beforeDate = [year, month, day].map(formatNumber).join('-')
  var beforeTime = [hour, minute, second].map(formatNumber).join(':')
  before = beforeDate + 'T' + beforeTime
  return before
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function tap_ch(e, pages) {
  if (pages.data.open) {
    pages.setData({
      open: false
    });
  } else {
    pages.setData({
      open: true
    });
  }
}

function tap_start(e, pages) {
  // touchstart事件
  pages.data.mark = pages.data.newmark = e.touches[0].pageX;
}

function tap_drag(e, pages) {
  // touchmove事件

  /*
   * 手指从左向右移动
   * @newmark是指移动的最新点的x轴坐标 ， @mark是指原点x轴坐标
   */
  pages.data.newmark = e.touches[0].pageX;
}

function tap_end(e, pages) {
  if (pages.data.mark + 100 < pages.data.newmark) {
    pages.setData(
      {
        showModalStatus: true,
        search: false
      }
    );
  }
  //手指从右向左移动
  // @newmark是指移动的最新点的x轴坐标 ， @mark是指原点x轴坐标
  if (pages.data.mark > pages.data.newmark) {
    pages.setData(
      {
        showModalStatus: false
      }
    );
  }
  pages.data.mark = pages.data.newmark;
  // touchend事件
  pages.data.mark = 0;
  pages.data.newmark = 0;
  if (pages.istoright) {
    pages.setData({
      open: true
    });
  } else {
    pages.setData({
      open: false
    });
  }
}

function timeError() {
  wx.showModal({
    title: "",
    content: "起始时间大于结束时间！",
    success: function (res) {
      if (res.confirm) {
        console.log('confirm');
      } else {
        console.log('refuse');
      }
    }
  })
}

function callWCF(url, data, targetNamespace, method, fun) {
  wx.request({
    url: url,
    data: data,
    method: method,
    header: {
      'content-type': 'text/xml; charset=utf-8',
      'SOAPAction': targetNamespace + method
    },
    success: function (res) {
      return typeof fun == "function" && fun(res)
    },
    fail: function () {
    }
  })
}

function isObj(object) {
  return object && typeof (object) == 'object' && Object.prototype.toString.call(object).toLowerCase() == "[object object]";
}

function isArray(object) {
  return object && typeof (object) == 'object' && object.constructor == Array;
}

function getLength(object) {
  var count = 0;
  for (var i in object) count++;
  return count;
}

function CompareObj(objA, objB, flag) {
  for (var key in objA) {
    if (!flag) //跳出整个循环
      break;
    if (!objB.hasOwnProperty(key)) {
      flag = false;
      break;
    }
    if (!isArray(objA[key])) { //子级不是数组时,比较属性值
      if (objB[key] != objA[key]) {
        flag = false;
        break;
      }
    } else {
      if (!isArray(objB[key])) {
        flag = false;
        break;
      }
      var oA = objA[key],
        oB = objB[key];
      if (oA.length != oB.length) {
        flag = false;
        break;
      }
      for (var k in oA) {
        if (!flag) //这里跳出循环是为了不让递归继续
          break;
        flag = CompareObj(oA[k], oB[k], flag);
      }
    }
  }
  return flag;
}

function Compare(objA, objB) {
  if (!isObj(objA) || !isObj(objB)) return false; //判断类型是否正确
  if (getLength(objA) != getLength(objB)) return false; //判断长度是否一致
  return CompareObj(objA, objB, true); //默认为true
}

function stringToByte(str) {
  var bytes =[];
  var len, c;
  len = str.length;
  for (var i = 0; i < len; i++) {
    c = str.charCodeAt(i);
    if (c >= 0x010000 && c <= 0x10FFFF) {
      bytes.push(((c >> 18) & 0x07) | 0xF0);
      bytes.push(((c >> 12) & 0x3F) | 0x80);
      bytes.push(((c >> 6) & 0x3F) | 0x80);
      bytes.push((c & 0x3F) | 0x80);
    } else if (c >= 0x000800 && c <= 0x00FFFF) {
      bytes.push(((c >> 12) & 0x0F) | 0xE0);
      bytes.push(((c >> 6) & 0x3F) | 0x80);
      bytes.push((c & 0x3F) | 0x80);
    } else if (c >= 0x000080 && c <= 0x0007FF) {
      bytes.push(((c >> 6) & 0x1F) | 0xC0);
      bytes.push((c & 0x3F) | 0x80);
    } else {
      bytes.push(c & 0xFF);
    }
  }
  return bytes;
}

module.exports = {
  formatDate: formatDate,
  formatTime1: formatTime1,
  formatTime2: formatTime2,
  beginFormatTime: beginFormatTime,
  endFormatTime: endFormatTime,
  lastWeek: lastWeek,
  lastMonth: lastMonth,
  lastThreeMonth: lastThreeMonth,
  lastHalfYear: lastHalfYear,
  getRequestUrl: "http://localhost:59637",//获得接口地址
  tap_ch: tap_ch,
  tap_start: tap_start,
  tap_drag: tap_drag,
  tap_end: tap_end,
  timeError: timeError,
  callWCF: callWCF,
  Compare: Compare,
  stringToByte: stringToByte
}