interface MouseEvent {
  normalized: { x: number, y: number }
}

Object.defineProperty(MouseEvent.prototype, "normalized", {
  get(this: MouseEvent) {
    const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = this.target as HTMLElement
    const { x, y } = this
    return {
      x: 2 * (x - offsetLeft) / offsetWidth - 1,
      y: -(2 * (y - offsetTop) / offsetHeight - 1)
    }
  }
})