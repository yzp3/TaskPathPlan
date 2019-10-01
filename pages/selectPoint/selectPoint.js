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
    error: "",
    startPoint: {},
    endPoint: {},
    routePoint: [],
    longitude: 0,
    latitude: 0,
    polyline: [{
      points: [],
      color: '#0ff51a',
      width: 5
    }],
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
    busInfo: [],
    sortPoint: [],
    flag: false
  },

  /**
   * 导航预览
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
    var that = this;
    wx.chooseLocation({
      success: function (res) {
        var point = cid;
        var dataPoint = {
          id: point,
          lat: res.latitude,
          log: res.longitude,
          name: res.name
        }
        //回传数据
        var prePage = that;
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
          routePoint[dataPoint.id] = dataPoint;
          prePage.setData({
            routePoint
          })
        }
      },
    })
  },

  /**
   * 添加途径点
   */
  addPointtap: function(e){
    var point = this.data.routePoint;
    point.push({

    })
    this.setData({
      routePoint: point
    })
  },

  /**
   * 计算距离
   */
  calDistance: function(newFrom, route){
    var sortPoint = this.data.sortPoint;
    sortPoint.push(newFrom);
    var _this = this;
    qqmapsdk.calculateDistance({
      mode: "straight",
      from: newFrom,
      to: route,
      success: function (res) {//成功后的回调
        var ele = res.result.elements;
        ele.sort(function cmp(a, b) {
          return a.distance - b.distance;
        })
        var to = ele.shift().to;
        newFrom = {
          latitude: to.lat,
          longitude: to.lng
        }
        route = [];
        if (ele.length > 0) {
          for (let i in ele) {
            route.push({
              latitude: ele[i].to.lat,
              longitude: ele[i].to.lng
            });
          }
          _this.calDistance(newFrom, route);
        }else{
          sortPoint.push({
            latitude: to.lat,
            longitude: to.lng
          });
          sortPoint.push({
            latitude: _this.data.endPoint.lat,
            longitude: _this.data.endPoint.log
          });
          console.log(sortPoint)
        }
        _this.setData({
          sortPoint: sortPoint
        })
      },
      fail: function (error) {
        console.error(error);
      },
      complete: function (res) {
        console.log(res);
      }
    })
  },

  /**
   * 多地点路径规划
   */
  mutiPoint: function(){
    var routePoint = this.data.routePoint;
    var _this = this;
    if(routePoint.length == 0){
      var sortPoint = [];
      sortPoint.push(
        {
        latitude: _this.data.endPoint.lat,
        longitude: _this.data.endPoint.log
        },
        {
        latitude: _this.data.startPoint.lat,
        longitude: _this.data.startPoint.log
        },
      );
      _this.setData({
        sortPoint: sortPoint
      })
      return true;
    }
    var route = [];
    for(let i in routePoint){
      route.push({
        latitude: routePoint[i].lat,
        longitude: routePoint[i].log
      });
    }
    var newFrom ={
      latitude: this.data.startPoint.lat, 
      longitude: this.data.startPoint.log
    }
    this.calDistance(newFrom, route);
    return true;
  },

  /**
   * 开始规划
   */
  pathPlantap: function (e) {
    this.setData({
      sortPoint: [],
      markers: [],
      polyline: [{
        points: [],
        color: '#0ff51a',
        width: 5
      }],
      flag: true,
      info: [],
      distance: 0,
      time: 0,
      busInfo: [],
    })
    if(this.data.flag && this.mutiPoint()){
      var _this = this;
      let data = this.data;
      console.log(this);
      //调用距离计算接口
      var myMode = _this.data.myMode;
      var sortPoint = _this.data.sortPoint;
      var colors = ["#0ff51a", "#ffb6c1", "#4169e1", "#ff8c00"];
      var c = 0;
      for(var j = 0; j < sortPoint.length-1; j++){
        let markers = _this.data.markers;
        if(c == 4){
          c = 0;
        }
        markers.push(
          {
            id: j,
            title: j+1,
            callout:{
              content: j+1,
              fontSize: 20,
              textAlign: 'center'
            },
            latitude: sortPoint[j].latitude,
            longitude: sortPoint[j].longitude,
            iconPath: "/imgs/location.png",
            width: 30,
            height: 30,
          },
          {
            id: j + 1,
            title: j + 2,
            callout: {
              content: j + 2,
              fontSize: 20,
              textAlign: 'center'
            },
            latitude: sortPoint[j+1].latitude,
            longitude: sortPoint[j+1].longitude,
            iconPath: "/imgs/location.png",
            width: 30,
            height: 30,
          }
        )
        _this.setData({
          markers: markers
        })
        qqmapsdk.direction({
          mode: myMode,//'transit'(公交路线规划)
          //from参数不填默认当前地址
          from: sortPoint[j],
          to: sortPoint[j+1],
          success: function (res) {
            console.log(res);
            // 驾车或步行
            if (myMode === 'driving' || myMode === 'walking') {
              let ret = res;
              var coors = ret.result.routes[0].polyline;
              var pl = [];
              //坐标解压（返回的点串坐标，通过前向差分进行压缩）
              var kr = 1000000;
              for (var i = 2; i < coors.length; i++) {
                coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
              }
              //将解压后的坐标放入点串数组pl中
              for (var i = 0; i < coors.length; i += 2) {
                pl.push({ latitude: coors[i], longitude: coors[i + 1] })
              }
              var step = res.result.routes[0].steps, ins = _this.data.info;
              for (let s in step) {
                ins.push(step[s].instruction);
              }
              if (j < sortPoint.length - 2){
                ins.push("到达"+_this.data.routePoint[j].name)
              }
              var poly = _this.data.polyline;
              poly.push({
                points: pl,
                color: colors[c],
                width: 5
              });
              //设置polyline属性，将路线显示出来,将解压坐标第一个数据作为起点
              _this.setData({
                latitude: pl[0].latitude,
                longitude: pl[0].longitude,
                polyline: poly,
                distance: _this.data.distance+res.result.routes[0].distance,
                time: _this.data.time+res.result.routes[0].duration,
                info: ins,
                flag: false
              })
              console.log(ins)
            }
            // 公交
            else if (myMode === 'transit') {
              var rs = [];
              for (let k in res.result.routes) {
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
                    for (let s in step) {
                      route.ins.push(step[s].instruction);
                    }
                    // route.ins.push(ins);
                    // ins = [];
                  }
                  if (ret.steps[i].mode == 'TRANSIT' && ret.steps[i].lines[0].polyline) {
                    coors.push(ret.steps[i].lines[0].polyline);
                    var line = ret.steps[i].lines[0];//TODO
                    route.title = (line.title + "路");
                    route.ins.push("乘坐开往" + line.destination.title + "方向的" + line.title + "路");
                    route.ins.push("在" + line.geton.title + "上车，" + "在" + line.getoff.title + "下车，");
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
              var poly = _this.data.polyline;
              poly.push({
                points: pl,
                color: colors[c],
                width: 5
              });
              //设置polyline属性，将路线显示出来,将解压坐标第一个数据作为起点
              _this.setData({
                latitude: pl[0].latitude,
                longitude: pl[0].longitude,
                polyline: poly,
                busInfo: rs,
                flag: false
              })

            }//else if (myMode === 'walking') {

            // }
            if (_this.data.endPoint != null) {
              _this.setData({
                isDisplay: true
              })
            }
          },
          fail: function (error) {
            console.error(error);
            _this.setData({
              error: error.message,
              isDisplay: false,
            })
          },
          complete: function (res) {
            console.log(res);
            c++;
          }
        });
      }
      //保存历史记录    
      let startName = _this.data.startPoint.name === undefined ? '我的位置' : _this.data.startPoint.name;
      let endName = _this.data.endPoint.name === undefined ? '' : _this.data.endPoint.name;
      var dataRecord = '->';
      for (let t in _this.data.routePoint){
        dataRecord =  dataRecord + _this.data.routePoint[t].name + '->';
      }
      dataRecord = startName + dataRecord + endName;
      var recs = wx.getStorageSync('records');
      if(recs){
        recs.push(dataRecord);
        let x = new Set(recs);
        recs = [...x];
      }else{
        recs = [dataRecord];
      }
      wx.setStorageSync('records', recs);
    }
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