import Camera from './camera'
import StateManager from './stateManager'

import * as twgl from 'twgl.js'

import renderStateVertexShader from './gl/renderStateVertexShader.glsl'
import renderStateFragmentShader from './gl/renderStateFragmentShader.glsl'

export default class Renderer {
  renderStateProgramInfo: twgl.ProgramInfo
  private canvas: HTMLCanvasElement

  constructor(private gl: WebGLRenderingContext, private stateManager: StateManager, private camera: Camera) {
    this.renderStateProgramInfo = twgl.createProgramInfo(gl, [renderStateVertexShader, renderStateFragmentShader])
    this.canvas = gl.canvas as HTMLCanvasElement

    const bufferInfo = twgl.createBufferInfoFromArrays(this.gl, {
      a_position: { numComponents: 2, data: [-1, -1, 1, -1, 1, 1, -1, 1] },
      a_texCoords: { numComponents: 2, data: [0, 0, 1, 0, 1, 1, 0, 1] }
    })

    twgl.setBuffersAndAttributes(this.gl, this.renderStateProgramInfo, bufferInfo)
  }

  render() {
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    this.gl.useProgram(this.renderStateProgramInfo.program)
    twgl.setUniforms(this.renderStateProgramInfo, {
      u_currentState: this.stateManager.currentState,
      u_viewMatrix: this.camera.vm
    })
    this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, 4)
  }
}