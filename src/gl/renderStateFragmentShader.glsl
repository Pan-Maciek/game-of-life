precision highp float;
varying vec2 v_position;

uniform sampler2D u_currentState;

#pragma glslify: hslToRgb = require('./util/hslToRgb')

void main() {
  vec4 cell = texture2D(u_currentState, v_position);
  gl_FragColor = vec4(0.12, 0.12, 0.12, 1) + hslToRgb(cell.y, 1., cell.z);
}