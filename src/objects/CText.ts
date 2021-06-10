import {CanvasEle} from "./CavasEle.js";
import {breakLinesForCanvas} from "../util/canvasUtils.js";
import {CRect} from "./CRect.js";
import {CANVAS_VARS} from "../vars/GlobalVars.js";

export class CText extends CanvasEle {
  text: string;
  fillStyle: any;
  font: any;

  constructor(args: { parent: CRect, nodeId: string, text: string, fillStyle?: any, font?: any, group?: string }) {
    super(args);
    this.text = args.text
    this.fillStyle = args.fillStyle || '#000'
    this.font = args.font
    this.draw()
  }

  draw() {
    CANVAS_VARS.cacheCtx.fillStyle = this.fillStyle
    CANVAS_VARS.cacheCtx.font = this.font
    // 计算可以显示的坐标和最大宽度
    let textW, textX, textY;
    if (this.parent.width >= 100) {
      textW = this.parent.width - 60
      textX = this.parent.x + 10
      textY = this.parent.y + 30
    } else if (this.parent.width >= 40) {
      textW = this.parent.width - 10
      textX = this.parent.x + 5
      textY = this.parent.y + 10
    } else {
      textW = this.parent.width * 0.9
      textX = this.parent.x + 2
      textY = this.parent.y + 2
    }
    // 计算换行长度
    breakLinesForCanvas(this.text, textW, this.font).forEach(t => {
      CANVAS_VARS.cacheCtx.fillText(t, textX, textY, textW)
      textY += 30
    })

  }
}
