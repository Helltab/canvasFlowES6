import {CanvasEle} from "./CavasEle.js";
import options from "../options.js";
import {addCEle} from "../util/canvasUtils.js";
import {CANVAS_VARS} from "../vars/GlobalVars.js";
import {CPoint} from "./CPoint.js";
import {CNode} from "./CNode";

export class CLine extends CanvasEle {
  preEle: CanvasEle;
  toNode?: CNode;
  style: any;
  idStyle: any;
  actStyle: any;
  lineWidth: any;
  fromP: CPoint;
  toP: CPoint;
  bezier: boolean;

  constructor(args: {
    fromP: CPoint,
    toP: CPoint,
    style: any,
    lineWidth: any,
    preEle: CanvasEle,
    bezier?: boolean,
    id?: string
    toNode?: CNode
  }) {
    super({parent: null, nodeId: null, id: args.id});
    this.fromP = args.fromP
    this.toP = args.toP
    this.style = args.style
    this.idStyle = args.style
    this.lineWidth = args.lineWidth
    this.preEle = args.preEle
    this.bezier = args.bezier
    this.toNode = args.toNode
    this.actStyle = options.active_line
  }

  draw() {
    CANVAS_VARS.cacheCtx.beginPath()
    CANVAS_VARS.cacheCtx.strokeStyle = this.style
    CANVAS_VARS.cacheCtx.lineWidth = this.lineWidth
    CANVAS_VARS.cacheCtx.moveTo(this.fromP.x, this.fromP.y)
    // 判断是 bezier 还是直线
    if (this.bezier) {
      let offX = (this.toP.x - this.fromP.x) / 10
      let offY = 0
      CANVAS_VARS.cacheCtx.bezierCurveTo(this.toP.x - offX, this.fromP.y - offY, this.fromP.x + offX, this.toP.y + offY, this.toP.x, this.toP.y)
    } else {
      CANVAS_VARS.cacheCtx.lineTo(this.toP.x, this.toP.y)
    }
    CANVAS_VARS.cacheCtx.stroke()
    addCEle(this)
    return this
  }

  /**
   * 根据当前线的样式和末尾点坐标进行绘制 fromP可选
   * @param args{fromP,toP}
   */
  drawAsMe(args: { fromP?: CPoint, toP: CPoint }) {
    return new CLine({
      fromP: args.fromP || this.toP,
      toP: args.toP,
      style: this.style,
      lineWidth: this.lineWidth,
      preEle: this,
    }).draw()
  }

  /**
   * 判断两根线是否交叉
   * 最简单判断, y'0>y0 y'1<y1
   * 1. 起始比别人高, 落点比别人低; 返回 1 (要调整自己到最后
   * 2. 起始比别人低, 落点比别人高; 返回 2 (要调整比自己低的所有 node 往下移动
   * 3. 其他; 返回 0
   */
  crossWith(line:CLine):1|2|0 {
    if (line.fromP.y < this.fromP.y &&  line.toP.y > this.toP.y) {
      return 1;
    }
    if (line.fromP.y > this.fromP.y &&  line.toP.y < this.toP.y) {
      return 2;
    }
    return 0;
  }
}
