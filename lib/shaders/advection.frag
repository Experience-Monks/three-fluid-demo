precision highp float;
uniform sampler2D map;
varying vec2 textureCoordinates;
uniform float resolution;
uniform float ripple;

void main(void) {
  float h = 1.0 / resolution;
  float tau = 0.5 * ripple / h;
  vec4 sample = texture2D(map, textureCoordinates);
  vec2 D = -tau * vec2(
    sample.r + texture2D(map, vec2(textureCoordinates.r - h, textureCoordinates.g)).r,
    sample.g + texture2D(map, vec2(textureCoordinates.r, textureCoordinates.g - h)).g
  );
  vec2 Df = floor(D);
  vec2 Dd = D - Df;
  vec2 textureCoordinates1 = textureCoordinates + Df * h;
  vec3 new = (
      texture2D(map, textureCoordinates1).rgb * (1.0 - Dd.g) +
      texture2D(map, vec2(textureCoordinates1.r, textureCoordinates1.g + h)).rgb * Dd.g
    ) * (1.0 - Dd.r)
    + (
      texture2D(map, vec2(textureCoordinates1.r + h, textureCoordinates1.g)).rgb * (1. - Dd.g) +
    texture2D(map, vec2(textureCoordinates1.r + h, textureCoordinates1.g + h)).rgb * Dd.g
    ) * Dd.r;
  gl_FragColor = vec4(new, sample.a);
}