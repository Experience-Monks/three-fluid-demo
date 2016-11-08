precision highp float;
varying vec2 textureCoordinates;
void main () {
  gl_FragColor = vec4(vec3(textureCoordinates.y), 1.0);
}
