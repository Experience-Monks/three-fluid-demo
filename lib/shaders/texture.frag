precision highp float;
varying vec2 textureCoordinates;
uniform sampler2D map;
void main () {
  gl_FragColor = texture2D(map, textureCoordinates);
}
