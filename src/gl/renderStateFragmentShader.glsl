precision highp float;
varying vec2 v_position;

uniform sampler2D u_currentState;

void main() {
  vec4 cell = texture2D(u_currentState, v_position);
  if (cell.x > 0.0) gl_FragColor = vec4(0.3, 0.6, 0.3, 1);
  else gl_FragColor = vec4(0.12, 0.12, 0.12, 1);
}