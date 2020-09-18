import React, { Component } from 'react'
import { Rules } from './rules'

import * as twgl from 'twgl.js'

import MouseController from './mouse'
import BrushSet from './brushSet'
import StateManager from './stateManager'
import Renderer from './renderer'
import Camera from './camera'

interface CanvasProps {
  width: number, height: number,
  rules?: Rules,
  config: {
    width: number,
    height: number
  },
  running?: boolean,
  hue?: number,
}

export default class Canvas extends Component<CanvasProps> {
  private canvas: React.RefObject<HTMLCanvasElement> = React.createRef()
  private gl: WebGLRenderingContext

  private mc: MouseController
  private brushes: BrushSet
  private stateManager: StateManager
  private camera: Camera
  private renderer: Renderer

  componentDidUpdate(oldProps?: Readonly<CanvasProps>) {
    this.camera.aspectRatio = this.stateManager.size.height / this.props.height * this.props.width / this.stateManager.size.width

    if (this.props.config.width !== oldProps?.config?.width || this.props.config.height !== oldProps?.config?.height) {
      this.stateManager.resize(this.props.config)
      this.brushes.resize(this.stateManager.size)
    }

    this.stateManager.rules = this.props.rules
    this.brushes.hue = this.props.hue

    if (!((this.props.running ?? true) || this.mc.draw || this.mc.drag)) this.renderer.render()
  }

  step() {
    if (this.props.running ?? true) return
    this.stateManager.swapStates()
    this.stateManager.bindBuffer()
    this.stateManager.step()
    this.renderer.render()
  }

  componentDidMount() {
    this.gl = twgl.getContext(this.canvas.current, {
      alpha: true, antialias: false,
      depth: false, stencil: false,
    })
    const initialCellWidth = 0.2

    this.stateManager = new StateManager(this.gl, this.props.config)
    this.brushes = new BrushSet(this.gl)
    this.camera = new Camera(initialCellWidth * this.stateManager.size.width / this.props.width)

    this.renderer = new Renderer(this.gl, this.stateManager, this.camera)
    this.brushes.brushSize = 100 / this.stateManager.size.width

    this.mc = new MouseController(this.canvas.current, this.camera)

    this.componentDidUpdate()
    requestAnimationFrame(this.animationLoop)
  }

  animationLoop = () => {

    if (this.props.running ?? true) {
      this.stateManager.swapStates()
      this.stateManager.bindBuffer()
    } else if (this.mc.draw) {
      this.stateManager.bindBuffer()
    }

    if (this.props.running ?? true)
      this.stateManager.step()

    if (this.mc.draw) {
      const brushCenter = this.camera.screenToVertex(this.mc.position)
      this.brushes.applyBrush(this.stateManager.previousState, brushCenter)
    }

    if ((this.props.running ?? true) || this.mc.draw || this.mc.drag) this.renderer.render()
    else if (this.mc.zoom) {
      this.renderer.render()
      this.mc.zoom = false
    }

    requestAnimationFrame(this.animationLoop)
  }

  render() {
    return <canvas
      ref={this.canvas}
      width={this.props.width}
      height={this.props.height}
    />
  }
}