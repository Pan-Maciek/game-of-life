precision highp float;

attribute vec2 a_position;
attribute vec2 a_texCoords;
varying   vec2 v_position;

uniform vec2      u_center;
uniform float     u_radius;
uniform vec2      u_size;
uniform float     u_hue;

void main() {
  gl_Position = vec4(a_position, 0, 1);
  v_position = a_texCoords;
}