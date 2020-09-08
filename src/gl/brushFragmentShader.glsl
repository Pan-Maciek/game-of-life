precision highp float;

varying vec2      v_position;
uniform sampler2D u_previousState;
uniform vec2      u_center;
uniform float     u_radius;
uniform sampler2D u_rules;
uniform vec2      u_size;

vec4 cellAt(vec2 offset) {
  return texture2D(u_previousState, v_position + offset / u_size);
}

void main() {
  vec2 dt = (v_position - u_center);
  if ((dt.x * dt.x) + (dt.y * dt.y) <= u_radius) gl_FragColor = vec4(1, 0, 0, 1);
  else {
    vec4 n1 = cellAt (vec2 (-1.0, -1.0));
    vec4 n2 = cellAt (vec2 ( 0.0, -1.0));
    vec4 n3 = cellAt (vec2 ( 1.0, -1.0));
    vec4 n4 = cellAt (vec2 ( 1.0,  0.0));
    vec4 n5 = cellAt (vec2 ( 1.0,  1.0));
    vec4 n6 = cellAt (vec2 ( 0.0,  1.0));
    vec4 n7 = cellAt (vec2 (-1.0,  1.0));
    vec4 n8 = cellAt (vec2 (-1.0,  0.0));

    float sum = n1.x + n2.x + n3.x + n4.x + n5.x + n6.x + n7.x + n8.x;
    bool dead = cellAt(vec2 (0, 0)).r == 0.0;
    vec4 decision = texture2D(u_rules, vec2 (sum / 16.0, 0));
    if (dead && decision.z > 0.0)       gl_FragColor = vec4(1, 0, 0, 1); // spawn
    else if (!dead && decision.y > 0.0) gl_FragColor = vec4(1, 0, 0, 1); // keep
    else gl_FragColor = vec4(0, 0, 0, 1); // die
  }
}