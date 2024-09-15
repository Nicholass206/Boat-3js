import * as THREE from 'three';
import GUI from 'lil-gui';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { Water } from 'three/examples/jsm/objects/Water';
import { Sky } from 'three/examples/jsm/objects/Sky';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Boat } from './boat';
import "./style.css"

var b = new Boat();
const canvas = document.querySelector('.webgl');

// Scene
const scene = new THREE.Scene();

// Red cube
const geometry = new THREE.BoxGeometry(1, 1, 1, 5, 5, 5);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const myCube = new THREE.Mesh(geometry, material);
scene.add(myCube);

const customControls ={
  enginePower : b.power,
  boatAngleOfMovement:b.nicola,
  mass:b.mass,
  length:b.L,
  height:b.H,
  width:b.W,
  efficiency:b.efficiency,
}

const gui = new GUI();

gui.add(customControls,'enginePower',0,1000).name('Engine Power').onChange((value)=>{
  b.power =value
});
gui.add(customControls,'boatAngleOfMovement',0,360).name('Boat Direction').onChange((value)=>
  {b.nicola=value})
gui.add(customControls,'mass',1,500).name('Mass').onChange((value)=>{
  b.mass=value})

gui.add(customControls,'efficiency',0.3,3).name('Efficiency').onChange((value)=>{b.efficiency=value})

// gui.add(customControls,'length',0,200).name('Boat Length').onChange((value)=>b.L=value)
// gui.add(customControls,'height',0,200).name('Boat Height').onChange((value)=>b.H=value)
// gui.add(customControls,'width',0,200).name('Boat Width').onChange((value)=>b.W=value)

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

// Camera




const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 10;
camera.position.y = 5;
camera.position.x = 0;
// camera.lookAt(myCube.position);
scene.add(camera);
const controls = new OrbitControls(camera,canvas)
controls.enableDamping=true;
controls.target=myCube.position;
controls.minDistance=5;
controls.maxDistance=15;

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);

let my3Dmodel;

const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);


// Instantiate MTLLoader and OBJLoader
// const mtlLoader = new MTLLoader();
// const objLoader = new OBJLoader();

// // Load the material file (.mtl)
// mtlLoader.load('3dModel/boat.mtl', function(materials) {
//   materials.preload(); // Preload the materials

//   // Set the materials on the OBJLoader
//   objLoader.setMaterials(materials);

//   // Load the OBJ file with the materials
//   objLoader.load(
//     '3dModel/boat.obj', // Path to your OBJ file
//     function(object) {
//       my3Dmodel = object;
//       let sc = 0.02;
//       my3Dmodel.scale.set(sc, sc, sc);
//       my3Dmodel.position.set(0, 0, 0);
//       my3Dmodel.rotation.y=(+Math.PI/2)
//       scene.add(my3Dmodel);
//     },
//     undefined,
//     function(error) {
//       console.error('An error occurred loading the 3D model:', error);
//     }
//   );
// }, function(xhr) {
//   console.log((xhr.loaded / xhr.total * 100) + '% loaded');
// }, function(error) {
//   console.error('An error occurred loading the material file:', error);
// });



// Water
const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
const waterNormals = new THREE.TextureLoader().load(
  'waternormal.jpg',


  function (texture) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    console.log('Texture loaded:', texture);
  },
  undefined,
  function (err) {
    console.error('An error happened loading the texture.', err);
  }
);

const water = new Water(
  waterGeometry,
  {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: waterNormals,
    alpha: 1.0,
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    distortionScale: 3.7,
    fog: scene.fog !== undefined
  }
);
water.rotation.x = -Math.PI / 2;
scene.add(water);

// Sky
const sky = new Sky();
sky.scale.setScalar(10000);
scene.add(sky);

const skyUniforms = sky.material.uniforms;
skyUniforms['turbidity'].value = 3;
skyUniforms['rayleigh'].value = 2;
skyUniforms['mieCoefficient'].value = 0.005;
skyUniforms['mieDirectionalG'].value = 0.8;

const parameters = {
  elevation: 2,
  azimuth: 180
};

const pmremGenerator = new THREE.PMREMGenerator(renderer);
let sun = new THREE.Vector3();

function updateSun() {
  const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
  const theta = THREE.MathUtils.degToRad(parameters.azimuth);

  sun.setFromSphericalCoords(1, phi, theta);

  sky.material.uniforms['sunPosition'].value.copy(sun);
  water.material.uniforms['sunDirection'].value.copy(sun).normalize();

  scene.environment = pmremGenerator.fromScene(sky).texture;
}

updateSun();

// Animation
const tick = () => {
  // Update boat position
  b.calc();
  myCube.position.x = b.position.x;
  myCube.position.y = b.position.y;
  myCube.position.z = b.position.z;

  
  // controls.target.copy(myCube.position);
  // controls.update(); 
  // Update water
  water.material.uniforms['time'].value += 1.0 / 60.0;

  // Render
  renderer.render(scene, camera);

  // Request next frame
  window.requestAnimationFrame(tick);
};

tick();
