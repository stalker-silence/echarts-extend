"use strict";
const stock = function (o = {}) {
  this.init(o);
  // if(Object.keys(o).length !== 0) { this.init(o); }
}

stock.prototype.init = function(o={}){
  this.defaultVal(o);
}

stock.prototype.defaultVal = function(o){
  const xOption = {
    startTime: [9, 30, 0, 0],
    endTime: [15, 0, 0, 0],
    dataStep: 1000 * 60,
    xAxisStep: 1000 * 60 * 30,
    format: 'HH:mm',
    exclude: [
      { 
        startTime: [11,31,0,0],
        endTime: [13,0,0,0]
      }
    ]
  }

  this.extend(true, xOption, o.xOption);
  this.xOption = xOption;
  delete o.xOption;

  this.xData = this.getTimeLine(xOption.startTime, xOption.endTime, xOption.dataStep, xOption.format, xOption.exclude);
  this.param = {option:{} };
  // this.param = {option:{}, data: this.mockData(this.xData.length) };



  // Object.assign(this.param, o);
  this.extend(true,this.param, o);
  this.xVisibleLine = this.getTimeLine(xOption.startTime, xOption.endTime, xOption.xAxisStep, xOption.format, xOption.exclude);
  // this.xVisibleLine = this.getTimeLine([9,30,0,0], [15,0,0,0], 1000*60*30, 'HH:mm', [{startTime:[11,31,0,0],endTime:[13,0,0,0]}]);
  // this.xVisibleLine = this.getTimeLine([9,30,0,0], [15,0,0,0], 1000*60*30, 'HH:mm', [{startTime:[12,0,0,0],endTime:[13,0,0,0]}]);
  this.data = Object.prototype.toString.call(this.param.data).slice(8,-1) === "Array" ? this.param.data : this.mockData(this.xData.length);
  const option = {}
  this.extend(true, option , this.defaultOption(), this.param.option);
  this.option = this.param.option = option;
  // this.data = this.mockData(this.xData.length);
  /**
   * REVIEW @param how to pass
   * TODO args auto gen
   */

  /**
   * TODO judge variable type to utilities
   * NOTE improve @var el 
   */
  const plainType = Object.prototype.toString.call(this.param.el).slice(8, -1);
  const reg = /^HTML[a-zA-Z]+$/;
  if(plainType === "Undefined"){
    const el = document.createElement('div');
    el.style.width = '100%';
    el.style.height = '100%';
    document.body.appendChild(el);
    this.el = el;
  } else if(reg.test(plainType)) { 
    this.el = this.param.el;
  } else {
    this.el = document.querySelector(this.param.el);
  }

  this.myChart = echarts.init(this.el);

}

/**
 * object merge
 * @param same as jquery or zepto
 * TODO do it by javascript plain method to utilities
 */
stock.prototype.extend = $.extend;

/**
 * mock data
 * @return float range 8.00 ~ 20.99
 */
stock.prototype.mockDataItem = function(){
  return parseInt(Math.random()*12 + 8) + parseInt(Math.random() * 99)/100;
}

/**
 * mock stock data
 * @param {Number} num - mock data count 
 * @returns {Array} stock data Collection
 */
stock.prototype.mockData = function(num){
  const data = []
  for(let i = 0; i < num; i++){
    data.push(this.mockDataItem());
  }
  return data;
}

/**
 * 
 * REVIEW about start time
 * @param {Array} startTime 
 * @param {Array} endTime 
 * @param {Number} step 
 * @param {String} format 
 * @param {Array} exclude 
 */
stock.prototype.getTimeLine = function(
  startTime=[9,30,0,0],
  endTime=[15,0,0,0],
  step = 1000*60,
  format='HH:mm',
  exclude=[{startTime:[11,31,0,0],endTime:[13,0,0,0]}]
){
  const excludeList = this.hashExcludeTimeLine(exclude, step);
  const data = this.genTimeLine(startTime,endTime,step,excludeList).map(v=>moment(v).format(format));
  return data;
}

stock.prototype.hashExcludeTimeLine = function(exclude, step){
  let data = [];
  for (let i = 0, l = exclude.length; i < l; i++) {
    data = data.concat(this.genTimeLine(exclude[i].startTime, exclude[i].endTime, step));
  }
  return data;
}

stock.prototype.genTimeLine = function(startTime,endTime,step, exclude = []){
  const TIME = new Date();
  const data = [];
  let sTime = TIME.setHours.apply(TIME, startTime);
  let eTime = TIME.setHours.apply(TIME, endTime);
  for (; sTime <= eTime; sTime = sTime + step) {
    if (exclude.indexOf(sTime) !== -1) continue;
    data.push(sTime);
  }
  return data;
}

stock.prototype.defaultOption = function(){
  const me = this;
  return {
          title: {
              text: '某支A股折线图',
              subtext: '纯属虚构',
              x:'center'
          },
          tooltip: {
              trigger: 'axis',
              axisPointer: {
                  type: 'cross'
              }
          },
          toolbox: {
              show: true,
              feature: {
                  saveAsImage: {}
              }
          },
          xAxis: {
              type: 'category',
              boundaryGap: false,
              axisLabel:{
                interval: (idx,val) =>{
                  const data = this.xVisibleLine;
                  // const data = this.getTimeLine(startTime=[9,30,0,0],endTime=[15,0,0,0],step = 1000*60*30,format='HH:mm',exclude=[{startTime:[12,0,0,0],endTime:[13,0,0,0]}]);
                  return data.indexOf(val) !== -1;
                }
              },
              data: this.xData
          },
          yAxis: {
              type: 'value',
              axisLabel: {
                  formatter: '{value} ¥'
              },
              axisPointer: {
                  snap: true
              }
          },
          visualMap: {
              show: false,
              dimension: 1,
              pieces:[
                {
                    // type: 'piecewise',
                    "gte": this.data[0],
                    "label": ">= "+this.data[0],
                    "color": "green"
                }, {
                    "lt": this.data[0],
                    "gt": 0,
                    "label": "< "+this.data[0],
                    "color": "red"
                }
              ]
          },
          series: [
              {
                  name: '股价',
                  type: 'line',
                  smooth: true,
                  data:this.data,
              }
          ]
      }
}

stock.prototype.draw = function(){
  this.update(this.option);
}

stock.prototype.update = function(option){
  this.myChart.setOption(option, true);
}
