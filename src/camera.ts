import mat3, { Mat3 } from './math/mat3'

export default class Camera {
  vm: Mat3

  constructor(initialScale: number) {
    this.vm = mat3.scale(initialScale)
  }

  get aspectRatio() {
    return this.vm[4] / this.vm[0]
  }

  set aspectRatio(aspectRatio: number) {
    this.vm.setAspectRatio(aspectRatio)
  }

  translate(normalized_movement: { x: number; y: number; }) {
    this.vm.translate(normalized_movement)
  }

  zoomInto(zoom: number, normalized: { x: number; y: number; }) {
    this.vm.zoomInto(zoom, normalized)
  }

  screenToVertex(position: { x: number; y: number; }): { x: number; y: number; } {
    return this.vm.inverse.vmul(position)
  }
}