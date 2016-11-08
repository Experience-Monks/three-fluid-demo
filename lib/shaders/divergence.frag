precision highp float;
uniform sampler2D map;
varying vec2 textureCoordinates;
uniform float resolution;
uniform vec2 heroDimension;

#pragma glslify: decodeUV = require('./decode-uv.glsl');
#pragma glslify: encodeUV = require('./encode-uv.glsl');
#pragma glslify: backgroundUV = require('./glsl-background.glsl');
#pragma glslify: clipUV = require('./circle-clip.glsl');

void main(void) {
  float h = 1.0 / resolution;
  vec4 t = texture2D(map, textureCoordinates);
  t.r -= (texture2D(map, vec2(textureCoordinates.r + h, textureCoordinates.g)).a - t.a) * resolution;
  t.g -= (texture2D(map, vec2(textureCoordinates.r, textureCoordinates.g + h)).a - t.a) * resolution;

  t.rg *= mix(0.5, 0.999, clipUV(textureCoordinates));
  // vec2 uv = decodeUV(t.b, resolution);
  // vec2 bgUV = backgroundUV(textureCoordinates, vec2(resolution), heroDimension);
  // uv = mix(uv, bgUV, 0.95);
  // t.b = encodeUV(uv, resolution);

  // float d = length(textureCoordinates - 0.5);
  // d = smoothstep(0.5, 0.0, d);
  // t.rg *= 0.95;
  // t.a *= 0.95;
  t.b *= 0.999;
  // t.a *= t.b;
  gl_FragColor = t; // slowly decay
}