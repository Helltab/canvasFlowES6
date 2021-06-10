import {CanvasEle} from "./CavasEle.js";
import options from "../options.js";
import {addCEle} from "../util/canvasUtils.js";
import {CANVAS_VARS} from "../vars/GlobalVars.js";
import {CPoint} from "./CPoint.js";

export class CLine extends CanvasEle {
  preEle: CanvasEle;
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
  }) {
    super({parent: null, nodeId: null, id: args.id});
    this.fromP = args.fromP
    this.toP = args.toP
    this.style = args.style
    this.idStyle = args.style
    this.lineWidth = args.lineWidth
    this.preEle = args.preEle
    this.bezier = args.bezier
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
}
