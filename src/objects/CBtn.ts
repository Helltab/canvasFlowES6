import {CRect} from "./CRect.js";
import {CImg} from "./CImg.js";

export class CBtn extends CRect {
  addImg: CImg;
  addNodeImg: CImg;

  constructor(args: {
    parent: CRect, nodeId: string, x: number, y: number, width: number, height: number,
    style?: any, radius?: number[], strokeStyle?: any, lineWidth?: any, group?: string
  }) {
    super(args);
    this.strokeStyle = args.strokeStyle
    this.lineWidth = args.lineWidth
    this.group = args.group
  }
}
