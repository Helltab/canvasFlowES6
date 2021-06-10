import LOCAL_KEY from "./localstore.js"
import options, {OptionType} from "./options.js";
import R from './imageResource.js'
import {CanvasList} from "./objects/CanvasList.js";
import {genUUID} from "./util/commonUtils.js";
import {CANVAS_VARS} from "./vars/GlobalVars.js";

import {
  initContainerData, canvasRedraw, drawNode,
  drawNodeByPosition, getData, loadCanvas, reload, saveCanvas
} from "./util/canvasUtils.js";
import {clearScreen, onClick, onDBClick, onMove} from "./eventHandler.js";

initContainerData()

/**
 * 将持久化的数据进行重绘
 */
function drawNodeList(nodes = JSON.parse(sessionStorage.getItem(LOCAL_KEY.DATA))) {
  try {
    if (!nodes || nodes.length < 0) return
    clearScreen()
    initContainerData()
    nodes.forEach(node => {
      drawNodeByPosition(node, nodes)
    })
    canvasRedraw()
  } catch (e) {
    console.error("数据加载失败")
  }
}

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
    this.elem = args.elem || 'canvasTreeFlow'
    this.initId = args.initId || genUUID()
    // 加载图片
    this.loadR()
  }

  loadR() {
    /**
     * 三种方式加载图片,
     * 1. 如果自定义, 请传入 options.iamges  { [key in ImageType]: any}
     * 2. 如果是 node 环境, 用 require 加载
     * 3. 如果是普通环境, 直接加载
     */
    let _require = null;
    try {
      _require = require
    }catch (e){}
    if(options.images) {
      for (let k in R) {
        R[k].obj = options.images[k]
      }
    } else if(_require) {
      for (let k in R) {
        R[k].obj = new Image()
      }
      R.add_block.obj.src = require("../static/img/btn_add_block.png")
      R.add_node.obj.src = require("../static/img/btn_add_node.png")
      R.edit.obj.src = require("../static/img/btn_edit.png")
      R.del.obj.src = require("../static/img/btn_del.png")
    } else {
      for (let k in R) {
        R[k].obj = new Image()
        R[k].obj.src = R[k].src
      }
    }
    let num = 4, i = 0
    for (let k in R) {
      R[k].obj.onload = () => {
        i++
        if (i === num) {
          console.log('图片全部加载成功')
          if (options.initData) {
            this.init()
            drawNodeList(JSON.parse(options.initData))
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

    CANVAS_VARS.canvBox.style.width = (options.canv_w - 208) + 'px'
    CANVAS_VARS.canvBox.style.height = (options.canv_h + 8) + 'px'
    CANVAS_VARS.canvBox.style.overflow = 'auto'
    CANVAS_VARS.realCanv = document.createElement("canvas");
    CANVAS_VARS.realCanv.id = this.elem + '_real_canvas'
    CANVAS_VARS.realCanv.width = options.canv_w;
    CANVAS_VARS.realCanv.height = options.canv_h;
    CANVAS_VARS.realCtx = CANVAS_VARS.realCanv.getContext("2d");
    CANVAS_VARS.realCtx.fillStyle = "#b41f1f";
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


}


export default CanvasTreeFlow

