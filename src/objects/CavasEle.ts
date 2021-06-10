import {addCEle} from "../util/canvasUtils.js";
import options from "../options.js";
import {genUUID} from "../util/commonUtils.js";
import {CANVAS_VARS, ELE_GROUP_VAR} from "../vars/GlobalVars.js";
import {CRect} from "./CRect.js";
export class CanvasEle {
  static allIds: () => any;
  parent: CRect;
  nodeId: string;
  clickFun: Function;
  y: number;
  x: number;
  id: string;
  group: string;
  constructor(args: {
    parent: CRect,
    nodeId: string,
    id?: string,
    group?: string,
  }) {
    addCEle(this)
    this.clickFun = null
    this.parent = args.parent || null
    this.nodeId = args.nodeId
    this.group = args.group || ELE_GROUP_VAR.OTHER
    if (args.id && CanvasEle.allIds().indexOf(args.id) !== -1) {
      console.error("id 重复了", args.id)
    }
    this.id = args.id || genUUID()
  }

  addClick(fun: (e?: MouseEvent) => void) {
    this.clickFun = fun;
  }
}

CanvasEle.allIds = function () {
  return CANVAS_VARS.canvasEleArr.map(x => x.id)
}
