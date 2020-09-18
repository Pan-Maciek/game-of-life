import * as twgl from 'twgl.js'
import { Rules, createRuleTexture, defaultRules } from './rules'
import BrushSet from './brushSet'

type Rect = { width: number, height: number }
const { log2, round } = Math

import nextStateVertexShader from './gl/nextStateVertexShader.glsl'
import nextStateFragmentShader from './gl/nextStateFragmentShader.glsl'

export default class StateManager {
  currentState: WebGLTexture
  previousState: WebGLTexture
  size: Rect = { width: null, height: null }
  framebufferInfo: twgl.FramebufferInfo

  nextStateProgramInfo: twgl.ProgramInfo

  private createState(size: Rect) {
    return twgl.createTexture(this.gl, {
      width: size.width, height: size.height,
      mag: this.gl.NEAREST, min: this.gl.NEAREST,
      wrap: this.gl.REPEAT
    })
  }

  constructor(private gl: WebGLRenderingContext, size: Rect) {
    this.nextStateProgramInfo = twgl.createProgramInfo(gl, [nextStateVertexShader, nextStateFragmentShader])
    this.resize(size)
    this.rules = defaultRules
  }

  resize(size: Rect) {
    const width = 2 ** round(log2(size.width))
    const height = 2 ** round(log2(size.height))
    if (this.size.width == width && this.size.height == height) return

    if (size.width != width || size.height != height)
      console.warn(`size = {width: ${size.width}, height: ${size.height}} should be power of 2\
 automatically adjusting to cloosess valid value {width: ${width}, height: ${height}}`)
    this.size = { width, height }

    this.currentState = this.createState(this.size)
    this.previousState = this.createState(this.size)
    this.framebufferInfo = twgl.createFramebufferInfo(this.gl, [], width, height)

    this.gl.useProgram(this.nextStateProgramInfo.program)
    twgl.setUniforms(this.nextStateProgramInfo, {
      u_size: [width, height]
    })
  }

  swapStates() {
    [this.currentState, this.previousState] = [this.previousState, this.currentState]
  }

  step() {
    this.gl.useProgram(this.nextStateProgramInfo.program)
    twgl.setUniforms(this.nextStateProgramInfo, {
      u_previousState: this.previousState
    })

    this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, 4)
  }

  bindBuffer() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebufferInfo.framebuffer)
    this.gl.viewport(0, 0, this.size.width, this.size.height)
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.currentState, 0)
  }

  private _rules: Rules = ([] as any)
  set rules(rules: Rules) {
    rules = rules ?? defaultRules
    if (rules.every((val, i) => val === this._rules[i]))
      return
    this._rules = rules
    this.gl.useProgram(this.nextStateProgramInfo.program)
    twgl.setUniforms(this.nextStateProgramInfo, {
      u_rules: createRuleTexture(this.gl, rules)
    })
  }
}