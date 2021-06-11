import {CanvasList} from "../objects/CanvasList.js";
import {CANVAS_VARS, COLOR_VAR, ELE_GROUP_VAR, getMapSize, MAP, RECT_TYPE} from "../vars/GlobalVars.js";
import {arrRemove, genUUID, isType} from "./commonUtils.js";
import options from "../options.js";
import {clearScreen} from "../eventHandler.js";
import {CNode} from "../objects/CNode.js";
import {CTitle} from "../objects/CTitle.js";
import {CRect} from "../objects/CRect.js";
import {CLine} from "../objects/CLine.js";
import {CBlock} from "../objects/CBlock.js";
import {CanvasEle} from "../objects/CavasEle.js";
import {CPoint} from "../objects/CPoint.js";
import {ActNode} from "../objects/ActNode.js";
import R from "../imageResource.js";
import LOCAL_KEY from "../localstore.js";

/**
 * 将持久化的数据进行重绘
 */
export function drawNodeList(nodes = JSON.parse(sessionStorage.getItem(LOCAL_KEY.DATA))) {
  try {
    if (!nodes || nodes.length < 0) return
    clearScreen()
    initContainerData()
    nodes.forEach(node => {
      drawNodeByPosition(node, nodes)
    })
    canvasRedraw()
  } catch (e) {
    console.error("数据加载失败")
  }
}

export function reDrawNodeList() {
  drawNodeList(JSON.parse(JSON.stringify(getData())))
}

/**
 * 初始化集合数据
 */
export function initContainerData() {
  CANVAS_VARS.canvasEleArr = new CanvasList<CanvasEle>(null)
  CANVAS_VARS.disableBlockArr = new CanvasList<CBlock>(null)
  CANVAS_VARS.cnodeIdSet = new Set<string>()
  // 连接线的集合, 方便处理当前流程
  CANVAS_VARS.canvasLineArr = []
  CANVAS_VARS.canvasDirectLine = new CanvasList<CLine>(null)
  CANVAS_VARS.canvasNodeArr = new CanvasList<CNode>(null)
  CANVAS_VARS.curElement = null
  CANVAS_VARS.actNode = new ActNode()
  // 节点列表设置回调, 每当节点被删除, 就需要将其下的节点适当上移
  // fixme
  CANVAS_VARS.canvasNodeArr.setSpliceCallback(start => {
    // let node = CANVAS_VARS.canvasNodeArr[start]
    // CANVAS_VARS.canvasNodeArr.forEach(n => {
    //   if (n.y > node.y) {
    //     // 设置向上修正量, 当前节点的累计增高和下面节点最多能上升的距离中的最小值
    //     let offY = Math.min(node.offHeight, n.y - n.preBlock.y + n.preBlock.height / 2)
    //     console.log(offY)
    //     // adjustNode(n, 0, offY)
    //   }
    // })
  })
}

export function saveCanvas() {
  if (options.onSave) {
    let data = JSON.stringify(getData())
    options.onSave(data)
  } else {
    console.error("e.save, 保存失败, 未找到 onSave")
  }
}

/**
 * 添加元素
 * @param {Object} ele
 */
export function addCEle(ele: CanvasEle) {
  if (!CANVAS_VARS.canvasEleArr) CANVAS_VARS.canvasEleArr = new CanvasList<any>(null)
  if (CANVAS_VARS.canvasEleArr.indexOf(ele) === -1) CANVAS_VARS.canvasEleArr.push(ele)
}

/**
 * 获取节点的所有 ID
 */
export function getNodeIds() {
  return CANVAS_VARS.canvasNodeArr.map(x => x.id)
}

/**
 * 根据 ID 查找指定节点
 */
export function getNodeById(nodeId: string) {
  return CANVAS_VARS.canvasNodeArr.filter(x => x.id === nodeId)[0]
}

/**
 * 根据 ID 查找指定元素
 */
export function getEleById(eleId: string) {
  return CANVAS_VARS.canvasEleArr.filter(x => x.id === eleId)[0]
}

/**
 * 根据answer答案ID 查找指定后置节点
 */
export function getNextNodeByBlockId(eleId) {
  return CANVAS_VARS.canvasNodeArr.filter(x => x.preBlockId === eleId)[0];
}

/**
 * 根据title问题节点 查找指定后置流程节点
 */
export function getNextNodeByNode(curNode) {
  return CANVAS_VARS.canvasNodeArr.filter(node => node.preNodeId == curNode.id && node.preBlockId == curNode.title.id)[0]
}


/**
 * 递归激活节点
 * @param block
 */
export function enableBlock(block) {
  let node = getNodeById(block.nodeId)
  node.blockList.forEach(b => {
    if (b.disableBlock === block) {
      b.disableBlock = null
      node.setAddNodeBtn(b)
    }
  })

}

/**
 *
 * @param node
 */
export function getNodeInfo(node: CNode) {
  let blocks = []
  node.blockList.forEach(b => {
    blocks.push({
      x: b.x,
      y: b.y,
      id: b.id,
      desc: b.desc,
    })
  })
  return JSON.stringify(
    {
      title: {
        x: node.title.x,
        y: node.title.y,
        id: node.title.id,
        desc: node.title.desc,
      },
      blocks: blocks,
      nodeId: node.id,
      preNodeId: node.preNode ? node.preNode.id : null
    }
  )
}

/**
 * 注册节点
 * @param item
 */
export function registNode(item: CNode) {
  CANVAS_VARS.canvasNodeArr.push(item)
  // 注册节点 Id
  CANVAS_VARS.cnodeIdSet.add(item.id)
}

/**
 * 调整画布宽度
 */
export function fitCanvasWidth(width: number, location_x: number) {
  // 调整画布宽度
  if (width + location_x > CANVAS_VARS.realCanv.width - 30) {
    CANVAS_VARS.realCanv.width += width + 100
    CANVAS_VARS.cacheCanv.height = CANVAS_VARS.realCanv.height
    CANVAS_VARS.cacheCanv.width = CANVAS_VARS.realCanv.width
    canvasRedraw()
  }
}


/**
 * 重绘
 */
export function canvasRedraw() {
  CANVAS_VARS.cacheCtx.clearRect(0, 0, CANVAS_VARS.realCanv.width, CANVAS_VARS.realCanv.height)
  CANVAS_VARS.cacheCtx.fillStyle = COLOR_VAR.CANVAS_BG;
  CANVAS_VARS.cacheCtx.fillRect(0, 0, CANVAS_VARS.realCanv.width, CANVAS_VARS.realCanv.height)
  CANVAS_VARS.cacheCtx.fillStyle = CANVAS_VARS.cacheCtx.createPattern(R.canvas_bg.obj, "repeat");
  CANVAS_VARS.cacheCtx.fillRect(0, 0, CANVAS_VARS.realCanv.width, CANVAS_VARS.realCanv.height);
  CANVAS_VARS.canvasEleArr.forEach(ele => {
    ele.draw()
  })
  display()
}

/**
 * 显示画布
 */
function display() {
  CANVAS_VARS.mapCanvCtx.clearRect(0, 0, CANVAS_VARS.realCanv.width, CANVAS_VARS.realCanv.height)
  let clientRect = CANVAS_VARS.map_pointer.getBoundingClientRect();
  CANVAS_VARS.mapCanvCtx.drawImage(CANVAS_VARS.cacheCanv, 0, 0,
    MAP.width,
    MAP.height)
  CANVAS_VARS.realCtx.clearRect(0, 0, CANVAS_VARS.realCanv.width, CANVAS_VARS.realCanv.height)
  // CANVAS_VARS.realCtx.fillStyle = "#ddd"
  CANVAS_VARS.realCtx.fillRect(0, 0, CANVAS_VARS.realCanv.width, CANVAS_VARS.realCanv.height)
  //双缓冲绘图, 将缓冲区的画面显示到页面
  CANVAS_VARS.realCtx.drawImage(CANVAS_VARS.cacheCanv, 0, 0)
}

/**
 * 是否在节点内部
 ***/
export function pointInNode(x, y, curNode?: CNode) {
  for (const node of CANVAS_VARS.canvasNodeArr) {
    if (curNode && node === curNode) continue
    if (x + 5 > node.x
      && x - 5 < node.x + node.width
      && y + 5 > node.y
      && y - 5 < node.y + node.getTotalHeight()) {
      return node
    }
  }
  return null
}

/**
 * 获取当前绘画区数据
 */
export function getData(): any[] {
  let resList = []
  CANVAS_VARS.canvasNodeArr.forEach(node => {
    let title = node.title
    let blocks = []
    node.blockList.forEach(b => {
      if (!isType(b, CTitle)) {
        blocks.push({x: b.x, y: b.y, id: b.id, desc: b.desc, group: b.group})
      }
    })
    resList.push({
      title: {x: title.x, y: title.y, ifRoot: title.ifRoot, id: title.id, desc: title.desc},
      blocks,
      nodeId: node.id,
      preNodeId: node.preNodeId,
      preBlockId: node.preBlockId
    })
  })
  return resList
}

/**
 * 重载树
 * @param treeData
 */
export function reload(treeData) {
  if (!treeData || !treeData.canvasEleArr || !treeData.canvasNodeArr) {
    alert("参数有误, 不能重新加载")
    return
  }
  CANVAS_VARS.canvasEleArr = treeData.canvasEleArr
  CANVAS_VARS.canvasNodeArr = treeData.canvasNodeArr
  canvasRedraw()
}

/**
 * 当前元素
 **/
export function curRect(x, y, callback) {
  let rects = CANVAS_VARS.canvasEleArr.filter(e => e.__proto__ instanceof CRect).reverse();
  for (let ele of rects) {
    if (x + 5 > ele.x && x - 5 < ele.x + ele.width && y + 10 > ele.y && y - 5 < ele.y + ele.height) {
      callback(ele)
      break
    }
  }
}


/**
 * 是否在存在的矩形框内
 **/
export function pointInBlock(x, y) {
  try {
    for (const block of CANVAS_VARS.canvasEleArr) {
      if (block.constructor === CTitle) continue
      // if (CANVAS_VARS.actNode.curBlock === block) continue
      if (isType(block, CBlock)
        && x > block.x
        && x < block.x + block.width
        && y > block.y
        && y < block.y + block.height) {
        return block
      }
    }
  } catch (e) {
  }
}


/**
 * 调整节点的坐标
 * @param node
 * @param offX
 * @param offY
 */
export function adjustNode(node: CNode, offX: number, offY: number) {
  if (CANVAS_VARS.canvasNodeArr.indexOf(node) === -1) {
    node = null
    return
  }
  CANVAS_VARS.canvasEleArr.forEach(ele => {
    if (ele.nodeId === node.id) {
      ele.y -= offY
      ele.x -= offX
    }
  })
  // 调整完节点需要重置连线
  node.setFromLine()
}

/**
 * 删除节点以及其下的所有内容
 * @param node
 */
export function removeNode(node) {
  node.delFromLine()
  CANVAS_VARS.canvasEleArr.filter(x => x.nodeId === node.id).forEach(ele => {
    arrRemove(CANVAS_VARS.canvasEleArr, ele)
  })
  arrRemove(CANVAS_VARS.canvasNodeArr, node)
}


/**
 * 节点的前置, 如果不存在, 则添加一个根节点
 * @param args
 */
export function drawNode(args: { id?: string, desc?: string, preBlock?: CRect }): CNode {
  args.id = args.id || genUUID()
  let node: CNode;
  let title: CTitle;
  let nodeId = genUUID();
  let preBlock = args.preBlock;
  if (preBlock) {
    let ifRoot = false
    preBlock.removeGroupEles(ELE_GROUP_VAR.ADD_NODE_BTN)
    // 如果前置是一个 title, 就将连接按钮移除
    if (preBlock.constructor === CTitle) {
      (preBlock as CRect).removeGroupEles(ELE_GROUP_VAR.ADD_NODE_BTN)
      ifRoot = (preBlock as CTitle).ifRoot
    } else {
      setDisableBlock(preBlock)
    }
    let titleX: number = preBlock.x + preBlock.width + 80
    let titleY: number = preBlock.y
    // // 默认是连直线, 如果直线的末端已经有了节点, 就将末端下移到空地
    while (pointInNode(titleX, titleY) || pointInNode(titleX, titleY + options.node_off)) {
      titleY += options.node_off
    }
    // 先添加一个 title, 除了定位其他都继承前置
    let preNode = getNodeById(preBlock.nodeId)
    title = new CTitle({
      nodeId: nodeId,
      parent: null,
      id: args.id,
      desc: args.desc,
      ifRoot: ifRoot,
      x: titleX,
      y: titleY,
      width: preNode.title.width,
      height: preNode.title.height,
      style: preNode.title.style,
      radius: preNode.title.radius,
    })
    node = new CNode({title: title, preBlock: preBlock, id: nodeId})
    // 设置内容块的下一个 node
    preBlock.nextNode = node
    // 设置连接线, 从 root 出来是完全并行, 从其他 title 出来是局部并行, 从 block 出来是串行
    node.setFromLine(new CLine({
      style: ifRoot ? options.parallel_line : (preBlock.constructor === CTitle ? options.mix_line : options.serial_line),
      fromP: new CPoint(preBlock.x + preBlock.width, preBlock.y + preBlock.height / 2),
      toP: new CPoint(title.x, title.y + title.height),
      lineWidth: options.conn_line_width,
      preEle: preBlock
    }))
    // canvasRedraw()
  } else {
    // 初始化根节点
    title = new CTitle({
      nodeId: nodeId,
      parent: null,
      ifRoot: true,
      id: args.id,
      desc: args.desc,
      x: 20,
      y: 20,
      width: options.title_w,
      height: options.title_h,
      radius: [0, 0, 10, 10],
    })
    node = new CNode({title: title, id: 'd5bc7bc0f4e64297be363d24842155e9'})
    CANVAS_VARS.rootNode = node
  }
  // 激活当前 node
  CANVAS_VARS.actNode.drawActBox(node)
  return node
}

/**
 * 根据位置画出节点
 * @param preBlockId
 * @param preNodeId
 * @param nodeId
 * @param title
 * @param blocks
 * @param list
 */
export function drawNodeByPosition({preBlockId, preNodeId, nodeId, title, blocks}, list) {
  if (preNodeId && !CANVAS_VARS.cnodeIdSet.has(preNodeId)) {
    let preObj = list.filter(x => x.nodeId === preNodeId)[0]
    // 如果有前置, 则递归执行
    preObj && drawNodeByPosition(preObj, list)
  }
  let preBlock = getEleById(preBlockId)
  // 添加标题
  let cTitle = new CTitle({
    nodeId: nodeId,
    ...title,
    width: options.title_w,
    height: options.title_h,
  })
  let node = new CNode({title: cTitle, preBlock: preBlock, id: nodeId})
  // 添加内容块
  blocks.forEach((b) => {
    node.addBlock({id: b.id, desc: b.desc || '节点描述'})
  })

  // 如果有前置内容块, 则画出连接线
  if (preBlockId) {
    let preBlock = getEleById(preBlockId)
    node.preBlock = preBlock
    if (preBlock.constructor === CTitle) {
      (preBlock as CRect).removeGroupEles(ELE_GROUP_VAR.ADD_NODE_BTN)
    } else {
      // 如果是内容块, 则需要将内容块之前的连接按钮全部移除 (为了防止连线交叉, 保证节点连接的顺序结构)
      setDisableBlock(preBlock)
    }
    // 设置连接线, 从 root 出来是完全并行, 从其他 title 出来是局部并行, 从 block 出来是串行
    let offY = 0;
    // 默认是连直线, 如果直线的末端已经有了节点, 就将末端下移到空地
    while (pointInNode(node.x, preBlock.y + offY, node)
      || pointInNode(node.x, preBlock.y + offY + options.node_off, node)
      ) {
      offY += options.node_off
    }
    offY = node.y - preBlock.y -offY
    CANVAS_VARS.canvasEleArr.forEach(ele => {
      if (ele.nodeId === node.id) {
        ele.y -= offY
      }
    })
    title = node.title
    node.setFromLine(new CLine({
      style: title.ifRoot ? options.parallel_line : (preBlock.constructor === CTitle ? options.mix_line : options.serial_line),
      fromP: new CPoint(preBlock.x + preBlock.width, preBlock.y + preBlock.height / 2),
      toP: new CPoint(title.x, title.y + title.height),
      lineWidth: options.conn_line_width,
      preEle: preBlock
    }))
    // node.setFromLine()
  }
}

/**
 * 锁定此前的节点块
 * @param preBlock
 */
export function setDisableBlock(preBlock) {
  getNodeById(preBlock.nodeId).blockList.forEach((b) => {
    if (b.constructor === CBlock && b.y <= preBlock.y && b.disableBlock === null) {
      // 设置本内容块及之前的内容块为禁止状态, 便于随时启用
      b.disableBlock = preBlock
      CANVAS_VARS.disableBlockArr.push(preBlock)
      b.removeGroupEles(ELE_GROUP_VAR.ADD_NODE_BTN)
    }
  })
}

/**
 * 二分法找文字断开点
 * @param text
 * @param width
 * @return {number}
 */
export function findBreakPoint(text, width) {
  if (!text) return 0
  var min = 0;
  var max = text.length - 1;
  while (min <= max) {
    var middle = Math.floor((min + max) / 2);
    var middleWidth = CANVAS_VARS.cacheCtx.measureText(text.substr(0, middle)).width;
    var oneCharWiderThanMiddleWidth = CANVAS_VARS.cacheCtx.measureText(text.substr(0, middle + 1)).width;
    if (middleWidth <= width && oneCharWiderThanMiddleWidth > width) {
      return middle;
    }
    if (middleWidth < width) {
      min = middle + 1;
    } else {
      max = middle - 1;
    }
  }

  return -1;
}

/**
 * 将文字按最大长度分割
 * @param text
 * @param width
 * @param font
 * @return {[]}
 */
export function breakLinesForCanvas(text, width, font) {
  var result = [];
  var breakPoint = 0;

  if (!text) {
    return result
  }
  if (font) {
    CANVAS_VARS.cacheCtx.font = font;
  }
  while ((breakPoint = findBreakPoint(text, width)) !== -1) {
    result.push(text.substr(0, breakPoint));
    text = text.substr(breakPoint);
  }
  if (text) {
    result.push(text);
  }
  return result;
}

/**
 * 递归获取子元素
 * @param ele
 * @param list
 */
export function getSubEles(ele: CanvasEle, list?: any[]) {
  let temp = CANVAS_VARS.canvasEleArr.filter(x => x.parent === ele)
  if (!list) list = [ele]
  list = [...temp, ...list]
  if (temp.length === 0) return list
  for (const e of temp) {
    list = getSubEles(e, list)
  }
  return list
}

/**
 * 加载 canvas
 */
export function loadCanvas() {
  const result = {
    root: {
      id: '1',
      desc: 'root',
      next: '2',
      blockList: [
        {id: '101', next: '3', desc: 'b_101'},
        {id: '102', desc: 'b_102'},
        {id: '103', desc: 'b_103'},
      ]
    },
    nodeList: [{
      id: '2',
      desc: 'n_2',
      blockList: [
        {id: '201', desc: 'b_201'},
      ]
    }, {
      id: '3',
      title: 'n_3',
      blockList: [
        {id: '301', desc: 'b_301'},
      ]
    },
    ]
  }
  initContainerData()
  clearScreen()
  let root = drawNode({id: result.root.id, desc: result.root.desc})
  result.root.blockList.forEach(b => {
    root.addBlock(b)
  })
  let nextObj = result.nodeList.filter(node => node.id = result.root.next)[0]
  let next = drawNode({id: nextObj.id, desc: nextObj.desc, preBlock: root.title})
  nextObj.blockList.forEach(b => {
    next.addBlock(b)
  })

  result.nodeList.forEach(node => {

  })
  canvasRedraw()
}

export function getRectType(obj) {
  return isType(obj, CTitle) ? RECT_TYPE.TITLE : RECT_TYPE.BLOCK
}
