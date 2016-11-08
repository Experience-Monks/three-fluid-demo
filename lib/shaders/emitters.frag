precision highp float;
uniform sampler2D map;
uniform sampler2D heroMap;
uniform float lifetime;
uniform float resolution;
uniform vec2 heroDimension;
varying vec2 textureCoordinates;

#pragma glslify: backgroundUV = require('./glsl-background.glsl');
#pragma glslify: encodeUV = require('./encode-uv.glsl');
#pragma glslify: clipUV = require('./circle-clip.glsl');

void main(void) {
  vec2 bgUV = backgroundUV(textureCoordinates, vec2(resolution), heroDimension);
	vec4 color = texture2D(heroMap, bgUV);
	vec4 flipColor = texture2D(map, textureCoordinates);

	gl_FragColor = flipColor;
  // gl_FragColor.b = encodeUV(bgUV, resolution);
  // gl_FragColor.b = mix(gl_FragColor.b, encodeUV(bgUV, resolution), 0.1);
  // float paletteCount = 3.0;
  // float n = 1.0 / paletteCount;
  // float f = color.b / n;
  // float part = fract(f);
  // float r = ceil(f) * n;
  // gl_FragColor.b = r;
  float texColor = color.b;
  float radius = 0.45;
  float smoothness = 0.001;
  float d = length(textureCoordinates - 0.5);
  
  float innerRadius = radius - 0.02;
  float innerThickness = 0.01;
  float innerRadius1 = innerRadius - innerThickness / 2.0;
  float innerRadius2 = innerRadius + innerThickness / 2.0;
  float innerSmoothness = 0.001;
  float secondA = smoothstep(innerRadius1 + innerSmoothness, innerRadius1 - innerSmoothness, d);
  float secondB = smoothstep(innerRadius2 + innerSmoothness, innerRadius2 - innerSmoothness, d);
  
  texColor *= smoothstep(radius + smoothness, radius - smoothness, d);
  texColor *= 1.0 - abs(secondA - secondB);
  texColor = clamp(texColor, 0.0, 1.0);
  gl_FragColor.b = mix(gl_FragColor.b, texColor, 0.05);
	// gl_FragColor.b *= lifetime;
	// gl_FragColor.b += color.b * (1.0 - lifetime);
}