import {CanvasList} from "./CanvasList.js";
import {arrRemove, genUUID, isType} from "../util/commonUtils.js";
import {addCEle, adjustNode, canvasRedraw, drawNode, getEleById, getNextNodeByBlockId, getNextNodeByNode, getNodeById, getRectType, getSubEles, pointInNode, registNode, removeNode} from "../util/canvasUtils.js";
import options from "../options.js";
import R from "../imageResource.js";
import {afterEvent} from "../eventHandler.js";
import {CANVAS_VARS, COLOR_VAR, ELE_GROUP_VAR, RECT_TYPE} from "../vars/GlobalVars.js";
import {CTitle} from "./CTitle.js";
import {CRect} from "./CRect.js";
import {CLine} from "./CLine.js";
import {CBtn} from "./CBtn.js";
import {CBlock} from "./CBlock.js";
import {CImg} from "./CImg.js";
import {CText} from "./CText.js";
import {CPoint} from "./CPoint.js";

/**
 * 每一组元素都可以逻辑归纳为一个节点
 */
export class CNode {
  id: string;
  title: CTitle;
  preBlock: CRect;
  preNode: CNode;
  preBlockId: string;
  preNodeId: string;
  blockList: CanvasList<CRect>;
  listfromLine: CanvasList<CLine>;
  x: number;
  y: number;
  width: number;
  height: number;
  offHeight: number = 0; // 挤压下方方框的高度
  addBtn: CBtn;
  fromX: number;
  fromY: number;
  private fromLine: CLine;

  constructor(args: { title?: CTitle, preBlock?: CRect, id?: string }) {
    this.title = args.title
    this.preBlock = args.preBlock || null
    this.id = args.id || genUUID()

    this.preNode = args.preBlock ? getNodeById(args.preBlock.nodeId) : null
    this.preNodeId = this.preNode ? this.preNode.id : null
    this.preBlockId = this.preBlock ? this.preBlock.id : null
    this.listfromLine = new CanvasList<CLine>(null)
    // 注册到全局的 node 的列表中
    registNode(this)
    Object.defineProperties(this, {
      '_x': {
        configurable: true,
        writable: true,
        value: 0
      },
      '_y': {
        configurable: true,
        writable: true,
        value: 0
      },
      '_height': {
        configurable: true,
        writable: true,
        value: 0
      },
      '_width': {
        configurable: true,
        writable: true,
        value: 0
      },
      x: {
        get(): number {
          this.widthModify(this._x, this._width)
          return this._x
        },
        set(v: number) {
          this._x = v
        }
      },
      y: {
        get(): number {
          this.heightModify(this._y, this._height)
          return this._y
        },
        set(v: number) {
          this._y = v
        }
      },
      width: {
        get(): number {
          this.widthModify(this._x, this._width)
          return this._width
        },
        set(v: number) {
          this._width = v
        }
      },
      height: {
        get(): number {
          this.heightModify(this._y, this._height)
          return this._height
        },
        set(v: number) {
          this._height = v
        }
      }
    })
    if (args.title) {
      this.setTitle(args.title)
    }
  }

  widthModify(x: number, width: number) {
    // 调整画布宽度
    if (width + x > CANVAS_VARS.realCanv.width - 30) {
      CANVAS_VARS.realCanv.width += width + 100
      CANVAS_VARS.cacheCanv.height = CANVAS_VARS.realCanv.height
      CANVAS_VARS.cacheCanv.width = CANVAS_VARS.realCanv.width
      canvasRedraw()
      CANVAS_VARS.realCanv.scrollIntoView()
    }
  }


  heightModify(y: number, height: number) {
    // 调整画布高度
    if (height + y > CANVAS_VARS.realCanv.height - 30) {
      CANVAS_VARS.realCanv.height += this.title.height + 100
      CANVAS_VARS.cacheCanv.height = CANVAS_VARS.realCanv.height
      CANVAS_VARS.cacheCanv.width = CANVAS_VARS.realCanv.width
    }

  }

  /**
   * 设置标题框
   * @param title
   */
  setTitle(title) {
    title.nodeId = this.id
    this.x = title.x
    this.y = title.y
    this.width = title.width
    this.height = title.height + 40 // 加上 addBtn 的高度

    this.blockList = new CanvasList<CRect>(b => {
      if (b === title) return
      // 将 node 的高度往下扩展
      this.height += b.height + 5
    })
    this.blockList.setSpliceCallback(start => {
      let disabledBlock: CBlock = this.blockList[start]
      this.blockList.forEach(b => {
        if (b !== disabledBlock && b.disableBlock === disabledBlock) {
          this.setAddNodeBtn(b)
          CANVAS_VARS.disableBlockArr.splice(CANVAS_VARS.disableBlockArr.indexOf(b.disableBlock), 1)
          b.disableBlock = null
        }
      })
      this.height -= options.block_h + 5
      // CANVAS_VARS.actNode.drawActBox(this)
    })

    this.blockList.push(title)
    this.setText(title, title.desc)
    this.setAddBtn()
    if (CANVAS_VARS.canvasNodeArr.length > 1) {
      this.setDelBtn(title)
      this.setEditBtn(title, false)
    } else {
      // 第一个节点不允许删除
      this.setEditBtn(title, true)
    }
    this.setAddNodeBtn(title)
    /*this.title.addDrag(e => {
        let x = e.pageX
        let y = e.pageY
        console.log(x, y)
        if (this.canvasLastP) {
            this.title.x += x - this.canvasLastP.x
            this.title.y += y - this.canvasLastP.y
            canvasRedraw()
        }
        this.canvasLastP = new CPoint(x, y)
    })*/


  }

  /**
   * 设置文本
   * @param rect
   * @param text
   */
  setText(rect: CRect, text: string) {
    rect.contentTextId = new CText({
      text: text,
      parent: rect,
      nodeId: rect.nodeId,
      font: rect.constructor === CTitle ? options.title_font : options.block_font,
    }).id
  }

  setAddBtn() {
    let preBlock = this.getPreBlock()
    let addBtnX = preBlock.x
    let addBtnY = preBlock.y + preBlock.height
    let addBtnH = 40
    let addBtnW = preBlock.width
    if (this.addBtn) {
      this.title.removeGroupEles(ELE_GROUP_VAR.ADD_BTN)
    }
    if (pointInNode(addBtnX, addBtnY + addBtnH, this)) {
      // 将所有 y 大于当前的并且 x 大于等于当前的都往下移动
      for (const node of CANVAS_VARS.canvasNodeArr) {
        if (node !== this && node.y > this.y && node.x >= this.x) {
          let offY = this.title.height
          this.offHeight += offY
          CANVAS_VARS.canvasEleArr.forEach(ele => {
            if (ele.nodeId === node.id && ele.y !== undefined) {
              ele.y += offY
            }
          })
          node.setFromLine(null, node.preBlock)
        }
      }
      // canvasRedraw()
      CANVAS_VARS.actNode.drawActBox(this)
    }


    this.addBtn = new CBtn({
      nodeId: this.id,
      parent: this.title,
      x: addBtnX,
      y: addBtnY,
      width: addBtnW,
      height: addBtnH,
      group: ELE_GROUP_VAR.ADD_BTN,
      style: this.title.style,
      radius: [10, 10, 0, 0]
    })
    new CImg({
      parent: this.addBtn,
      nodeId: this.id,
      img: R.add_block.obj,
      width: 30,
      group: ELE_GROUP_VAR.ADD_BTN,
      height: 30,
    })

    this.addBtn.clickFun = e => {
      if (options.onAddBlock) {
        let id = genUUID()
        CANVAS_VARS.actNode.drawActBox(this)
        options.onAddBlock(id, (desc) => {
          this.addBlock({id: id, desc: desc || '节点描述'})
          afterEvent()
        })
      } else {
        console.error("e.add.null 未找到内容块添加事件")
      }
    }
  }

  setAddNodeBtn(rect: CRect = this.title) {
    let addNodeBtn = new CBtn({
      parent: rect,
      nodeId: this.id,
      group: ELE_GROUP_VAR.ADD_NODE_BTN,
      x: rect.x + rect.width + 2,
      y: rect.y + rect.height / 2 - 14,
      width: options.add_node_btn_w,
      height: options.add_node_btn_h,
      style: '#fff',
      // strokeStyle: COLOR_VAR.LINK_BTN_BORDER,
      radius: [5, 0, 0, 5]
    })
    new CBtn({
      parent: rect,
      nodeId: this.id,
      x: rect.x + rect.width - 2,
      y: rect.y + rect.height / 2 - 13,
      group: ELE_GROUP_VAR.ADD_NODE_BTN,
      width: options.add_node_btn_w - 2,
      height: options.add_node_btn_h - 2,
      style: '#fff',
      radius: [5, 0, 0, 5]
    }).addClick(() => {
      if (options.onAddNode) {
        let id = genUUID()
        let nodeId = rect.id
        if ((rect as CTitle).ifRoot == true) {
          nodeId = null
        }
        options.onAddNode(id, (rect as CTitle).ifRoot, nodeId, (desc = '点击修改标题') => {
          drawNode({id: id, preBlock: rect, desc: desc})
          afterEvent()
        })
      } else {
        console.error("e.add.null 未找到节点添加事件")
      }
    })
    new CImg({
      parent: addNodeBtn,
      nodeId: this.id,
      group: ELE_GROUP_VAR.ADD_NODE_BTN,
      img: R.add_node.obj,
      width: options.icon_size ,
      height: options.icon_size,
    })
  }

  /**
   * 绘制删除按钮
   * @param rect
   */
  setDelBtn(rect) {
    let delBtn = new CBtn({
      parent: rect,
      nodeId: this.id,
      x: rect.x + rect.width - 40,
      y: rect.y + 20,
      group: ELE_GROUP_VAR.DEL_BTN,
      width: options.icon_size,
      height: options.icon_size,
      style: 'rgba(225,225,225,0.01)'
    })
    new CImg({
      parent: delBtn,
      nodeId: this.id,
      group: ELE_GROUP_VAR.DEL_BTN,
      img: R.del.obj,
      width: options.icon_size,
      height: options.icon_size,
    })
    delBtn.clickFun = e => {
      if (options.onDel) {
        options.onDel(rect.id, getRectType(rect), (res) => {
          if (res !== -1) {
            this.delRect(rect)
            if (!isType(rect, CTitle)) {
              setTimeout(() => {
                CANVAS_VARS.actNode.drawActBox(getNodeById(rect.nodeId))
              }, 0)
            }
          }
          afterEvent()
        })
      } else {
        console.error("e.del.null 未添加删除事件")
      }
    }
  }


  /**
   * 递归获取子节点
   * @param node
   * @param list
   */
  getSubNode(node: CNode, list?: CNode[]) {
    let temp = CANVAS_VARS.canvasNodeArr.filter(x => x.preNode === node)
    if (!list) list = [node]
    list = [...temp, ...list]
    if (temp.length === 0) return list
    for (const e of temp) {
      list = this.getSubNode(e, list)
    }
    return list
  }

  /**
   * 递归获取当前流程的连接线
   * @param node
   * @param list
   */
  getLineList(node: CNode = this, list?: CLine[]) {
    if (!list) list = []
    if (!node || node.title.ifRoot) return list
    list = [...list, ...node.listfromLine]
    return this.getLineList(node.preNode, list)
  }

  /**
   * 递归删除节点
   * @param rootNode
   */
  delNode(rootNode: CNode) {
    this.getSubNode(rootNode).forEach(node => {
      node.delFromLine()
      CANVAS_VARS.canvasEleArr.filter(x => x.nodeId === node.id).forEach(x => {
        arrRemove(CANVAS_VARS.canvasEleArr, x)
      });
      arrRemove(CANVAS_VARS.canvasNodeArr, node)
    })
  }

  /**
   * 删除 block
   * @param rect
   */
  delRect(rect) {
    // 如果是 title, 就是删除整个节点
    if (rect.constructor === CTitle) {
      let curNode = getNodeById(rect.nodeId), freeX = curNode.x, nextNode = rect.nextNode,
        preBlock = curNode.preBlock;
      if (!nextNode) {//第二次删除问题时,重新找到nextNode
        nextNode = getNextNodeByNode(curNode);
      }
      // 先删除连接线
      curNode.delFromLine()
      // 设置当前激活节点为上一个
      CANVAS_VARS.actNode.drawActBox(curNode.preNode)
      // 如果是局部并行节点, 直接删除所有
      // 注意, 此处的 preBlock 必定是不为空的
      // if (preBlock.constructor === CBlock) {
      //     this.delNode(curNode)
      //     enableBlock(curNode.preBlock)
      //     return
      //     // 如果是完全并行节点, 只删除该节点和其下的串行子节点
      // } else {
      // 如果存在串行子节点
      if (nextNode) {
        let flag = true
        for (let node of CANVAS_VARS.canvasNodeArr) {
          // 如果下面有 node, 则需要将下一个 node 的线延长, 没有的话, 就将右边的所有元素向左平移
          if (curNode !== node && node.x > freeX - 20 && node.x < freeX + 20) {
            flag = false
            break;
          }
        }
        if (flag) {
          // 递归调整横向位置和连线
          this.getSubNode(nextNode, null).forEach(node => {
            CANVAS_VARS.canvasEleArr.filter(x => x.nodeId === node.id).forEach(ele => {
              let eleNode = getNodeById(ele.nodeId)
              if (ele.x) ele.x -= (curNode.width + eleNode.fromLine.toP.x - eleNode.fromLine.fromP.x)
            })
            node.setFromLine(null, node.preNode === curNode ? curNode.preBlock : null)
          })
        } else {
          // 将下一个节点连到上一个节点
          nextNode.setFromLine(null, curNode.preBlock)
        }
        // 调整连接
        nextNode.preNode = curNode.preNode
        nextNode.preNodeId = curNode.preNodeId
        nextNode.preBlock = curNode.preNode.title
        nextNode.preBlockId = curNode.preBlockId
        curNode.preNode.title.nextNode = nextNode
        curNode.preNodeId
      } else {//如果不存在子节点, 直接删除前置的 nextNode, 并添加前置节点的连接按钮
        curNode.preNode.title.nextNode = null
        curNode.preNode.setAddNodeBtn(curNode.preBlock)
      }
      // }
      /**
       * 递归删除当前node及其之下的node
       */
      this.getSubNode(curNode, null).forEach(node => {
        removeNode(node)
      })
      // CANVAS_VARS.canvasEleArr.filter(x => x.nodeId === rect.nodeId).filter(x => {
      //     arrRemove(CANVAS_VARS.canvasEleArr, x)
      // })
      // arrRemove(CANVAS_VARS.canvasNodeArr, getNodeById(rect.nodeId))
    } else {
      let rectNode = getNodeById(rect.nodeId)
      let nextNode = rect.nextNode;
      if (!nextNode) {//第二次编辑图片删除节点时,没有nextNode,需要重新获取!
        nextNode = getNextNodeByBlockId(rect.id);
      }
      if (nextNode) {
        // 递归删除所有的节点
        this.getSubNode(nextNode, null).forEach(node => {
          removeNode(node)
        })
        rect.nextNode = null
      }
      let offH = rect.height + 5
      // 移除内容块
      arrRemove(this.blockList, rect)
      getSubEles(rect, null).forEach(ele => {
        arrRemove(CANVAS_VARS.canvasEleArr, ele)
      })
      /**
       * 如果下方有 node, 可以将其上移
       * 1. 正下方或右下方
       * 2. 节点调整后的位置应该低于当前节点底部
       * 3. 节点调整后的位置应该低于前置右中点
       */
      CANVAS_VARS.canvasNodeArr.filter(node => node.id !== rect.nodeId
        && node.x >= rect.x
        && node.y - rect.height > rectNode.y + rectNode.height
        && node.y - rect.height >= node.preBlock.y + node.preBlock.height / 2)
        .forEach(node => {
          adjustNode(node, 0, rect.height)
        })
      // 遍历位于其下的内容块, 递归调整后继节点
      this.blockList.forEach(block => {
        if (block.y > rect.y) {
          getSubEles(block).forEach(ele => {
            ele.y -= offH
            if (ele.nextNode) {
              this.getSubNode(ele.nextNode, null).forEach(node => {
                adjustNode(node, 0, Math.min(offH, node.y - node.preBlock.y))
              })
            }
          })
        }
      })
      this.setAddBtn()
    }
  }

  /**
   * 设置修改按钮
   * @param rect
   * @param root
   */
  setEditBtn(rect, root?: boolean) {
    let offY = root ? rect.y + 20 : rect.y + rect.height * 0.5
    let editBtn = new CBtn({
      parent: rect,
      nodeId: this.id,
      x: rect.x + rect.width - 40,
      y: offY,
      width: options.icon_size,
      height: options.icon_size,
      style: "rgba(255,255,255, 0.01)",
    })
    let editImg = new CImg({
      parent: editBtn,
      nodeId: this.id,
      img: R.edit.obj,
      width: options.icon_size,
      height: options.icon_size,
    })
    editBtn.clickFun = e => {
      let content = getEleById(rect.contentTextId) || null
      if (options.onEdit) {
        CANVAS_VARS.actNode.drawActBox(rect)
        options.onEdit(rect.id, getRectType(rect), (text) => {
          rect.desc = text
          if (content) {
            content.text = text
          } else {
            this.setText(rect, text)
          }
          afterEvent()
        })
      }
    }
  }

  /**
   * 删除连接线, 还原连接按钮
   */
  delFromLine() {
    this.listfromLine.forEach(l => {
      arrRemove(CANVAS_VARS.canvasEleArr, l)
      l = null
    })
  }

  /**
   * 设置过来的路径
   * @param line
   * @param preEle
   *
   **/
  setFromLine(line?: CLine, preEle?: CRect) {
    if (line) {
      this.fromLine = line
    } else {
      if (!this.fromLine) {
        return
      }
      line = this.fromLine
    }
    // 如果 list 有线, 置空并从元素列表和连线列表中移除(也从画面中移除了)
    if (this.listfromLine.length > 0) {
      this.listfromLine.forEach(l => {
        arrRemove(CANVAS_VARS.canvasEleArr, l)
        arrRemove(CANVAS_VARS.canvasLineArr, l)
      })
      this.listfromLine = new CanvasList<CLine>(null)
    }
    // 如果没有传前置, 则默认原则当前 node 的前置
    preEle = preEle ? preEle : this.preBlock
    // 连线开始端设置为前置的右中点
    line.fromP.setP(preEle.x + preEle.width, preEle.y + preEle.height / 2)
    this.fromX = preEle.x + preEle.width
    this.fromY = preEle.y + preEle.height / 2
    // 连线末端设置为当前节点 title 的左中点
    line.toP.setP(this.title.x, this.title.y + this.title.height / 2)
    // 如果开始端和末端水平, 则画直线
    if (line.fromP.y === line.toP.y) {
      line.draw()
      addCEle(line)
      this.listfromLine.push(line)
      // 不平行则画三条折线或者是贝塞尔曲线 bezier
    } else if (line.toP.y > line.fromP.y) {
      arrRemove(CANVAS_VARS.canvasEleArr, line)
      // 计算转折点横坐标
      if (options.bezier) { // 是否启用贝塞尔曲线
        line.bezier = true
        this.listfromLine.push(line.draw())
      } else { // 三条折线
        let midx: number = (line.fromP.x + line.toP.x) / 2
        let line1 = line.drawAsMe({
          fromP: new CPoint(line.fromP.x, line.fromP.y),
          toP: new CPoint(midx, line.fromP.y),
        })
        let line2 = line1.drawAsMe({
          toP: new CPoint(midx, line.toP.y),
        })
        let line3 = line2.drawAsMe({
          toP: new CPoint(line.toP.x, line.toP.y),
        })
        this.listfromLine.push(line1)
        this.listfromLine.push(line2)
        this.listfromLine.push(line3)
      }

    }
    // 更新连线集合
    CANVAS_VARS.canvasLineArr = [...CANVAS_VARS.canvasLineArr, ...this.listfromLine]
  }

  /**
   * 添加内容段
   */
  addBlock({id = genUUID(), desc}) {
    let preBlock = this.getPreBlock()
    let block = new CBlock({
      id: id,
      nodeId: this.id,
      parent: null,
      x: preBlock.x,
      y: preBlock.y + preBlock.height + 5,
      width: preBlock.width,
      height: 120,
      desc: desc,
      style: "#ffffff",
    })
    this.blockList.push(block)
    this.setText(block, block.desc)
    this.setEditBtn(block)
    this.setDelBtn(block)
    this.setAddNodeBtn(block)
    this.setAddBtn()
    CANVAS_VARS.actNode.drawActBox(block)
    return block
  }

  /**
   * 获取前一个内容块, 如果没有, 就返回 title
   * @return {*}
   */
  getPreBlock() {
    return this.blockList[this.blockList.length - 1]
  }
}
