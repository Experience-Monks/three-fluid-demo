precision highp float;

uniform sampler2D map;
uniform float resolution;
varying vec2 textureCoordinates;
const float diffuse = 0.25;

void main(void) {
  float stepSize = 1.0 / resolution;
  vec4 t = texture2D(map, textureCoordinates);
  vec4 texA = texture2D(map, vec2(textureCoordinates.r - stepSize, textureCoordinates.g));
  vec4 texB = texture2D(map, vec2(textureCoordinates.r, textureCoordinates.g - stepSize));
  vec4 texC = texture2D(map, vec2(textureCoordinates.r + stepSize, textureCoordinates.g));
  vec4 texD = texture2D(map, vec2(textureCoordinates.r, textureCoordinates.g + stepSize));
  t.a = (texA.a + texC.a + texB.a + texD.a - (t.r - texA.r + t.g - texB.g) * stepSize) * diffuse;
  gl_FragColor = t;
}