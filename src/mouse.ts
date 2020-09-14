declare global {
  interface MouseEvent {
    normalized: { x: number, y: number }
    normalized_movement: { x: number, y: number }
  }
}

export const enum MouseButton { Left = 0, Wheel = 1, Right = 2 }

interface MouseControllerConfig {
  drag?: (e: MouseEvent) => void,
  draw?: (e: MouseEvent) => void,
  zoom?: (e: WheelEvent) => void
}

export class MouseController {
  drag: boolean = false
  draw: boolean = false
  position: { x: number, y: number }
  constructor(target: HTMLElement, config?: MouseControllerConfig) {
    target.addEventListener('mousedown', e => {
      this.position = e.normalized

      if (e.button === MouseButton.Left) this.draw = true
      else if (e.button === MouseButton.Wheel) this.drag = true
      e.preventDefault()
    })
    window.addEventListener('mouseup', e => {
      if (e.button === MouseButton.Left) this.draw = false
      else if (e.button === MouseButton.Wheel) this.drag = false
    })
    window.addEventListener('mousemove', e => {
      this.position = e.normalized
      if (this.draw) config?.draw?.(e)
      if (this.drag) config?.drag?.(e)
    })
    target.addEventListener('wheel', e => {
      config?.zoom?.(e)
      e.preventDefault()
    })
  }
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

Object.defineProperty(MouseEvent.prototype, "normalized_movement", {
  get(this: MouseEvent) {
    const { offsetWidth, offsetHeight } = this.target as HTMLElement
    const { movementX, movementY } = this
    return { x: 2 * movementX / offsetWidth, y: -(2 * movementY / offsetHeight) }
  }
})