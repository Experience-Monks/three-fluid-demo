attribute vec4 position;
attribute vec2 uv;
varying vec2 textureCoordinates;
void main(void) {
  gl_Position = vec4(position.xyz, 1.0);
  textureCoordinates = vec2(position.x, position.y) * 0.5 + 0.5;
}