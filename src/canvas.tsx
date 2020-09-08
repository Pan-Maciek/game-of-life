import React, { Component } from 'react'
import { Rule, createRuleTexture, defaultRules } from './rules'

import * as twgl from 'twgl.js'

import nextStateVertexShader from './gl/nextStateVertexShader.glsl'
import nextStateFragmentShader from './gl/nextStateFragmentShader.glsl'

import renderStateVertexShader from './gl/renderStateVertexShader.glsl'
import renderStateFragmentShader from './gl/renderStateFragmentShader.glsl'

import brushFragmentShader from './gl/brushFragmentShader.glsl'
import brushVertexShader from './gl/brushVertexShader.glsl'

interface CanvasProps {
  width: number, height: number,
  rules?: Rule[],
  config: {
    width: number,
    height: number
  }
}

const { max, log2 } = Math

export default class Canvas extends Component<CanvasProps> {
  private canvas: React.RefObject<HTMLCanvasElement>
  private gl: WebGLRenderingContext

  private nextStateProgramInfo: twgl.ProgramInfo
  private brushProgramInfo: twgl.ProgramInfo

  private aspectRatio: number

  constructor(props: Readonly<CanvasProps>) {
    super(props)
    this.canvas = React.createRef()
  }

  componentDidUpdate() {
    const rulesTexture = createRuleTexture(this.gl, this.props.rules ?? defaultRules)
    this.aspectRatio = this.props.config.height / this.props.config.width * this.props.width / this.props.height
    this.gl.useProgram(this.nextStateProgramInfo.program)
    twgl.setUniforms(this.nextStateProgramInfo, {
      u_rules: rulesTexture,
      u_size: [this.props.config.width, this.props.config.height]
    })
    this.gl.useProgram(this.brushProgramInfo.program)
    twgl.setUniforms(this.brushProgramInfo, {
      u_rules: rulesTexture,
      u_size: [this.props.config.width, this.props.config.height]
    })
  }

  componentDidMount() {
    const canvas = this.canvas.current
    const gl = this.gl = canvas.getContext('webgl')

    const offset = { x: 0, y: 0 }
    let mouse = {
      drag: false,
      draw: false,
      x: 0, y: 0
    }
    const initialCellWidth = 4
    let scale = initialCellWidth * this.props.config.width / canvas.width
    let brushSize = 0.0001

    const nextStateProgramInfo = this.nextStateProgramInfo = twgl.createProgramInfo(gl, [nextStateVertexShader, nextStateFragmentShader]);
    const renderStateProgramInfo = twgl.createProgramInfo(gl, [renderStateVertexShader, renderStateFragmentShader])
    const brushProgramInfo = this.brushProgramInfo = twgl.createProgramInfo(gl, [brushVertexShader, brushFragmentShader])

    const bufferInfo = twgl.createBufferInfoFromArrays(gl, {
      a_position: { numComponents: 2, data: [-1, -1, 1, -1, 1, 1, -1, 1] },
      a_texCoords: { numComponents: 2, data: [0, 0, 1, 0, 1, 1, 0, 1] }
    })

    const createState = () => twgl.createTexture(gl, {
      width: this.props.config.width, height: this.props.config.height,
      mag: gl.NEAREST, min: gl.NEAREST,
      wrap: gl.REPEAT
    })

    let currentState = createState()
    let previousState = createState()

    gl.useProgram(renderStateProgramInfo.program)
    twgl.setBuffersAndAttributes(gl, renderStateProgramInfo, bufferInfo)

    this.componentDidUpdate()

    const fbi = twgl.createFramebufferInfo(gl, [], this.props.config.width, this.props.config.height) // must resize on config change
    const step = () => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbi.framebuffer)
      gl.viewport(0, 0, this.props.config.width, this.props.config.height)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, currentState, 0)

      if (mouse.draw) {
        gl.useProgram(brushProgramInfo.program)
        twgl.setUniforms(brushProgramInfo, {
          u_radius: brushSize,
          u_center: [mouse.x, mouse.y],
          u_previousState: previousState
        })
      } else {
        gl.useProgram(nextStateProgramInfo.program)
        twgl.setUniforms(nextStateProgramInfo, { u_previousState: previousState })
      }
      twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLE_FAN);

      [currentState, previousState] = [previousState, currentState]
    }

    const draw = () => {
      step()
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(renderStateProgramInfo.program)
      twgl.setUniforms(renderStateProgramInfo, {
        u_currentState: currentState,
        u_viewMatrix: [
          scale, 0, 0,
          0, scale * this.aspectRatio, 0,
          offset.x, offset.y, 1,
        ]
      })
      twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLE_FAN)

      requestAnimationFrame(draw)
    }
    setInterval(step, 500)

    const coords = {
      screenToTexture: ({ x, y }) => ({
        x: ((2 * ((x - canvas.offsetLeft) / canvas.width - 0.5) - offset.x) / scale + 1) / 2,
        y: ((-2 * ((y - canvas.offsetTop) / canvas.height - 0.5) - offset.y) / (scale * this.aspectRatio) + 1) / 2
      })
    }

    canvas.addEventListener('mousedown', e => {
      if (e.button === 0) mouse = { ...mouse, ...coords.screenToTexture(e), draw: true }
      if (e.button === 1) mouse.drag = true
      e.preventDefault()
    })
    window.addEventListener('mouseup', () => mouse.drag = mouse.draw = false)
    window.addEventListener('mousemove', e => {
      if (mouse.drag) {
        offset.x += e.movementX / canvas.width * 2
        offset.y -= e.movementY / canvas.height * 2
      }
      if (mouse.draw) mouse = { ...mouse, ...coords.screenToTexture(e) }
    })

    canvas.addEventListener('wheel', e => {
      if (e.ctrlKey) {
        brushSize = max(0.0001, brushSize - e.deltaY / 100000)
        e.preventDefault()
      }
      else scale = max(this.props.config.width / canvas.width, scale - e.deltaY / 1000)
    })

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