/**
 * 获取 js 脚本路径
 */
let jsPath = document.currentScript&& "src" in document.currentScript
  ? document.currentScript.src : function () {
  let js = document.scripts
    , last = js.length - 1
    , src;
  for (let i = last; i > 0; i--) {
    // @ts-ignore
    if (js[i].readyState === 'interactive') {
      src = js[i].src;
      break;
    }
  }
  return src || js[last].src;
}();
export default jsPath.substring(0, jsPath.lastIndexOf('/') + 1);
