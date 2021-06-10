import {canvasRedraw, curRect, getData, pointInBlock, pointInNode, saveCanvas}
  from "./util/canvasUtils.js";
import options from "./options.js";
import {CANVAS_VARS} from "./vars/GlobalVars.js";
/**
 * 事件发生之后回调
 */
export function afterEvent() {
  canvasRedraw()
  saveCanvas()
}

export function clearScreen() {
  CANVAS_VARS.realCtx.clearRect(0, 0, CANVAS_VARS.realCanv.width, CANVAS_VARS.realCanv.height)
  CANVAS_VARS.realCtx.fillRect(0, 0, CANVAS_VARS.realCanv.width, CANVAS_VARS.realCanv.height)
}

export function getScrollLeft() {
  return document.documentElement.scrollLeft||document.body.scrollLeft
}
export function getScrollTop() {
  return document.documentElement.scrollTop||document.body.scrollTop
}
/**
 * 鼠标按下事件
 * screenY: r left_top of screen
 * clientY: r left_top of view
 * pageY: r left_top of page
 *  pageY = event.clientY + scrollTop - clientTop
 * layerY: r left_top of its parent
 * offsetY: ie
 * @param e
 */
 export function onClick(e: MouseEvent) {
  let relation = CANVAS_VARS.realCanv.getBoundingClientRect()
  let mx = e.pageX - relation.x - getScrollLeft();
  let my = e.pageY - relation.y - getScrollTop();
  let flag = false
  curRect(mx, my, ele => {
    if (typeof ele.clickFun === 'function') {
      ele.clickFun(e)
      flag = true
    }
    CANVAS_VARS.curElement = ele
  })
  // CANVAS_VARS.realCanv.addEventListener('mousemove', onMove, false)
  let curNode = pointInNode(mx, my)
  if (curNode) {
    let curBlock = pointInBlock(mx, my)
    if (curBlock) {
      CANVAS_VARS.actNode.drawActBox(curBlock)
    } else {
      CANVAS_VARS.actNode.drawActBox(curNode)
    }
    canvasRedraw()
  }
}

export function onDBClick(e: MouseEvent) {
   e.preventDefault()
}
/**
 * 检测是否移动
 * @param {Object} e
 */
export function onMove(e) {
  // if (CANVAS_VARS.curElement && typeof CANVAS_VARS.curElement.dragFun === 'function') {
  //     CANVAS_VARS.curElement.dragFun(e)
  // }
  if(CANVAS_VARS.realCanv) {
    let relation = CANVAS_VARS.realCanv.getBoundingClientRect()
    let mx = e.pageX - relation.x;
    let my = e.pageY - relation.y;
    window.scrollTo(mx, my)
  }
}
