// pages/myMap.js
// 引入SDK核心类
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');

// 实例化API核心类
var qqmapsdk = new QQMapWX({
  key: 'QTUBZ-YWMKJ-XU5FY-F4GV6-MKMAF-UAB64' // 必填
});

Page({

  /**
   * 页面的初始数据
   */
  data: {
    longitude: 116.46,
    latitude: 39.92,
    polyline: [],
    markers: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        var log = res.longitude
        var lat = res.latitude
        that.setData({
          longitude: log,
          latitude: lat
        })
      },
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.mapCtx = wx.createMapContext('myMap')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  
  /**
   * 点击事件
   */
  controltap: function (e) {
    console.log(e);
    var cid = e.currentTarget.id;
    if (cid == "moveToLocation") {
      this.mapCtx.moveToLocation()
    }
    if(cid == "route"){
      wx.navigateTo({
        url: '/pages/selectPoint/selectPoint',
      })
    }
    if(cid == "search"){
      wx.navigateTo({
        url: '/pages/search/search',
      })
    }
  },
  
  //在Page({})中使用下列代码
  //触发表单提交事件，调用接口
  formSubmit(e) {
    var _this = this;
    //调用距离计算接口
    qqmapsdk.direction({
      mode: 'transit',//'transit'(公交路线规划)
      //from参数不填默认当前地址
      from: e.detail.value.start,
      to: e.detail.value.dest,
      success: function (res) {
        console.log(res);
        var ret = res.result.routes[0];
        var count = ret.steps.length;
        var pl = [];
        var coors = [];
        //获取各个步骤的polyline
        for (var i = 0; i < count; i++) {
          if (ret.steps[i].mode == 'WALKING' && ret.steps[i].polyline) {
            coors.push(ret.steps[i].polyline);
          }
          if (ret.steps[i].mode == 'TRANSIT' && ret.steps[i].lines[0].polyline) {
            coors.push(ret.steps[i].lines[0].polyline);
          }
        }
        //坐标解压（返回的点串坐标，通过前向差分进行压缩）
        var kr = 1000000;
        for (var i = 0; i < coors.length; i++) {
          for (var j = 2; j < coors[i].length; j++) {
            coors[i][j] = Number(coors[i][j - 2]) + Number(coors[i][j]) / kr;
          }
        }
        //定义新数组，将coors中的数组合并为一个数组
        var coorsArr = [];
        for (var i = 0; i < coors.length; i++) {
          coorsArr = coorsArr.concat(coors[i]);
        }
        //将解压后的坐标放入点串数组pl中
        for (var i = 0; i < coorsArr.length; i += 2) {
          pl.push({ latitude: coorsArr[i], longitude: coorsArr[i + 1] })
        }
        //设置polyline属性，将路线显示出来,将解压坐标第一个数据作为起点
        _this.setData({
          latitude: pl[0].latitude,
          longitude: pl[0].longitude,
          polyline: [{
            points: pl,
            color: '#FF0000DD',
            width: 8
          }]
        })
      },
      fail: function (error) {
        console.error(error);
      },
      complete: function (res) {
        console.log(res);
      }
    });
  }
})