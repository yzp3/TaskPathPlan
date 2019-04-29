// pages/search/search.js
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
    displayKey: true,
    searchKey: [
      "美食",
      "酒店",
      "景点",
      "超市",
      "银行",
      "网吧",
    ],
    markers: [],
    suggestion: [],
    backfill: "",
  },

  /**
   * 确认
   */
  confirmtap: function(e){
    console.log(e)
    var _this = this;
    qqmapsdk.search({
      keyword: e.detail.value,
      success: function (res) {
        var mks = []
        for (var i = 0; i < res.data.length; i++) {
          mks.push({ // 获取返回结果，放到mks数组中
            title: res.data[i].title,
            id: res.data[i].id,
            latitude: res.data[i].location.lat,
            longitude: res.data[i].location.lng,
            iconPath: "/imgs/location.png", //图标路径
            width: 30,
            height: 30
          })
        }
        //回传数据
        var pages = getCurrentPages();
        var currentPage = pages[pages.length - 1];
        var prePage = pages[pages.length - 2];
        prePage.setData({ //设置markers属性，将搜索结果显示在地图中
          markers: mks,
        })
        wx.navigateBack({
          
        })
        // wx.openLocation({
        //   latitude: res.data[0].location.lat,
        //   longitude: res.data[0].location.lng,
        // })
      },
      fail: function (res) {
        console.log(res);
      },
      complete: function (res) {
        console.log(res);
      }
    })
  },

  //数据回填方法
  backfill: function (e) {
    var id = e.currentTarget.id;
    for (var i = 0; i < this.data.suggestion.length; i++) {
      if (i == id) {
        var title = this.data.suggestion[i].title
        this.setData({
          backfill: title
        });
        this.confirmtap({
          detail: {value: title}
        })
      }
    }
  },

  //触发关键词输入提示事件
  getsuggest: function (e) {
    var _this = this;
    var loc = "";
    wx.getLocation({
      success: function(res) {
        var lat = res.latitude;
        var lng = res.longitude;
        loc = lat+","+lng;
      },
    })
    //调用关键词提示接口
    qqmapsdk.getSuggestion({
      //获取输入框值并设置keyword参数
      keyword: e.detail.value, //用户输入的关键词，可设置固定值,如keyword:'KFC'
      location: loc,
      //region:'安徽', //设置城市名，限制关键词所示的地域范围，非必填参数
      success: function (res) {//搜索成功后的回调
        console.log(res);
        var sug = [];
        for (var i = 0; i < res.data.length; i++) {
          sug.push({ // 获取返回结果，放到sug数组中
            title: res.data[i].title,
            id: res.data[i].id,
            addr: res.data[i].address,
            city: res.data[i].city,
            district: res.data[i].district,
            latitude: res.data[i].location.lat,
            longitude: res.data[i].location.lng
          });
        }
        _this.setData({ //设置suggestion属性，将关键词搜索结果以列表形式展示
          suggestion: sug,
          displayKey: false
        });
      },
      fail: function (error) {
        console.error(error);
      },
      complete: function (res) {
        console.log(res);
      }
    });
  },

  /**
   * 返回
   */
  backtap: function(e){
    wx.navigateBack({
      
    })
  },

  /**
   * 关键字
   */
  searchCommon: function(e){
    var key = e.target.id;
    this.setData({
      backfill: key,
    })
    this.getsuggest({
      detail: {value: key}
    })
    

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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

  }
})