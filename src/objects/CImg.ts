import {CanvasEle} from "./CavasEle.js";
import {CRect} from "./CRect.js";
import {CANVAS_VARS} from "../vars/GlobalVars.js";

export class CImg extends CanvasEle {
  img: any;
  width: number;
  height: number;

  constructor(args: { nodeId: string, parent: CRect, img: any, width: number, height: number, group?: string }) {
    super(args);
    this.img = args.img
    this.width = args.width
    this.height = args.height
    this.draw()
  }

  draw() {
    CANVAS_VARS.cacheCtx.drawImage(this.img, this.parent.x + (this.parent.width - this.width) / 2, this.parent.y + (this.parent.height - this.height) / 2, this.width, this.height)
  }
}
