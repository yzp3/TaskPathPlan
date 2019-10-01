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
    scale: 13,
    polyline: [],
    markers: [],
  },

  myGet: function(){
    var that = this;
    wx.getLocation({
      type: 'wgs84',  //返回可以用于wx.openLocation的经纬度
      success: function (res) {
        var log = res.longitude
        var lat = res.latitude
        that.setData({
          longitude: log,
          latitude: lat
        })
      }, fail: function () {
        wx.showModal({
          title: '授权失败',
          content: '获取位置信息失败，使用功能将受到限制！',
          confirmText: '授权开启',
          cancelText: '我知道了',

        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    // 获取位置信息
    wx.getSetting({
      success: (res) => {
        console.log(res)
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {//非初始化进入该页面,且未授权
          wx.showModal({
            title: '是否授权当前位置',
            content: '需要获取您的地理位置，请确认授权，否则无法获取您所需数据',
            success: function (res) {
              console.log(res)
              if (res.cancel) {
                that.setData({
                  isshowCIty: false
                })
                wx.showToast({
                  title: '授权失败',
                  icon: 'success',
                  duration: 1000
                })
              } else if (res.confirm) {
                wx.openSetting({
                  success: function (dataAu) {
                    console.log(dataAu)
                    if (dataAu.authSetting["scope.userLocation"] == true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 1000
                      })
                      //再次授权，调用getLocationt的API
                      that.myGet();
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'success',
                        duration: 1000
                      })
                    }
                  }
                })
              }
            }
          })
        } else if (res.authSetting['scope.userLocation'] == undefined) {//初始化进入
          that.myGet();
        }
        else { //授权后默认加载
          that.myGet();
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.mapCtx = wx.createMapContext('myMap');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // this.mapCtx.moveToLocation()
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
    if (cid == "moveToLocation") {//点击了定位图片
      this.mapCtx.moveToLocation()
    }
    else if (cid == "plus") {//点击了加号
      let scale = this.data.scale;
      if (scale >= 5 && scale <= 18) {
        scale++;
        if(scale > 18){
          scale = 18
        }
        if (scale < 5) {
          scale = 5
        }
        this.setData({
          scale
        })
      }
    } 
    else if (cid == "reduce") {
      let scale = this.data.scale;
      if (scale >= 5 && scale <= 18) {
        scale--;
        if (scale > 18) {
          scale = 18
        }
        if (scale < 5) {
          scale = 5
        }
        this.setData({
          scale
        })
      }
    }
    else{
      wx.navigateTo({
        url: '/pages/'+cid+'/'+cid,
      })
    }
    // if(cid == "route"){
    //   wx.navigateTo({
    //     url: '/pages/selectPoint/selectPoint',
    //   })
    // }
    // if(cid == "search"){
    //   wx.navigateTo({
    //     url: '/pages/search/search',
    //   })
    // }
    // if (cid == "user") {
    //   wx.navigateTo({
    //     url: '/pages/user/user',
    //   })
    // }
  },
})