// mapPoint/mapPoint.js

Page({

  /**
   * 页面的初始数据
   */
  data: {
    point:"",
    longitude:116,
    latitude:39,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    var cid = options.cid;
    var that = this;
    wx.getLocation({
      type:"gcj02",
      success: function(res) {
        var log = res.longitude;
        var lat = res.latitude;
        that.setData({
          longitude: log,
          latitude: lat,
          point: cid
        })
      },
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    wx.chooseLocation({
      success: function(res) {
        var point = that.data.point;
        var dataPoint = {
          id: point,
          lat: res.latitude,
          log: res.longitude,
          name: res.name
        }
        //回传数据
        var pages = getCurrentPages();
        var currentPage = pages[pages.length-1];
        var prePage = pages[pages.length-2];
        if (point === "startPoint") {
          console.log(1);
          prePage.setData({
            startPoint: dataPoint
          })
        } else if (point === "endPoint") {
          console.log(2);
          prePage.setData({
            endPoint: dataPoint
          })
        } else {
          console.log(3);
          var routePoint = prePage.data.routePoint;
          routePoint.push(dataPoint);
          prePage.setData({
            routePoint
          })
        }
        wx.navigateBack({
          delta: 1
        })

        // wx.setStorageSync(JSON.stringify(dataPoint), point);
        // wx.redirectTo({
        //   url: '/pages/selectPoint/selectPoint?lat='+res.latitude+'&log='+res.longitude+'&name='+res.name,
        // })
      },
    })
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