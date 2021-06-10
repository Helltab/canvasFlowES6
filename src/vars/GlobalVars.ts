import {CanvasList} from "../objects/CanvasList.js";
import {CBlock} from "../objects/CBlock.js";
import {CNode} from "../objects/CNode.js";

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
  // 节点 Id 集合
  cnodeIdSet: new Set<string>(),
  // 画布容器
  canvBox: null,
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
}
export const COLOR_VAR = {
  ACTIVE: 'rgb(88,226,83)', //激活状态颜色
  LINK_BTN_BORDER: 'rgb(90,169,248)', //激活状态颜色
  SERIAL_LINE: '#4be7e7', // 线-串行
  MIX_LINE: '#f89696', // 线-串行
  PARALLEL_LINE: '#e582f1', // 线-串行
  TITLE_BG: '#ffffff',
  BLOCK_BG: '#ffffff',
  CANVAS_BG: '#e5e5e5',
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
