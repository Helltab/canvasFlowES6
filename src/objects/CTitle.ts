import {CNode} from "./CNode.js";
import {getNodeById} from "../util/canvasUtils.js";
import {CRect} from "./CRect.js";
import options from "../options.js";

export class CTitle extends CRect {
  ifRoot: boolean; // 是否是根节点
  desc: string; // 节点描述
  constructor(args: {
    nodeId: string, parent: CRect, x: number, y: number, width: number, height: number,
    style?: any, strokeStyle?: any, nextNode?: CNode, radius?: number[], lineWidth?: any,
    ifRoot?: boolean, group?: string, desc?: string, id?: string
  }) {
    args.radius = args.radius || [0, 0, 10, 10]
    super(args);
    this.desc = args.desc || '点击修改标题'
    this.style = args.style || options.title_color
    this.ifRoot = args.ifRoot || false; // 默认 false
    Object.defineProperties(this, {
      _x: {
        configurable: true,
        writable: true,
        value: args.x
      },
      _y: {
        configurable: true,
        writable: true,
        value: args.y
      },
      x: {
        set(v: number) {
          this._x = v
          // 将 node 的坐标也重新定位
          getNodeById(this.nodeId).x = v
        },
        get(): number {
          return this._x
        }
      },
      y: {
        set(v: number) {
          this._y = v
          // 将 node 的坐标也重新定位
          getNodeById(this.nodeId).y = v
        },
        get(): number {
          return this._y
        }
      }
    })
  }
}
