// 图片资源管理器
import jsRootPath from "./jsRootPath.js";

export declare type ImageType = 'edit' | 'del' | 'add_block' | 'add_node'
const R: { [key in ImageType]: any } = {
  edit: {obj: null, src: jsRootPath + '../static/img/btn_edit.png'},
  del: {obj: null, src: jsRootPath + '../static/img/btn_del.png'},
  add_block: {obj: null, src: jsRootPath + '../static/img/btn_add_block.png'},
  add_node: {obj: null, src: jsRootPath + '../static/img/btn_add_node.png'},
}
export default R
