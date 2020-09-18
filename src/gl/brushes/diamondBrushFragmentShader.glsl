precision highp float;

varying vec2      v_position;
uniform sampler2D u_previousState;
uniform vec2      u_aspectRatio;
uniform vec2      u_center;
uniform float     u_radius;
uniform float     u_hue;
uniform float     u_mode;

void main() {
  vec2 dt = (v_position - u_center) * u_aspectRatio;
  if (abs(dt.x) + abs(dt.y) <= u_radius) gl_FragColor = vec4(u_mode, u_hue, u_mode * .5, 1);
  else gl_FragColor = texture2D(u_previousState, v_position);
}