precision highp float;

varying vec2      v_position;
uniform sampler2D u_previousState;
uniform vec2      u_center;
uniform float     u_radius;
uniform sampler2D u_rules;
uniform vec2      u_size;
uniform float     u_hue;

vec4 cellAt(vec2 offset) {
  return texture2D(u_previousState, v_position + offset / u_size);
}

#pragma glslify: blend = require('./blend')
vec4 step() {
  vec4 n1 = cellAt(vec2(-1.0, -1.0));
  vec4 n2 = cellAt(vec2( 0.0, -1.0));
  vec4 n3 = cellAt(vec2( 1.0, -1.0));
  vec4 n4 = cellAt(vec2( 1.0,  0.0));
  vec4 n5 = cellAt(vec2( 1.0,  1.0));
  vec4 n6 = cellAt(vec2( 0.0,  1.0));
  vec4 n7 = cellAt(vec2(-1.0,  1.0));
  vec4 n8 = cellAt(vec2(-1.0,  0.0));

  float sum = n1.x + n2.x + n3.x + n4.x + n5.x + n6.x + n7.x + n8.x;

  vec4 cell = cellAt(vec2(0, 0));
  bool dead = cell.x == 0.0;

  vec4 decision = texture2D(u_rules, vec2(sum / 16.0, 0));
  if (dead && decision.z > 0.0) {
    float color = blend (n1, blend (n2, blend (n3, blend (n4,
        blend(n5, blend (n6, blend (n7, blend(n8, -1.0))))))));
    return vec4(1, color, 0.5, 1); // spawn
  }
  else if (!dead && decision.y > 0.0) return vec4(1, cell.y, 0.5, 1); // keep
  else return vec4(0, cell.y, cell.z * 0.98, 1); // die
}

void main() {
  vec2 dt = (v_position - u_center) * vec2(1, u_size.y / u_size.x);
  dt = dt * dt;
  if (dt.x + dt.y <= u_radius) gl_FragColor = vec4(1, u_hue, .5, 1);
  else gl_FragColor = step();
}