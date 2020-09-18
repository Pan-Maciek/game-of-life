precision highp float;

attribute vec2 a_position;
attribute vec2 a_texCoords;
varying   vec2 v_position;

uniform vec2  u_center;
uniform float u_radius;

void main() {
  gl_Position = vec4(a_position * u_radius + u_center, 0, 1);
  v_position = a_texCoords;
}