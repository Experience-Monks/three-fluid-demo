precision highp float;

uniform sampler2D map;
uniform sampler2D heroMap;
uniform vec2 forcePosition;
uniform vec2 forceVelocity;
uniform float resolution;
varying vec2 textureCoordinates;

uniform float movementScale;
uniform float mouseRadius;
const float paddingSize = 10.0;


void main(void) {
	vec4 color = texture2D(map, textureCoordinates);
	if(gl_FragCoord.x < paddingSize || gl_FragCoord.y < paddingSize || gl_FragCoord.x > resolution - paddingSize || gl_FragCoord.y > resolution - paddingSize) {
		gl_FragColor = color;
		return;
	}
	vec2 mousePos = forcePosition;
	vec2 vel = forceVelocity;
	vel.y = -vel.y;
	mousePos.y = 1.0 - mousePos.y; // fix coords for glsl

	vec2 normalizedVelocity = normalize(vel);
	vec2 relativeMouse = mousePos - textureCoordinates;
	float relMouseLength = length(relativeMouse);
	if (relMouseLength > 0.0 && relMouseLength < mouseRadius) {
		color.r -= vel.x * movementScale * (1.0 - (mouseRadius / relMouseLength)); // red is horizontal
		color.g -= vel.y * movementScale * (1.0 - (mouseRadius / relMouseLength)); // green is vertical vectors
		color.b = texture2D(heroMap, textureCoordinates).b;
		// color.b += 0.15;
	}
	gl_FragColor = color;
}