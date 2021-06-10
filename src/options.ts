import LOCAL_KEY from "./localstore.js"
import {COLOR_VAR} from "./vars/GlobalVars.js";
import {ImageType} from "./imageResource.js";

export declare type OptionType = {
  /**
   *  画布容器 id, 一般定义一个 div
   */
  elem?: string
  /**
   *  根节点 id
   */
  initId?: string
  /**
   *  初始化历史数据
   */
  initData?: any,
  /**
   *  初始化钩子
   * @param data
   */
  initDataFun?: (data: object) => any
  /**
   *  编辑事件, 返回当前编辑元素的 id, 类型 (title|block), 回调函数
   * @param id
   * @param type
   * @param draw
   */
  onEdit?: (id: string, type: string, draw: (text) => any) => any,
  /**
   *  选择事件, 返回选择的 Id, 类型 (node|block), 回调函数
   * @param id
   * @param type
   * @param draw
   */
  onSelect?: (id: string, type: string, draw: (text) => any) => any,
  /**
   *  删除事件, 返回当前删除元素的 id, 类型 (title|block), 回调函数
   * @param id
   * @param type
   * @param draw
   */
  onDel?: (id: string, type: string, draw: (text) => any) => any,
  /**
   *  添加节点事件, 返回新节点 id, 是否是根节点(并行节点), 前驱节点 id, 回调函数
   * @param id
   * @param ifRoot
   * @param preNodeId
   * @param draw
   */
  onAddNode?: (id: string, ifRoot: boolean, preNodeId: string, draw: (text) => any) => any,
  /**
   *  添加内容块事件, 返回新内容块 id, 回调函数
   * @param id
   * @param draw
   */
  onAddBlock?: (id: string, draw: (text) => any) => any,
  /**
   *  保存事件, 返回序列化 json
   * @param data
   */
  onSave?: (data: string) => any,
  /**
   *  添加按钮高度
   */
  add_btn_h?: number,
  /**
   *  添加节点高度
   */
  add_node_btn_h?: number,
  /**
   *  添加节点宽度
   */
  add_node_btn_w?: number,
  /**
   *  标题高度
   */
  title_h?: number,
  /**
   *  标题宽度
   */
  title_w?: number,
  /**
   *  内容块高度
   */
  block_h?: number,
  /**
   *  内容块宽度
   */
  block_w?: number,
  /**
   *  画布初始高度
   */
  canv_h?: number,
  /**
   *  画布初始宽度
   */
  canv_w?: number,
  /**
   *  图标大小
   */
  icon_size?: number,
  /**
   *  节点标题字体
   */
  title_font?: '18px Arial',
  /**
   *  内容块字体
   */
  block_font?: '16px Arial',
  /**
   *  是否启用贝塞尔连线, 默认为折线
   */
  bezier?: boolean,
  /**
   *  线色-完全并行
   */
  parallel_line?: string,
  /**
   *  线色-局部并行
   */
  mix_line?: string,
  /**
   *  线色-串行
   */
  serial_line?: string,
  /**
   *  线色-当前流程
   */
  active_line?: string,
  /**
   *  连线线宽
   */
  conn_line_width?: 2,
  images?: { [key in ImageType]: any}
}
/**
 * 插件配置
 */
const options: OptionType = {
  initData: null,
  initDataFun: (data: object) => {
  },
  onEdit: null,
  onSelect: null,
  onDel: (a, b, c) => {
  },
  onAddNode: null,
  onAddBlock: null,
  onSave: res => {
    sessionStorage.setItem(LOCAL_KEY.DATA, res);
  },
  bezier: false,
  add_btn_h: 40,
  add_node_btn_h: 32,
  add_node_btn_w: 24,
  title_h: 140,
  title_w: 280,
  block_h: 100,
  block_w: 280,
  canv_h: 900,
  canv_w: 1600,
  icon_size: 20,
  title_font: '18px Arial',
  block_font: '16px Arial',
  parallel_line: COLOR_VAR.PARALLEL_LINE,
  mix_line: COLOR_VAR.MIX_LINE,
  serial_line: COLOR_VAR.SERIAL_LINE,
  active_line: COLOR_VAR.ACTIVE,
  conn_line_width: 2,
  images: null
}
export default options
