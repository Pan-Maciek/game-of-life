precision highp float;

varying vec2      v_position;
uniform sampler2D u_previousState;
uniform vec2      u_center;
uniform float     u_radius;
uniform vec2      u_size;
uniform float     u_hue;

void main() {
  vec2 dt = (v_position - u_center) * vec2(1, u_size.y / u_size.x);
  dt = dt * dt;
  if (dt.x + dt.y <= u_radius * u_radius) gl_FragColor = vec4(1, u_hue, .5, 1);
  else gl_FragColor = texture2D(u_previousState, v_position);
}