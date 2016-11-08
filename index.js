global.THREE = require('three');

const createPlaneGeometry = require('./lib/createPlaneGeometry');
const createLoop = require('raf-loop');
const createFluidCanvas = require('./lib/createFluidCanvas');
const mouseEventOffset = require('mouse-event-offset');
const Velocity = require('touch-velocity');
const css = require('dom-css');
const randomSphere = require('gl-vec2/random');
const randomFloat = require('random-float');

start();
function start () {
  const width = 256;
  const height = 256;
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true
  });
  renderer.sortObjects = false;
  renderer.autoClear = false;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  const background = '#fff';
  document.body.appendChild(renderer.domElement);
  css(renderer.domElement, {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    margin: 'auto'
  });
  css(document.body, {
    overflow: 'hidden',
    background,
    margin: 0
  });

  renderer.setClearColor(new THREE.Color(background), 1);
  renderer.clear();

  const camera = new THREE.OrthographicCamera(0, width, 0, height, -100, 100);
  const scene = new THREE.Scene();

  // const planeGeometry = createPlaneGeometry();
  // const planeMaterial = new THREE.MeshBasicMaterial({
  //   color: 'red',
  //   side: THREE.DoubleSide
  // });
  // const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
  // planeMesh.scale.set(width, height, 1);
  // scene.add(planeMesh);

  const fluid = createFluidCanvas(renderer, {
    resolution: 512
  });
  scene.add(fluid.object3d);
  setupInput();

  createLoop(render).start();

  function render () {
    fluid.render();
    renderer.render(scene, camera);
  }

  function setupInput () {
    const xVelocity = new Velocity();
    const yVelocity = new Velocity();
    const position = [ 0, 0 ];
    const velocity = [ 0, 0 ];

    document.body.addEventListener('mousemove', function (ev) {
      xVelocity.updatePosition(ev.clientX);
      yVelocity.updatePosition(ev.clientY);

      velocity[0] = xVelocity.getVelocity() / width;
      velocity[1] = yVelocity.getVelocity() / height;
      mouseEventOffset(ev, renderer.domElement, position);
      position[0] /= width;
      position[1] /= height;
      if (velocity.some(x => isNaN(x))) {
        return;
      }
      fluid.addForce(position, velocity);
    });
  }
}
