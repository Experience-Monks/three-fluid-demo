float encodeUV (vec2 uv, vec2 resolution) {
  vec2 uvPixel = floor(uv * resolution);
  return uvPixel.x + (uvPixel.y * resolution.x);
  // float x = floor(uv.x * (n - 1.0));
  // float y = floor(uv.y * (n - 1.0));
  // return (x * n) + y;
  // return floor(uv.x * resolution.x) + ((resolution.y - floor(uv.y * resolution.y)) * resolution.x);
}

float encodeUV (vec2 uv, float resolution) {
  return encodeUV(uv, vec2(resolution));
}

#pragma glslify: export(encodeUV);