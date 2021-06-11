import {CanvasList} from "../objects/CanvasList.js";
import {CBlock} from "../objects/CBlock.js";
import {CNode} from "../objects/CNode.js";
import options from "../options.js";

/**
 * 全局变量
 */
export const CANVAS_VARS = {
  // 元素数组
  canvasEleArr: new CanvasList<any>(null),
  // 禁用块数组
  disableBlockArr: new CanvasList<CBlock>(null),
  // 节点数组
  canvasNodeArr: new CanvasList<CNode>(null),
  // 画线数组
  canvasLineArr: [],
  // 两点线的数组, 用于判断交叉
  canvasDirectLine: [],
  // 节点 Id 集合
  cnodeIdSet: new Set<string>(),
  // 画布容器
  canvBox: null,
  mapCanv: null,
  mapCanvCtx: null,
  mapCanvBox: null,

  // 真正的画布
  realCanv: null,
  // 真正的画布环境
  realCtx: null,
  // 缓冲画布
  cacheCanv: null,
  // 缓冲画布环境
  cacheCtx: null,
  // 当前元素
  curElement: null,
  // 激活节点
  actNode: null,
  // 第一个节点
  rootNode: null,
  map_pointer: undefined

}
export const COLOR_VAR = {
  ACTIVE: '#55bb8a', //激活状态颜色
  LINK_BTN_BORDER: '#10aec2', //
  SERIAL_LINE: '#22a2c3', // 线-串行
  MIX_LINE: '#d2b42c', // 线-串行
  PARALLEL_LINE: '#ad6598', // 线-串行
  TITLE_BG: '#f5cfb8',
  BLOCK_BG: '#eef7f2',
  // CANVAS_BG: '#e4dfd7',
  CANVAS_BG: '#242424',
  ADD_BLOCK_BTN_BG: '#fff',
}
export const ELE_GROUP_VAR = {
  ADD_NODE_BTN: 'addNodeBtn',
  ADD_BTN: 'addBtn',
  EDIT_BTN: 'editBtn',
  DEL_BTN: 'delBtn',
  OTHER: 'other',
}

export const RECT_TYPE = {
  TITLE: 'title',
  BLOCK: 'block',
}

export const MAP = {
  height: 0,
  width: 0,
  cur_height: 0,
  cur_width: 0,
}
export function getMapSize() {
  return {
    h: MAP.cur_height * options.mapScale,
    w: MAP.cur_width * options.mapScale,
  }
}
export function getPointerSize() {

}
