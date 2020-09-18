import * as twgl from 'twgl.js'

import roundBrushFragmentShader from './gl/brushes/roundBrushFragmentShader.glsl'
import squareBrushFragmentShader from './gl/brushes/squareBrushFragmentShader.glsl'
import diamondBrushFragmentShader from './gl/brushes/diamondBrushFragmentShader.glsl'

import simpleBrushVertexShader from './gl/brushes/simpleBrushVertexShader.glsl'

enum BrushMode { Paint = 1, Erase = 0 }

export default class BrushSet {
  brushSize: number = 0.01
  hue: number = 0
  brushMode: BrushMode = BrushMode.Paint

  private gl: WebGLRenderingContext
  private currentProgram: twgl.ProgramInfo

  private brushes: { round, square, diamond }

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl
    this.brushes = {
      round: twgl.createProgramInfo(gl, [simpleBrushVertexShader, roundBrushFragmentShader]),
      square: twgl.createProgramInfo(gl, [simpleBrushVertexShader, squareBrushFragmentShader]),
      diamond: twgl.createProgramInfo(gl, [simpleBrushVertexShader, diamondBrushFragmentShader])
    }
    this.currentProgram = this.brushes.round
  }

  resize({ width, height }: { width: number, height: number }) {
    this.gl.useProgram(this.currentProgram.program)
    twgl.setUniforms(this.currentProgram, {
      u_aspectRatio: [1, height / width]
    })
  }

  applyBrush(previousState: WebGLTexture, center: [number, number]) {
    this.gl.useProgram(this.currentProgram.program)
    twgl.setUniforms(this.currentProgram, {
      u_radius: this.brushSize,
      u_center: center,
      u_previousState: previousState,
      u_hue: this.hue,
      u_mode: this.brushMode
    })
    this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, 4)
  }

  selectBrush(name: "round" | "square" | "diamond") {
    this.currentProgram = this.brushes[name]
  }
}