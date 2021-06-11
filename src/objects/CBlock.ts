import {CNode} from "./CNode.js";
import {CRect} from "./CRect.js";
import options from "../options.js";

export class CBlock extends CRect {
  nextNode: CNode;
  disableBlock: CBlock; // 这个内容块之前的设置为禁用
  desc: string

  constructor(args: {
    parent: CRect, nodeId: string, x: number, width: number, y: number, height?: number,
    style?: any, radius?: number[], strokeStyle?: any, lineWidth?: any, nextNode?: CNode, desc?: string, id?: string
  }) {
    super(args);
    this.disableBlock = null;
    this.desc = args.desc || '点击修改节点内容'
    this.style = args.style || options.block_color
    this.height = args.height || options.block_h
  }
}
