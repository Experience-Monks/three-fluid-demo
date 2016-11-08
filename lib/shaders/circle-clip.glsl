float clip (vec2 textureCoordinates) {
  float radius = 0.45;
  float smoothness = 0.001;
  float d = length(textureCoordinates - 0.5);
  return smoothstep(radius + smoothness, radius - smoothness, d);
}

#pragma glslify: export(clip);