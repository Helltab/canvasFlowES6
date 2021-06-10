import options from "../options.js";
import {arrRemove} from "../util/commonUtils.js";
import {canvasRedraw, getNodeById} from "../util/canvasUtils.js";
import {CANVAS_VARS, COLOR_VAR} from "../vars/GlobalVars.js";
import {CNode} from "./CNode.js";
import {CRect} from "./CRect.js";
import {CLine} from "./CLine.js";
import {CBlock} from "./CBlock.js";


export class ActNode {
  curNode: CNode
  actBox: CRect
  lineList: CLine[]
  curBlock: CBlock;

  constructor() {
  }
  /**
   * 绘制当前节点的激活边框
   * @param rect
   */
  drawActBox(rect: any) {
    let type = 'node';
    if (rect.constructor === CNode) {
      this.lineList = rect.getLineList();
      this.curNode = rect
      this.curBlock = rect.title
    } else {
      this.curBlock = rect
      this.curNode = getNodeById(rect.nodeId)
      this.lineList = this.curNode.getLineList();
      type = 'block'
    }
    if (CANVAS_VARS.canvasEleArr.indexOf(this.actBox) === -1) {
      this.actBox = new CRect({
        parent: null,
        nodeId: this.curNode.id,
        x: this.curBlock.x,
        y: this.curBlock.y,
        height: this.curBlock.height,
        width: this.curBlock.width,
        lineWidth: 1,
        strokeStyle: COLOR_VAR.ACTIVE,
        radius: this.curBlock.radius
      })
    } else {
      arrRemove(CANVAS_VARS.canvasEleArr, this.actBox)
      this.actBox.x = this.curBlock.x
      this.actBox.y = this.curBlock.y
      this.actBox.radius = this.curBlock.radius
      this.actBox.height = this.curBlock.height
      this.actBox.width = this.curBlock.width
    }
    this.lineList.forEach(line => {
      line.style = line.actStyle
      line.lineWidth = options.conn_line_width + 1
    });
    CANVAS_VARS.canvasLineArr.forEach(line => {
      if (this.lineList.indexOf(line) === -1) {
        line.style = line.idStyle
        line.lineWidth = options.conn_line_width
      }
    })
    CANVAS_VARS.canvasEleArr.push(this.actBox)
    canvasRedraw()
    if (options.onSelect) {
      options.onSelect(this.curBlock.id, type, (res)=>{

      })
    }
  }
}
