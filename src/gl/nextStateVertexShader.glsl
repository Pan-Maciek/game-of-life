precision highp float;

attribute vec2 a_position;
attribute vec2 a_texCoords;
varying   vec2 v_position;

void main() {
  gl_Position = vec4(a_position, 0, 1);
  v_position = a_texCoords;
}