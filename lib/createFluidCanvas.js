const glslify = require('glslify');
const assign = require('object-assign');
const shuffle = require('array-shuffle');
const palettes = shuffle(require('nice-color-palettes/500'));
const defined = require('defined');

module.exports = function (renderer, opt = {}) {
  let loaded = false;
  const outputObject3d = new THREE.Object3D();
  const scene = new THREE.Scene();
  const forces = [];

  const resolution = defined(opt.resolution, 256);
  const alwaysEmit = defined(opt.alwaysEmit, true);
  const lifetime = 0.95;
  const maxVelocity = defined(opt.maxVelocity, 100);
  const mouseRadius = defined(opt.mouseRadius, 10) / resolution;
  const movementScale = defined(opt.movementScale, 2);
  const ripple = defined(opt.ripple, 0.1);
  const iterations = defined(opt.iterations, 20);

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -100, 100);
  const planeGeometry = new THREE.PlaneGeometry(2, 2, 1);
  const basicVertexShader = glslify('./shaders/basic.vert');
  const shaderMaterials = [];
  if (iterations % 2 !== 0) throw new TypeError('must be even iterations!');

  const colorMaterial = createShader(glslify('./shaders/color.frag'));
  const outputTextureMaterial = createShader(glslify('./shaders/texture.frag'));
  outputTextureMaterial.transparent = true;

  const palette = [ 'hsl(0, 0%, 90%)', 'hsl(0, 0%, 10%)' ];
  // const palette = ['#C7DEA0', '#EB3531', '#502B6E'];
  // const palette = shuffle(palettes.slice(0, 1).reduce((a, b) => a.concat(b), [])).slice(0, 2);
  palette.unshift('#fff');

  const paletteBytes = palette.map(str => {
    const color = new THREE.Color(str);
    return [ (color.r * 255) | 0, (color.g * 255) | 0, (color.b * 255) | 0 ];
  }).reduce((a, b) => a.concat(b), []);
  const paletteTexture = new THREE.DataTexture(new Uint8Array(paletteBytes), palette.length, 1, THREE.RGBFormat, THREE.UnsignedByteType);
  paletteTexture.minFilter = THREE.LinearFilter;
  paletteTexture.magFilter = THREE.LinearFilter;
  paletteTexture.generateMipmaps = false;
  paletteTexture.needsUpdate = true;

  const outputMesh = new THREE.Mesh(planeGeometry, outputTextureMaterial);
  outputMesh.frustumCulled = false;
  outputMesh.visible = false;
  outputObject3d.add(outputMesh);

  const quad = new THREE.Mesh(planeGeometry, colorMaterial);
  quad.frustumCulled = false;
  scene.add(quad);

  const shaderEmitter = createShader(glslify('./shaders/emitters.frag'), {
    lifetime: { type: 'f', value: lifetime }
  });
  const shaderMove = createShader(glslify('./shaders/move.frag'), {
    mouseRadius: { type: 'f', value: mouseRadius },
    movementScale: { type: 'f', value: movementScale },
    forceVelocity: { type: 'v2', value: new THREE.Vector2() },
    forcePosition: { type: 'v2', value: new THREE.Vector2() }
  });
  const shaderAdvection = createShader(glslify('./shaders/advection.frag'), {
    ripple: { type: 'f', value: ripple }
  });
  const shaderDivergence = createShader(glslify('./shaders/divergence.frag'));
  const shaderJacobi = createShader(glslify('./shaders/jacobi.frag'));
  const shaderOutput = createShader(glslify('./shaders/render.frag'), {
    paletteMap: { type: 't', value: paletteTexture }
  });

  const heroTexture = new THREE.TextureLoader().load('assets/pattern/p4.jpg', () => {
    loaded = true;
    outputMesh.visible = true;
  });
  heroTexture.generateMipmaps = false;
  heroTexture.magFilter = THREE.NearestFilter;
  heroTexture.minFilter = THREE.NearestFilter;

  const buffer0 = createTarget();
  const buffer1 = createTarget();
  let currentInput = buffer0;
  let currentOutput = buffer1;
  const black = new THREE.Color(0, 0, 0);
  clearBuffers();
  let needsEmit = true;

  return {
    object3d: outputObject3d,
    render,
    addForce
  };

  function render () {
    if (!loaded) return;

    if (forces.length > 0) {
      forces.forEach(ev => {
        shaderMove.uniforms.forceVelocity.value.fromArray(ev.velocity);
        shaderMove.uniforms.forcePosition.value.fromArray(ev.position);
        shaderMove.uniforms.forceVelocity.value.clampScalar(-maxVelocity, maxVelocity);
        blit(shaderMove);
      });
      forces.length = 0;
    }

    if (alwaysEmit || needsEmit) {
      blit(shaderEmitter);
      needsEmit = false;
    }
    blit(shaderAdvection);
    for (var i = 0; i < iterations; i++) {
      blit(shaderJacobi);
    }
    blit(shaderDivergence);
    blit(shaderOutput, false);

    outputTextureMaterial.uniforms.map.value = currentOutput.texture;
  }

  function blit (shader, isFlip = true) {
    quad.material = shader;
    quad.material.uniforms.map.value = currentInput.texture;
    quad.material.uniforms.heroMap.value = heroTexture;
    quad.material.uniforms.heroDimension.value.set(heroTexture.image.width, heroTexture.image.height);
    renderer.render(scene, camera, currentOutput, false);
    if (isFlip) flipBuffers();
  }

  function flipBuffers () {
    if (currentInput === buffer0) {
      currentInput = buffer1;
      currentOutput = buffer0;
    } else {
      currentInput = buffer0;
      currentOutput = buffer1;
    }
  }

  function clearBuffers () {
    const oldColor = renderer.getClearColor();
    const oldAlpha = renderer.getClearAlpha();
    renderer.setClearColor(black, 0);
    renderer.clearTarget(buffer0);
    renderer.clearTarget(buffer1);
    renderer.setClearColor(oldColor, oldAlpha);
    needsEmit = true;
    currentInput = buffer0;
    currentOutput = buffer1;
  }

  function createTarget () {
    const target = new THREE.WebGLRenderTarget(resolution, resolution);
    target.texture.minFilter = THREE.NearestFilter;
    target.texture.magFilter = THREE.NearestFilter;
    target.texture.generateMipmaps = false;
    target.texture.format = THREE.RGBAFormat;
    target.texture.type = THREE.FloatType;
    return target;
  }

  function createShader (fragmentShader, uniforms) {
    const material = new THREE.RawShaderMaterial({
      vertexShader: basicVertexShader,
      fragmentShader,
      uniforms: assign({
        heroDimension: { type: 'v2', value: new THREE.Vector2() },
        heroMap: { type: 't', value: new THREE.Texture() },
        map: { type: 't', value: new THREE.Texture() },
        resolution: { type: 'f', value: resolution }
      }, uniforms)
    });
    shaderMaterials.push(material);
    return material;
  }

  function addForce (position, velocity) {
    forces.push({
      position, velocity
    });
  }
};
