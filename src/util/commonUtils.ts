export function genUUID() {
  var d = new Date().getTime();
  if (window.performance && typeof window.performance.now === "function") {
    d += performance.now(); //use high-precision timer if available
  }
  var uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}

/**
 * 判断某个示例是否是属于哪个类
 * @param obj
 * @param type
 */
export function isType(obj: any, type: object): boolean {
  return obj.__proto__.constructor === type
}

/**
 * 移除数组中的元素
 * @param arr
 * @param ele
 */
export function arrRemove(arr, ele) {
  let idx = arr.indexOf(ele)
  if (idx !== -1) {
    arr.splice(idx, 1)
  }
}
