const float swirlFactor = 0.;

float clerp(float a, float b) {
  float dt = a - b;
  float abs_dt = abs(dt);
  if (abs_dt > 0.5) dt = sign(dt) * (abs_dt - 1.0);
  return fract (dt * (0.5 - sign(dt) * swirlFactor) + b);
}

float blend(vec4 a, float b) {
  return (a.x > 0.5) ? (b < 0.0) ? a.y : clerp(a.y, b) : b;
}

#pragma glslify: export(blend)