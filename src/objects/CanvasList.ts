/**
 * 定义画布容器, 添加监听事件
 */
export class CanvasList<T> extends Array {
  readonly callback: any;
  private spliceCallback: (start) => void;

  constructor(callback: (b) => void, ...items: T[]) {
    super(...items as any[]);
    this.callback = callback || (() => {
    })
  }

  setSpliceCallback(callback: (start) => void) {
    this.spliceCallback = callback
  }

  // 只能添加一个
  push(item) {
    this.callback(item)
    return super.push(item)
  }

  splice(start: number, deleteCount?: number): any[] {
    if (this.spliceCallback) {
      this.spliceCallback(start)
    }
    return super.splice(start, deleteCount)
  }
}
