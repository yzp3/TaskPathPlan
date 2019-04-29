// selectPoint/selectPoint.js// 引入SDK核心类
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
    isDisplay: false,
    startPoint: {},
    endPoint: {},
    routePoint: [],
    longitude: 0,
    latitude: 0,
    polyline: [],
    markers: [{}, {}],
    imgSrc: [
      "/imgs/car-active.png",
      "/imgs/bus.png",
      "/imgs/walk.png",
    ],
    myMode: 'driving',
    current: 0,
    info: [],
    distance: 0,
    time: 0,
    busInfo:[],
  },

  /**
   * 导航
   */
  previewtap: function(e){
    var id = e.target.id;
    var ins = "";
    var mode = this.data.myMode
    if(mode==="driving" || mode==="walking"){
      let info = this.data.info;
      if (mode === "driving"){
        ins += "从起点出发";
      }
      for (let i in info) {
        ins += info[i];
        ins += "\n";
      }
      ins = ins + "到达" + this.data.endPoint.name;
    }else if(mode==="transit"){
      let info = this.data.busInfo[id].ins;
      for (let i in info) {
        ins += info[i];
        ins += "\n";
      }
      ins = ins + "到达" + this.data.endPoint.name;
    }
    
    wx.navigateTo({
      url: '../routeNavigation/routeNavigation?context='+ins,
    })
  },

  /**
   * 模式选择，点击图片
   */
  imgtap: function(e){
    var cid = e.currentTarget.id;
    if(cid == 0){
      this.setData({
        imgSrc: [
          "/imgs/car-active.png",
          "/imgs/bus.png",
          "/imgs/walk.png",
        ],
        myMode: 'driving',
        current: 0,
      })
    }else if(cid == 1){
      this.setData({
        imgSrc: [
          "/imgs/car.png",
          "/imgs/bus-active.png",
          "/imgs/walk.png",
        ],
        myMode: 'transit'
      })
    }else if(cid == 2){
      this.setData({
        imgSrc: [
          "/imgs/car.png",
          "/imgs/bus.png",
          "/imgs/walk-active.png",
        ],
        myMode: 'walking',
        current: 0,
      })
    }
    this.pathPlantap();
    
  },

  /**
   * 输入框获得焦点
   */
  pointtap: function(e){
    var cid = e.currentTarget.id;
    wx.navigateTo({
      url: '/pages/mapPoint/mapPoint?cid='+cid,
    })
  },

  /**
   * 开始规划
   */
  pathPlantap: function(e){
    console.log(this.data.mode)
    var _this = this;
    let data = this.data;
    // this.setData({
    //   markers[0]: {
    //     id: 1,
    //     latitude: data.startPoint.lat,
    //     longitude: data.startPoint.log,
    //     iconPath: "/imgs/location.png",
    //     width:20,
    //     height:20,
    //   },
    //   markers[1]: {
    //     id: 2,
    //     latitude: data.endPoint.lat,
    //     longitude: data.endPoint.log,
    //     iconPath: "/imgs/location.png",
    //     width: 20,
    //     height: 20,
    //   }
    // })

    let markers = [];
    markers.push(
      {
        id: 1,
        latitude: data.startPoint.lat,
        longitude: data.startPoint.log,
        iconPath: "/imgs/location.png",
        width:30,
        height:30,
      },
      {
        id: 2,
        latitude: data.endPoint.lat,
        longitude: data.endPoint.log,
        iconPath: "/imgs/location.png",
        width: 30,
        height: 30,
      }
    )
    this.setData({
      markers: markers
    })

    console.log(this);
    //调用距离计算接口
    var myMode = _this.data.myMode;
    qqmapsdk.direction({
      mode: myMode,//'transit'(公交路线规划)
      //from参数不填默认当前地址
      from: {
        latitude: _this.data.startPoint.lat,
        longitude: _this.data.startPoint.log
      },
      to:{
        latitude: _this.data.endPoint.lat,
        longitude: _this.data.endPoint.log
      },
      success: function (res) {
        console.log(res);
        // 驾车或步行
        if (myMode === 'driving' || myMode === 'walking') {
          let ret = res;
          var coors = ret.result.routes[0].polyline, pl = [];
          //坐标解压（返回的点串坐标，通过前向差分进行压缩）
          var kr = 1000000;
          for (var i = 2; i < coors.length; i++) {
            coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
          }
          //将解压后的坐标放入点串数组pl中
          for (var i = 0; i < coors.length; i += 2) {
            pl.push({ latitude: coors[i], longitude: coors[i + 1] })
          }
          var step = res.result.routes[0].steps, ins = [];
          for(let s in step){
            ins.push(step[s].instruction);
          }
          //设置polyline属性，将路线显示出来,将解压坐标第一个数据作为起点
          _this.setData({
            latitude: pl[0].latitude,
            longitude: pl[0].longitude,
            polyline: [{
              points: pl,
              color: '#0ff51a',
              width: 5
            }],
            distance: res.result.routes[0].distance,
            time: res.result.routes[0].duration,
            info: ins
          })
          console.log(ins)
        }
        // 公交
        else if (myMode === 'transit') {
          var rs = [];
          for (let k in res.result.routes){
            var ret = res.result.routes[k];
            var count = ret.steps.length;
            var pl = [];
            var coors = [];
            //路线
            var route = {
              distance: ret.distance,
              time: ret.duration,
              ins: [],
              lines: [],
              title: "",
              walk: 0,
            }
            // var ins = [];
            //获取各个步骤的polyline
            for (var i = 0; i < count; i++) {
              if (ret.steps[i].mode == 'WALKING' && ret.steps[i].polyline) {
                coors.push(ret.steps[i].polyline);
                route.walk += ret.steps[i].distance;
                let step = ret.steps[i].steps;
                // ins.push("步行")
                for(let s in step){
                  route.ins.push(step[s].instruction);
                }
                // route.ins.push(ins);
                // ins = [];
              }
              if (ret.steps[i].mode == 'TRANSIT' && ret.steps[i].lines[0].polyline) {
                coors.push(ret.steps[i].lines[0].polyline);
                var line = ret.steps[i].lines[0];//TODO
                route.title = (line.title+"路");
                route.ins.push("乘坐开往" + line.destination.title + "方向的" + line.title + "路");
                route.ins.push("在" + line.geton.title + "上车，" +"在" + line.getoff.title + "下车，");
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
            rs.push(route);
            route = {};
          }
          //设置polyline属性，将路线显示出来,将解压坐标第一个数据作为起点
          _this.setData({
            latitude: pl[0].latitude,
            longitude: pl[0].longitude,
            polyline: [{
              points: pl,
              color: '#0ff51a',
              width: 5
            }],
            busInfo: rs,
          })
          // console.log(_this.data.busInfo);
          
        }//else if (myMode === 'walking') {
          
        // }
        if(_this.data.endPoint!=null){
          _this.setData({
            isDisplay: true
          })
        }
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.getLocation({
      type: "gcj02",
      success: function (res) {
        var log = res.longitude;
        var lat = res.latitude;
        // var start = {
        //   log: log,
        //   lat: lat,
        //   id: "startPoint"
        // }
        that.data.startPoint.log = log;
        that.data.startPoint.lat = lat;
        that.data.startPoint.id = "startPoint";
        that.setData({
          latitude: lat,
          longitude: log,
        })
      },
    })
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