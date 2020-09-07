import * as twgl from 'twgl.js'

import nextStateVertexShader from './gl/nextStateVertexShader.glsl'
import nextStateFragmentShader from './gl/nextStateFragmentShader.glsl'

import renderStateVertexShader from './gl/renderStateVertexShader.glsl'
import renderStateFragmentShader from './gl/renderStateFragmentShader.glsl'
const { max } = Math

const size = { x: 256, y: 256 }

const canvas = document.createElement('canvas')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
document.body.append(canvas)


const gl = canvas.getContext('webgl')

const nextStateProgramInfo = twgl.createProgramInfo(gl, [nextStateVertexShader, nextStateFragmentShader]);
const renderStateProgramInfo = twgl.createProgramInfo(gl, [renderStateVertexShader, renderStateFragmentShader])

const nextStepBufferInfo = twgl.createBufferInfoFromArrays(gl, {
  a_position: { numComponents: 2, data: [-1, -1, 1, -1, 1, 1, -1, 1] },
  a_texCoords: { numComponents: 2, data: [0, 0, 1, 0, 1, 1, 0, 1] }
})

const renderStateBufferInfo = twgl.createBufferInfoFromArrays(gl, {
  a_position: { numComponents: 2, data: [-1, -1, 1, -1, 1, 1, -1, 1] },
  a_texCoords: { numComponents: 2, data: [0, 0, 1, 0, 1, 1, 0, 1] }
})

//#region setup
const src = Array.from({ length: size.x * size.y * 4 }, (_, i) => i % 4 == 3 ? 255 : 0)
const setCell = (x: number, y: number) => {
  const offset = (x + y * size.x) * 4
  src[offset] = src[offset + 3] = 255
}

setCell(3, 3)
setCell(4, 3)
setCell(5, 3)
setCell(2, 4)
setCell(3, 4)
setCell(4, 4)

setCell(10, 10)
setCell(11, 10)
setCell(12, 10)

setCell(100, 100)
setCell(100, 101)
setCell(100, 102)
setCell(99, 100)
setCell(98, 101)

//#endregion

enum Rule { Die, Keep, Spawn }
const rules = [Rule.Die, Rule.Die, Rule.Keep, Rule.Spawn, Rule.Die, Rule.Die, Rule.Die, Rule.Die, Rule.Die]

const createRuleTexture = (rules: Rule[]) => twgl.createTexture(gl, {
  width: 16, height: 1, // texture size must be 2^n
  mag: gl.NEAREST,
  min: gl.NEAREST,
  internalFormat: gl.RGB,
  format: gl.RGB,
  src: [
    ...rules.map(rule => {
      if (rule == Rule.Die) return [255, 0, 0]
      if (rule == Rule.Keep) return [0, 255, 0]
      if (rule == Rule.Spawn) return [0, 255, 255]
    }).flat(),
    ...Array.from({ length: 21 }, () => 0) // fill remaining colors
  ]
})

const rulesTexture = createRuleTexture(rules)

const createState = (src?: (0 | 255)[]) => twgl.createTexture(gl, {
  width: size.x,
  height: size.y,
  mag: gl.NEAREST,
  min: gl.NEAREST,
  wrap: gl.REPEAT,
  src
})

let currentState = createState()
let previousState = createState(src)

const fbi = twgl.createFramebufferInfo(gl, [], size.x, size.y)

gl.useProgram(renderStateProgramInfo.program)
twgl.setBuffersAndAttributes(gl, renderStateProgramInfo, renderStateBufferInfo) // attributes remain for the mose part unchanged

gl.useProgram(nextStateProgramInfo.program)
twgl.setUniforms(nextStateProgramInfo, {
  u_rules: rulesTexture,
  u_size: [size.x, size.y]
})

function step() {
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbi.framebuffer)
  gl.viewport(0, 0, size.x, size.y)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, currentState, 0)

  gl.useProgram(nextStateProgramInfo.program)
  // twgl.setBuffersAndAttributes(gl, nextStateProgramInfo, nextStepBufferInfo)
  twgl.setUniforms(nextStateProgramInfo, { u_previousState: previousState })
  twgl.drawBufferInfo(gl, nextStepBufferInfo, gl.TRIANGLE_FAN);
  [currentState, previousState] = [previousState, currentState]
}
const offset = { x: 0, y: 0 }

let scale = 0.5

function draw() {
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
  // twgl.setBuffersAndAttributes(gl, renderStateprogramInfo, renderStateBufferInfo)
  twgl.drawBufferInfo(gl, nextStepBufferInfo, gl.TRIANGLE_FAN)

  requestAnimationFrame(draw)
}

requestAnimationFrame(draw)
let mousedown = false
canvas.addEventListener('mousedown', () => mousedown = true)
window.addEventListener('mouseup', () => mousedown = false)
window.addEventListener('mousemove', e => {
  if (!mousedown) return
  offset.x += e.movementX / window.innerWidth * 2
  offset.y -= e.movementY / window.innerHeight * 2
})

const nmap = (source_min, source_max, target_min, target_max, value) =>
  (value - source_min) / (source_max - source_min) * (target_max - target_min) + target_min

const canvasToTextureCoordinates = ({ x, y }: { x: number, y: number }) => ({
  x: (nmap(0, innerWidth, -1, 1, x) - offset.x) / scale,
  y: (-nmap(0, innerHeight, -1, 1, y) - offset.y) / (canvas.width / canvas.height * scale)
})

canvas.addEventListener('wheel', e => {
  scale = max(0.1, scale - e.deltaY / 1000)
})
