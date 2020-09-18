precision highp float;

uniform float     u_hue;
uniform float     u_mode;

void main() {
  gl_FragColor = vec4(u_mode, u_hue, u_mode * .5, u_mode);
}