precision highp float;

uniform sampler2D map;
uniform sampler2D paletteMap;
uniform sampler2D heroMap;
uniform vec2 heroDimension;
uniform float resolution;
varying vec2 textureCoordinates;

#pragma glslify: dither = require('glsl-dither/8x8');
#pragma glslify: decodeUV = require('./decode-uv.glsl');
#pragma glslify: clipUV = require('./circle-clip.glsl');

vec3 tex(vec2 uv);

#pragma glslify: blur = require('glsl-hash-blur', sample=tex, iterations=5)

vec3 tex(vec2 uv) {
  return texture2D(map, uv).bbb;
}

void main(void) {
  float sampleA = texture2D(map, textureCoordinates).b;
  float sample = blur(textureCoordinates, 50.0 / resolution, 1.0).b * 0.85 + sampleA;
  // float sample = texture2D(map, textureCoordinates).b;
  // float alpha = sample.r - sample.g;
  
  // vec2 bgUV = decodeUV(sample.b, resolution);
  // gl_FragColor = texture2D(heroMap, bgUV);
  float r = clamp(sample, 0.0, 1.0);

  float paletteCount = 250.0;
  float n = 1.0 / paletteCount;
  float f = r / n;
  float part = fract(f);
  // r = ceil(f) * n;
  
  // float threshold = 0.75;
  // float softEdge = smoothstep(0.5 + threshold, 0.5 - threshold, part);
  // r = softEdge;
  // r += alpha;

  // vec3 palette = vec3(sample);
  vec3 palette = texture2D(paletteMap, vec2(r, 1.0)).rgb;
  gl_FragColor = vec4(palette, 1.0);
  // gl_FragColor = vec4(mix(vec3(0.0), palette, clipUV(textureCoordinates)), 1.0);
  
  // vec3 vectorFieldColor = mix(backgroundColor, fieldColor, abs(alpha) / 7.0);
  // gl_FragColor = vec4(mix(vec3(0.0), vec3(1.0), sample.b), 1.0);
}