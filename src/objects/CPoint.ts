/**
 * 坐标类
 */
export class CPoint {
  x: number;
  y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x
    this.y = y
  }

  offsetNew(offx: number, offy: number) {
    return new CPoint(this.x + offx, this.y + offy)
  }

  setP(x, y) {
    this.x = x
    this.y = y
  }

  offset(offx, offy) {
    this.x += offx
    this.y += offy
    return this
  }
}
