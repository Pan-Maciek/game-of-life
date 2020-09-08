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
  rules?: Rule[]
}

const { max } = Math
const size = { x: 512, y: 512 }

const src: number[] = Array.from({ length: size.x * size.y * 4 }, (_, i) => i % 4 == 3 ? 255 : 0)

export default class Canvas extends Component<CanvasProps> {
  private canvas: React.RefObject<HTMLCanvasElement>
  private gl: WebGLRenderingContext
  private nextStateProgramInfo: twgl.ProgramInfo
  brushProgramInfo: twgl.ProgramInfo

  constructor(props: Readonly<CanvasProps>) {
    super(props)
    this.canvas = React.createRef()
  }

  componentDidUpdate() {
    const rulesTexture = createRuleTexture(this.gl, this.props.rules ?? defaultRules)
    this.gl.useProgram(this.nextStateProgramInfo.program)
    twgl.setUniforms(this.nextStateProgramInfo, {
      u_rules: rulesTexture,
      u_size: [size.x, size.y]
    })
    this.gl.useProgram(this.brushProgramInfo.program)
    twgl.setUniforms(this.brushProgramInfo, {
      u_rules: rulesTexture,
      u_size: [size.x, size.y]
    })
  }

  componentDidMount() {
    const canvas = this.canvas.current
    const gl = this.gl = canvas.getContext('webgl')

    const nextStateProgramInfo = this.nextStateProgramInfo = twgl.createProgramInfo(gl, [nextStateVertexShader, nextStateFragmentShader]);
    const renderStateProgramInfo = twgl.createProgramInfo(gl, [renderStateVertexShader, renderStateFragmentShader])
    const brushProgramInfo = this.brushProgramInfo = twgl.createProgramInfo(gl, [brushVertexShader, brushFragmentShader])

    const bufferInfo = twgl.createBufferInfoFromArrays(gl, {
      a_position: { numComponents: 2, data: [-1, -1, 1, -1, 1, 1, -1, 1] },
      a_texCoords: { numComponents: 2, data: [0, 0, 1, 0, 1, 1, 0, 1] }
    })

    const createState = (src?: number[]) => twgl.createTexture(gl, {
      width: size.x, height: size.y,
      mag: gl.NEAREST, min: gl.NEAREST,
      wrap: gl.REPEAT, src
    })

    let currentState = createState()
    let previousState = createState(src)


    gl.useProgram(renderStateProgramInfo.program)
    twgl.setBuffersAndAttributes(gl, renderStateProgramInfo, bufferInfo)

    this.componentDidUpdate()

    const fbi = twgl.createFramebufferInfo(gl, [], size.x, size.y)
    function step() {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbi.framebuffer)
      gl.viewport(0, 0, size.x, size.y)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, currentState, 0)

      if (mouse.draw) {
        gl.useProgram(brushProgramInfo.program)
        twgl.setUniforms(brushProgramInfo, {
          u_radius: brushSize,
          u_center: [mouse.x, mouse.y],
          u_previousState: previousState
        })
        console.log(brushSize);
        
      } else {
        gl.useProgram(nextStateProgramInfo.program)
        twgl.setUniforms(nextStateProgramInfo, { u_previousState: previousState })
      }
      twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLE_FAN);

      [currentState, previousState] = [previousState, currentState]
    }

    const offset = { x: 0, y: 0 }

    const initialCellWidth = 1
    let scale = initialCellWidth * size.x / canvas.width
    let brushSize = 0.1

    function draw(dt) {
      step()
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(renderStateProgramInfo.program)
      twgl.setUniforms(renderStateProgramInfo, {
        u_currentState: currentState,
        u_viewMatrix: [
          scale, 0, 0,
          0, canvas.width / canvas.height * scale, 0,
          offset.x, offset.y, 1,
        ]
      })
      twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLE_FAN)

      requestAnimationFrame(draw)
    }
    setInterval(step, 500)


    let mouse = {
      drag: false,
      draw: false,
      x: 0, y: 0
    }
    canvas.addEventListener('mousedown', e => {
      if (e.button === 0) {
        mouse.x = ((2 * (e.x / canvas.width - 0.5) - offset.x) / scale + 1) / 2
        mouse.y = ((-2 * (e.y / canvas.height - 0.5) - offset.y) / (scale * canvas.width / canvas.height) + 1) / 2
        mouse.draw = true
      }
      if (e.button === 1) mouse.drag = true
      e.preventDefault()
    })
    window.addEventListener('mouseup', () => mouse.drag = mouse.draw = false)
    window.addEventListener('mousemove', e => {
      if (mouse.drag) {
        offset.x += e.movementX / canvas.width * 2
        offset.y -= e.movementY / canvas.height * 2
      }
      if (mouse.draw) {
        mouse.x = ((2 * (e.x / canvas.width - 0.5) - offset.x) / scale + 1) / 2
        mouse.y = ((-2 * (e.y / canvas.height - 0.5) - offset.y) / (scale * canvas.width / canvas.height) + 1) / 2
      }
    })

    canvas.addEventListener('wheel', e => {
      if (e.ctrlKey) brushSize = max(0.001, brushSize - e.deltaY / 100000)
      else scale = max(size.x / canvas.width, scale - e.deltaY / 1000)

      e.preventDefault()
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