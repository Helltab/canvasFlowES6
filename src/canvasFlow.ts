import options, {OptionType} from "./options.js";
import R from './imageResource.js'
import {genUUID} from "./util/commonUtils.js";
import {CANVAS_VARS, COLOR_VAR, MAP} from "./vars/GlobalVars.js";

import {canvasRedraw, drawNode, drawNodeList, getData, initContainerData, loadCanvas, reload, saveCanvas} from "./util/canvasUtils.js";
import {onClick, onDBClick, onMove} from "./eventHandler.js";

initContainerData()


/**
 * 主体类
 */
class CanvasTreeFlow {
  elem: string;
  initId: string;
  loadCanvas = loadCanvas
  saveCanvas = saveCanvas
  getData = getData
  genUUID = genUUID
  reload = reload

  constructor(args: OptionType) {
    Object.assign(options, args)
    MAP.height = options.canv_h * options.mapScale
    MAP.width = options.canv_w * options.mapScale
    MAP.cur_height = MAP.height
    MAP.cur_width = MAP.width
    this.elem = args.elem || 'canvasTreeFlow'
    this.initId = args.initId || genUUID()
    // 加载图片
    this.loadR()
  }

  loadR() {
    /**
     * 三种方式加载图片,
     * 1. 如果自定义, 请传入 options.images  { [key in ImageType]: any}
     * 2. 如果是 node 环境, 用 require 加载
     * 3. 如果是普通环境, 直接加载
     */
    let _require = null;
    try {
      _require = require
      _require = true
    } catch (e) {
    }
    if (options.images) {
      for (let k in R) {
        R[k].obj = options.images[k]
      }
    } else if (_require) {
      for (let k in R) {
        R[k].obj = new Image()
      }
      R.add_block.obj.src = require("../static/img/btn_add_block.png")
      R.add_node.obj.src = require("../static/img/btn_add_node.png")
      R.edit.obj.src = require("../static/img/btn_edit.png")
      R.del.obj.src = require("../static/img/btn_del.png")
      R.rect_bg.obj.src = require("../static/img/texture_rect_bg.png")
      R.canvas_bg.obj.src = require("../static/img/texture_canvas_bg.png")
    } else {
      for (let k in R) {
        R[k].obj = new Image(R[k].width, R[k].height)
        R[k].obj.src = R[k].src
      }
    }
    let num = Object.keys(R).length, i = 0
    for (let k in R) {
      R[k].obj.onload = () => {
        i++
        if (i === num) {
          console.log('图片全部加载成功')
          // 需要将序列化数据重绘
          if (options.initData) {
            this.init()
            drawNodeList(JSON.parse(options.initData))
            // 新建
          } else {
            initContainerData()
            this.init()
            options.initDataFun(getData())
          }
        }
      }
    }

  }

  /**
   * 初始化一个默认的节点
   * 1. 在指定的 div 下生成两个 canvas, 一个用来显示, 一个用来生成缓存图标, 构成双缓冲
   * 2. 为展示 canvas 添加点击事件监听
   * 3. 画一个默认的节点, 包括: title, editBtn, addBtn (第一个节点是不允许删除的..)
   * 4. 通过 display 的双缓冲转换显示到页面中
   */
  init() {
    CANVAS_VARS.canvBox = document.getElementById(this.elem);
    this.createMap()
    CANVAS_VARS.canvBox.style.width = (options.canv_w + 8) + 'px'
    CANVAS_VARS.canvBox.style.height = (options.canv_h + 8) + 'px'
    CANVAS_VARS.canvBox.style.overflow = 'auto'
    CANVAS_VARS.realCanv = document.createElement("canvas");
    CANVAS_VARS.realCanv.id = this.elem + '_real_canvas'
    CANVAS_VARS.realCanv.width = options.canv_w;
    CANVAS_VARS.realCanv.height = options.canv_h;
    CANVAS_VARS.realCtx = CANVAS_VARS.realCanv.getContext("2d");
    CANVAS_VARS.realCtx.fillStyle = COLOR_VAR.CANVAS_BG;
    CANVAS_VARS.realCtx.fillRect(0, 0, options.canv_w, options.canv_h);

    // 点击事件
    CANVAS_VARS.realCanv.addEventListener("mousedown", onClick);

    // 双击事件
    CANVAS_VARS.realCanv.addEventListener("dblclick", onDBClick);
    // 鼠标点击抬起事件
    CANVAS_VARS.realCanv.addEventListener("mouseup", () => {
      CANVAS_VARS.realCanv.removeEventListener('mousemove', onMove, false)
    });
    CANVAS_VARS.cacheCanv = document.createElement("canvas")
    CANVAS_VARS.cacheCanv.style.display = 'none'
    CANVAS_VARS.cacheCanv.width = CANVAS_VARS.realCanv.width
    CANVAS_VARS.cacheCanv.id = `cache_${this.elem}`
    CANVAS_VARS.cacheCanv.height = CANVAS_VARS.realCanv.height
    CANVAS_VARS.canvBox.appendChild(CANVAS_VARS.realCanv)
    CANVAS_VARS.canvBox.appendChild(CANVAS_VARS.cacheCanv)
    CANVAS_VARS.cacheCtx = CANVAS_VARS.cacheCanv.getContext('2d')

    drawNode({id: this.initId});
    // display()
    canvasRedraw()

  }

  /**
   * 小地图
   */
  createMap() {
    let map = document.createElement("div");
    map.id = this.elem + "_map"
    CANVAS_VARS.canvBox.appendChild(map)
    map.style.width = (MAP.width + 20) + "px";
    map.style.height = (MAP.height + 20) + "px";
    map.style.border = "1px solid #1f2040ff";
    map.style.backgroundColor = "#1f2040f2"
    map.style.position = "absolute";
    if (!options.showMap) {
      map.style.display = "none";
    }
    map.style.top = (options.canv_h - MAP.height - 20) + 'px'
    map.style.left = (options.canv_w - MAP.width - 20) + 'px'
    let map_canv = document.createElement("canvas");
    map_canv.id = this.elem + "_map_canvas"
    map_canv.style.width = MAP.width + "px";
    map_canv.style.height = MAP.height + "px";
    map.appendChild(map_canv)
    let map_pointer = document.createElement("div");
    map_pointer.id = this.elem + "_map_pointer"
    map_pointer.style.width = (MAP.width) + "px";
    map_pointer.style.height = (MAP.height) + "px";
    map_pointer.style.border = "1px solid #5cb3cc43";
    map_pointer.style.backgroundColor = "#5cb3cc23"
    map_pointer.style.position = "absolute";
    map_pointer.style.top = "0";
    map_pointer.style.left = "0";
    let lastP = {x: 0, y: 0}
    let lastOff = {left: 0, top: 0}

    function onMoveFun(e) {
      lastOff.left += e.clientX - lastP.x
      lastOff.top += e.clientY - lastP.y
      if (lastOff.left < 0) {
        lastOff.left = 0
      }
      if (lastOff.left + MAP.cur_width > MAP.width) {
        lastOff.left = MAP.width - MAP.cur_width
      }
      if (lastOff.top < 0) {
        lastOff.top = 0
      }
      if (lastOff.top + MAP.cur_height > MAP.height) {
        lastOff.top = MAP.height - MAP.cur_height
      }
      CANVAS_VARS.canvBox.scrollTop = lastOff.top / options.mapScale * (MAP.height / MAP.cur_height)
      CANVAS_VARS.canvBox.scrollLeft = lastOff.left / options.mapScale * (MAP.width / MAP.cur_width)
      e.target.style.left = lastOff.left + 'px'
      e.target.style.top = lastOff.top + 'px'
      lastP = {x: e.clientX, y: e.clientY}
      e.preventDefault()
    }

    map_pointer.addEventListener("mousedown", function (e) {
      lastP = {x: e.clientX, y: e.clientY}
      map_pointer.addEventListener("mousemove", onMoveFun, false)
    }, false)
    map_pointer.addEventListener("mouseup", function (e) {
      map_pointer.removeEventListener("mousemove", onMoveFun, false)
    }, false)
    map_pointer.addEventListener("mouseover", function (e) {
      map_pointer.removeEventListener("mousemove", onMoveFun, false)
    }, false)

    map.appendChild(map_pointer)
    CANVAS_VARS.mapCanv = map_canv
    CANVAS_VARS.mapCanvCtx = map_canv.getContext('2d')
    CANVAS_VARS.map_pointer = map_pointer
  }
}

export default CanvasTreeFlow

