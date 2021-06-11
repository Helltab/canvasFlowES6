// 图片资源管理器
import jsRootPath from "./jsRootPath.js";
import options from "./options.js";

export declare type ImageType = 'edit' | 'del' | 'add_block' | 'add_node'|'rect_bg'|'canvas_bg'
const R: { [key in ImageType]: any } = {
  edit: {obj: null, width:options.icon_size,height: options.icon_size, src: jsRootPath + '../static/img/btn_edit.png'},
  del: {obj: null, width:options.icon_size,height: options.icon_size, src: jsRootPath + '../static/img/btn_del.png'},
  add_block: {obj: null, width:options.icon_size,height: options.icon_size, src: jsRootPath + '../static/img/btn_add_block.png'},
  add_node: {obj: null, width:options.icon_size,height: options.icon_size, src: jsRootPath + '../static/img/btn_add_node.png'},
  rect_bg: {obj: null, width:2,height: 2, src: jsRootPath + '../static/img/texture_rect_bg.png'},
  canvas_bg: {obj: null, width:2,height: 2, src: jsRootPath + '../static/img/texture_canvas_bg.png'},
}
export default R
