export class Vec3 extends Array<number> {
  constructor(init?: [number, number, number]) {
    super(...init ?? [0, 0, 0]);
  }

  get x() { return this[0] }
  set x(val) { this[0] = val }

  get y() { return this[1] }
  set y(val) { this[1] = val }

  get z() { return this[2] }
  set z(val) { this[2] = val }

  get length() { return Math.hypot(...this) }
}