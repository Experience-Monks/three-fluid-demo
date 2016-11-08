vec2 decodeUV (float index, vec2 resolution) {
  // float n = 4096.0;
  // vec2 vec = vec2(mod(index, n), floor(index / n));
  // vec /= (n - 1.0);
  // vec /= resolution;
  // return vec;
  
  index = floor(index);
  float y = floor(index / resolution.x);
  float x = floor(index - resolution.x * y);
  // float x = floor(index / resolution.x);
  // float y = floor(mod(index, resolution.x));
  return vec2(x, y) / resolution;
}

vec2 decodeUV (float index, float resolution) {
  return decodeUV(index, vec2(resolution));
}

#pragma glslify: export(decodeUV);