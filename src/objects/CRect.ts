import {CanvasEle} from "./CavasEle.js";
import {CNode} from "./CNode.js";
import {getSubEles} from "../util/canvasUtils.js";
import {arrRemove} from "../util/commonUtils.js";
import {CBtn} from "./CBtn.js";
import {CBlock} from "./CBlock.js";
import {CANVAS_VARS} from "../vars/GlobalVars.js";
import {CPoint} from "./CPoint.js";

/**
 * 矩形类
 */
export class CRect extends CanvasEle {
  x: number;
  y: number;
  width: number;
  height: number;
  style: any;
  strokeStyle: any;
  lineWidth: any;
  radius: number[];
  dragFun: Function;
  addNodeBtn: CBtn;
  addNodeBtn2: CBtn;
  nextNode: CNode;
  contentTextId: string;
  desc: string;
  disableBlock: CBlock; // 这个内容块之前的设置为禁用

  constructor(args: {
    x: number,
    y: number,
    width: number,
    height: number,
    parent: CRect,
    nodeId: string,
    nextNode?: CNode,
    style?: any,
    strokeStyle?: any,
    lineWidth?: any,
    radius?: number[],
    id?: string,
    desc?: string
  }) {
    super({parent: args.parent, nodeId: args.nodeId, id: args.id});
    this.x = args.x;
    this.y = args.y;
    this.width = args.width;
    this.height = args.height;
    this.style = args.style;
    this.strokeStyle = args.strokeStyle;
    this.lineWidth = args.lineWidth || 1;
    this.radius = args.radius;
    this.nextNode = args.nextNode;
    this.desc = args.desc;
    this.draw();
  }


  //画矩形
  draw() {
    CANVAS_VARS.cacheCtx.beginPath()
    CANVAS_VARS.cacheCtx.lineWidth = this.lineWidth;
    if (this.radius) {
      this.drawRoundRectPath(this.radius, this.x, this.y, this.width, this.height)
      if (this.strokeStyle) {
        CANVAS_VARS.cacheCtx.strokeStyle = this.strokeStyle;
        CANVAS_VARS.cacheCtx.stroke();
      } else {
        CANVAS_VARS.cacheCtx.fillStyle = this.style;
        CANVAS_VARS.cacheCtx.fill();
      }
    } else {
      if (this.strokeStyle) {
        CANVAS_VARS.cacheCtx.lineWidth = this.lineWidth;
        CANVAS_VARS.cacheCtx.strokeStyle = this.strokeStyle;
        CANVAS_VARS.cacheCtx.strokeRect(this.x, this.y, this.width, this.height);
      } else {
        CANVAS_VARS.cacheCtx.fillStyle = this.style;
        CANVAS_VARS.cacheCtx.fillRect(this.x, this.y, this.width, this.height);
      }
    }

  }

  addDrag(fun: (e?: MouseEvent) => void) {
    this.dragFun = fun;
  }


  /**
   * 移除同一组的元素
   */
  removeGroupEles(group: string) {
    CANVAS_VARS.canvasEleArr.filter(x => x.parent === this && x.group === group).forEach(ele => {
      getSubEles(ele, null).forEach(e => {
        arrRemove(CANVAS_VARS.canvasEleArr, e)
      })
    })
  }

  /**
   * 圆角
   * @param radius
   * @param x
   * @param y
   * @param width
   * @param height
   */
  drawRoundRectPath(radius, x, y, width, height) {
    let r0 = radius[0],
      r1 = radius[1],
      r2 = radius[2],
      r3 = radius[3];
    let rb_c_p = new CPoint(width - r0, height - r0).offset(x, y),
      lb_c_p = new CPoint(r1, height - r1).offset(x, y),
      lt_c_p = new CPoint(r2, r2).offset(x, y),
      rt_c_p = new CPoint(width - r3, r3).offset(x, y),
      b_l_p = new CPoint(r1, height).offset(x, y),
      l_l_p = new CPoint(0, r2).offset(x, y),
      t_l_p = new CPoint(width - r3, 0).offset(x, y),
      r_l_p = new CPoint(width, height - r3).offset(x, y)
    CANVAS_VARS.cacheCtx.beginPath();
    //从右下角顺时针绘制，弧度从0到1/2PI
    CANVAS_VARS.cacheCtx.arc(rb_c_p.x, rb_c_p.y, r0, 0, Math.PI / 2);
    CANVAS_VARS.cacheCtx.lineTo(b_l_p.x, b_l_p.y);
    CANVAS_VARS.cacheCtx.arc(lb_c_p.x, lb_c_p.y, r1, Math.PI / 2, Math.PI);
    CANVAS_VARS.cacheCtx.lineTo(l_l_p.x, l_l_p.y);
    CANVAS_VARS.cacheCtx.arc(lt_c_p.x, lt_c_p.y, r2, Math.PI, Math.PI * 3 / 2);
    CANVAS_VARS.cacheCtx.lineTo(t_l_p.x, t_l_p.y);
    CANVAS_VARS.cacheCtx.arc(rt_c_p.x, rt_c_p.y, r3, Math.PI * 3 / 2, Math.PI * 2);
    CANVAS_VARS.cacheCtx.lineTo(r_l_p.x, r_l_p.y);
    CANVAS_VARS.cacheCtx.closePath();
  }
}
