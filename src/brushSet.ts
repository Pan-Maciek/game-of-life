import * as twgl from 'twgl.js'

import roundBrushFragmentShader from './gl/brushes/roundBrushFragmentShader.glsl'
import simpleBrushVertexShader from './gl/brushes/simpleBrushVertexShader.glsl'

export default class BrushSet {
  brushSize: number = 0.01
  hue: number = 0
  private gl: WebGLRenderingContext
  private currentProgram: twgl.ProgramInfo

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl
    this.currentProgram = twgl.createProgramInfo(gl, [simpleBrushVertexShader, roundBrushFragmentShader])
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
      u_hue: this.hue
    })
    this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, 4)
  }
}