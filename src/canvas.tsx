import React, { Component } from 'react'
import { Rule, createRuleTexture, defaultRules } from './rules'

import * as twgl from 'twgl.js'

import nextStateVertexShader from './gl/nextStateVertexShader.glsl'
import nextStateFragmentShader from './gl/nextStateFragmentShader.glsl'

import renderStateVertexShader from './gl/renderStateVertexShader.glsl'
import renderStateFragmentShader from './gl/renderStateFragmentShader.glsl'

import brushFragmentShader from './gl/brushFragmentShader.glsl'
import brushVertexShader from './gl/brushVertexShader.glsl'

import mat3, { Mat3 } from './math/mat3'
import { MouseController } from './mouse'

const { sign, exp, max, random } = Math

interface CanvasProps {
  width: number, height: number,
  rules?: [Rule, Rule, Rule, Rule, Rule, Rule, Rule, Rule, Rule],
  config: {
    width: number,
    height: number
  }
}

export default class Canvas extends Component<CanvasProps> {
  private canvas: React.RefObject<HTMLCanvasElement> = React.createRef()
  private gl: WebGLRenderingContext

  private nextStateProgramInfo: twgl.ProgramInfo
  private brushProgramInfo: twgl.ProgramInfo
  private renderStateProgramInfo: twgl.ProgramInfo

  private vm: Mat3 // view matrix
  private fbi: twgl.FramebufferInfo
  private previousState: WebGLTexture
  private currentState: WebGLTexture
  private bufferInfo: twgl.BufferInfo
  private mc: MouseController
  private brushSize: number
  private hue: number

  constructor(props: Readonly<CanvasProps>) {
    super(props)
    this.canvas = React.createRef()
  }

  private preparePrograms() {
    this.renderStateProgramInfo = twgl.createProgramInfo(this.gl, [renderStateVertexShader, renderStateFragmentShader])
    this.nextStateProgramInfo = twgl.createProgramInfo(this.gl, [nextStateVertexShader, nextStateFragmentShader])
    this.brushProgramInfo = twgl.createProgramInfo(this.gl, [brushVertexShader, brushFragmentShader])

    this.componentDidUpdate()

    this.bufferInfo = twgl.createBufferInfoFromArrays(this.gl, {
      a_position: { numComponents: 2, data: [-1, -1, 1, -1, 1, 1, -1, 1] },
      a_texCoords: { numComponents: 2, data: [0, 0, 1, 0, 1, 1, 0, 1] }
    })

    this.gl.useProgram(this.renderStateProgramInfo.program)
    twgl.setBuffersAndAttributes(this.gl, this.renderStateProgramInfo, this.bufferInfo)
  }

  componentDidUpdate(oldProps?: Readonly<CanvasProps>) {
    const rulesTexture = createRuleTexture(this.gl, this.props.rules ?? defaultRules)
    this.vm.setAspectRatio(this.props.config.height / this.canvas.current.height * this.canvas.current.width / this.props.config.width)

    if (this.props.config.width !== oldProps?.config?.width || this.props.config.height !== oldProps?.config?.height) {
      this.fbi = twgl.createFramebufferInfo(this.gl, [], this.props.config.width, this.props.config.height)

      const createState = () => twgl.createTexture(this.gl, {
        width: this.props.config.width, height: this.props.config.height,
        mag: this.gl.NEAREST, min: this.gl.NEAREST,
        wrap: this.gl.REPEAT
      })

      this.currentState = createState()
      this.previousState = createState()
    }

    if (this.props.width !== oldProps?.width || this.props.height !== oldProps?.height) {
      const u_size = [this.props.config.width, this.props.config.height]

      this.gl.useProgram(this.nextStateProgramInfo.program)
      twgl.setUniforms(this.nextStateProgramInfo, { u_rules: rulesTexture, u_size })

      this.gl.useProgram(this.brushProgramInfo.program)
      twgl.setUniforms(this.brushProgramInfo, { u_size })
    }
  }

  screenToTexture({ x, y }) {
    ({ x, y } = this.vm.inverse.vmul({ x, y }))
    return [(x + 1) / 2, (y + 1) / 2]
  }

  private applyBrush() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbi.framebuffer)
    this.gl.viewport(0, 0, this.props.config.width, this.props.config.height)
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.currentState, 0)

    this.gl.useProgram(this.brushProgramInfo.program)
    twgl.setUniforms(this.brushProgramInfo, {
      u_radius: this.brushSize,
      u_center: this.screenToTexture(this.mc.position),
      u_previousState: this.previousState,
      u_hue: this.hue
    })
    twgl.drawBufferInfo(this.gl, this.bufferInfo, this.gl.TRIANGLE_FAN);
    [this.currentState, this.previousState] = [this.previousState, this.currentState]
  }

  private step() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbi.framebuffer)
    this.gl.viewport(0, 0, this.props.config.width, this.props.config.height)
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.currentState, 0)

    this.gl.useProgram(this.nextStateProgramInfo.program)
    twgl.setUniforms(this.nextStateProgramInfo, {
      u_previousState: this.previousState
    })
    twgl.drawBufferInfo(this.gl, this.bufferInfo, this.gl.TRIANGLE_FAN);
    [this.currentState, this.previousState] = [this.previousState, this.currentState]
  }

  private draw() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.viewport(0, 0, this.props.width, this.props.height);

    this.gl.useProgram(this.renderStateProgramInfo.program)
    twgl.setUniforms(this.renderStateProgramInfo, {
      u_currentState: this.currentState,
      u_viewMatrix: this.vm
    })
    twgl.drawBufferInfo(this.gl, this.bufferInfo, this.gl.TRIANGLE_FAN)
  }

  componentDidMount() {
    const canvas = this.canvas.current
    this.gl = canvas.getContext('webgl')

    const initialCellWidth = 4
    this.vm = mat3.scale(initialCellWidth * this.props.config.width / canvas.width)
    this.brushSize = 10 / this.props.config.width

    this.preparePrograms()

    const draw = () => {
      if (this.mc.draw) this.applyBrush()
      this.step()
      this.draw()
      requestAnimationFrame(draw)
    }

    const zoomIntensity = 0.2
    this.mc = new MouseController(canvas, {
      drag: e => this.vm.translate(e.normalized_movement),
      zoom: e => this.vm.zoomInto(exp(sign(-e.deltaY) * zoomIntensity), e.normalized)
    })
    window.addEventListener('mousedown', e => this.hue = random())

    requestAnimationFrame(draw)
  }

  render() {
    return <canvas
      ref={this.canvas}
      width={this.props.width}
      height={this.props.height}
    />
  }
}