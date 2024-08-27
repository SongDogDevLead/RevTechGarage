
import './style.css'

import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// Scene and Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
const lookY = -3;
const lookZ = -5.63;
const targetPosition = new THREE.Vector3(90, lookY, lookZ); 
camera.position.set(-4, 0, lookZ); 
console.log("Camera initialized:", camera.position, camera.rotation);

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Environment (HDR)
const rgbeLoader = new RGBELoader();
rgbeLoader.load('./assets/images/bg.hdr', function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
  scene.background = texture;
});

// Load Model
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

loader.load('./assets/images/supra-compress.glb', function (gltf) {
  const supra = gltf.scene;
  
  supra.position.set(0, -15, 0); 
  supra.scale.set(15, 15, 15); 
  supra.rotation.set(0, Math.PI / 2, 0);
  scene.add(supra);

  // Adjust camera position and lookAt() based on model's position
  camera.lookAt(targetPosition); // Look at the car model
  console.log("Camera after lookAt:", camera.position, camera.rotation);

}, undefined, function (error) {
  console.error('An error occurred while loading the model:', error);
});

// Lights
const pointLight = new THREE.PointLight(0xffffff, 1000);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Helpers (Optional)
const lightHelper = new THREE.PointLightHelper(pointLight);
const gridHelper = new THREE.GridHelper(200, 50);
scene.add(lightHelper, gridHelper);



// Animate and Render Loop
function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);  // Render scene with the camera
}

animate();

// Log the camera's status for debugging
console.log("Final camera position:", camera.position);
console.log("Final camera rotation:", camera.rotation);
