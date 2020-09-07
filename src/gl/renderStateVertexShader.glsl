attribute vec2 a_position; 
attribute vec2 a_texCoords;
varying   vec2 v_position;

uniform   mat3 u_viewMatrix;

void main() {
  gl_Position = vec4(u_viewMatrix * vec3(a_position, 1), 1);
  v_position = a_texCoords;
}