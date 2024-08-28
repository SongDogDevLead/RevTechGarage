
import './style.css'

import * as THREE from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';


// Scene and Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
const dashPosition = new THREE.Vector3(30, -5, -.25); 
// camera.position.set( 0.05, 0.9, -0.375 ); 
camera.position.set( 0,1,0)


// Renderer
const renderer = new THREE.WebGLRenderer({antialias: true,});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Environment (exr)
const exrLoader = new EXRLoader();
exrLoader.load('./assets/images/bg.exr', function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
  scene.background = texture;
});

// Load Model
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

loader.load('./assets/images/blackSupraComp2.glb', function (gltf) {
  const supra = gltf.scene;
 
  supra.traverse(function (node) {
    if (node.isMesh) {
      node.castShadow = true;    // Allow objects to cast shadows
      node.receiveShadow = true; // Allow objects to receive shadows
    }
  });

  supra.position.set(0, 0, 0); 
  supra.scale.set(1, 1, 1); 
  supra.rotation.set(0, Math.PI / 2, 0);
  scene.add(supra);

  // Adjust camera position and lookAt() 
  // camera.lookAt(dashPosition); 
  camera.lookAt(90,0,0)
  
 
});

// Lights
const pointLight = new THREE.PointLight(0xffffff, 12);
pointLight.position.set( 0, 1, -0.375 ); // Position the light
pointLight.castShadow = true;
pointLight.shadow.mapSize.width = 1;
pointLight.shadow.mapSize.height = 1;
pointLight.shadow.radius = 100;
scene.add(pointLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 7.5)
scene.add(ambientLight)

// Helpers (Optional)
const gridHelper = new THREE.GridHelper(200, 50);
const lightHelper = new THREE.PointLightHelper(pointLight)
scene.add(lightHelper, gridHelper);

// Resize Listener
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// Animate and Render Loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);  
}

animate();