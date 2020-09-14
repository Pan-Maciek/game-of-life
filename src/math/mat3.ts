import { Vec3 } from './vec3'

export class Mat3 extends Array<number> {
  constructor(init?: [number, number, number, number, number, number, number, number, number]) {
    super(...init ?? [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    ])
  }
  get sx() { return this[0] }
  set sx(val) { this[0] = val }

  get sy() { return this[4] }
  set sy(val) { this[4] = val }

  get tx() { return this[6] }
  set tx(val) { this[6] = val }

  get ty() { return this[7] }
  set ty(val) { this[7] = val }

  get det() {
    const m = this
    return (m[0] * m[4] * m[8])
      + (m[1] * m[5] * m[6])
      + (m[2] * m[3] * m[7])
      - (m[2] * m[4] * m[6])
      - (m[5] * m[7] * m[0])
      - (m[8] * m[1] * m[3])
  }

  get inverse() {
    const det = this.det
    const m = this
    return new Mat3([
      (m[4] * m[8] - m[5] * m[7]) / det,
      (m[2] * m[7] - m[1] * m[8]) / det,
      (m[1] * m[5] - m[2] * m[4]) / det,

      (m[5] * m[6] - m[3] * m[8]) / det,
      (m[0] * m[8] - m[2] * m[6]) / det,
      (m[2] * m[3] - m[0] * m[5]) / det,

      (m[3] * m[7] - m[4] * m[6]) / det,
      (m[1] * m[6] - m[0] * m[7]) / det,
      (m[0] * m[4] - m[1] * m[3]) / det
    ])
  }

  vmul({ x, y, z = 1 }) {
    const m = this
    return new Vec3([
      (m[0] * x + m[3] * y + m[6] * z),
      (m[1] * x + m[4] * y + m[7] * z),
      (m[2] * x + m[5] * y + m[8] * z)
    ])
  }

  translate(x: number, y: number) {
    this[6] += x
    this[7] += y
    return this
  }

  scale(s: number, { x: tx, y: ty }) {
    this[6] -= tx
    this[7] -= ty

    for (let i = 0; i < 8; i++) 
      this[i] *= s
    
    this[6] += tx
    this[7] += ty

    return this
  }
}

export default {
  get id() { return new Mat3 },
  mul(l: Mat3, r: Mat3) {
    return new Mat3([
      l[0] * r[0] + l[3] * r[1] + l[6] * r[2],
      l[1] * r[0] + l[4] * r[1] + l[7] * r[2],
      l[2] * r[0] + l[5] * r[1] + l[8] * r[2],

      l[0] * r[3] + l[3] * r[4] + l[6] * r[5],
      l[1] * r[3] + l[4] * r[4] + l[7] * r[5],
      l[2] * r[3] + l[5] * r[4] + l[8] * r[5],

      l[0] * r[6] + l[3] * r[7] + l[6] * r[8],
      l[1] * r[6] + l[4] * r[7] + l[7] * r[8],
      l[2] * r[6] + l[5] * r[7] + l[8] * r[8]
    ])
  },
  translate(tx: number, ty: number) {
    return new Mat3([1, 0, 0, 0, 1, 0, tx, ty, 1])
  },
  scale(sx: number, sy?: number) {
    return new Mat3([sx, 0, 0, 0, sy ?? sx, 0, 0, 0, 1])
  }
}