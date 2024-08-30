
import './style.css'

import * as THREE from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { gsap } from "gsap";

export default {
  build: {
    chunkSizeWarningLimit: 10000, // Increase this number based on your needs
  },
};

//Camera settings
const cameraPositions = {
  home: {
    perspective: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000),
    lookAt: new THREE.Vector3(30, 5, -.25), 
    position: new THREE.Vector3(  -.5, 1.0, -0.35), 
  },
  dash:{
    perspective: new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000),
    lookAt: new THREE.Vector3(30, -5, -.25), 
    position: new THREE.Vector3( 0.05, 0.9, -0.375 ), 
  },
  laptop: {
    perspective: new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000),
    lookAt: new THREE.Vector3(0, 0, 1), 
    position: new THREE.Vector3( 0, 1, 0 ), 
  },
  visor: {
    perspective: new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000),
    lookAt: new THREE.Vector3(2, 2.25, -0.35),
    position: new THREE.Vector3(-.1, 1.0, -0.35), 
  },
  windHUD: {
    perspective: new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000),
    lookAt: new THREE.Vector3(30, 5, -.25), 
    position: new THREE.Vector3( 0.05, 1.05, -0.35), 
  },
  manual: {
    perspective: new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000),
    lookAt: new THREE.Vector3(1, 0, 1), 
    position: new THREE.Vector3( 0, 1, 0 ), 
  },
  phone: {
    perspective: new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000),
    lookAt: new THREE.Vector3(1, -.2, 1), 
    position: new THREE.Vector3(-0.25, 1, -0.35), 
  },
  navScreen: {
    perspective: new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000),
    lookAt: new THREE.Vector3(30, 1, 0), 
    position: new THREE.Vector3( 0.03, 0.9, 0 ), 
  },
}

//Camera animation handling
document.addEventListener('click', handleClick);

function handleClick(event) {
  const target = event.target;
  const targetPosition = target.dataset.target;

  if (cameraPositions[targetPosition]) {
    animateCamera(cameraPositions[targetPosition]);
  }
  else {   
    console.log('No matching camera position for this element');
  }
}

function animateCamera(config ) {
  gsap.to(camera.position, {
    duration: config.target.duration,
    x: config.target.x,
    y: config.target.y,
    z: config.target.z,
    onUpdate: () => camera.lookAt(config.lookAt)
  });

    gsap.to(camera, {
      fov: config.perspective,
      duration: config.duration,
      onUpdate: () => camera.updateProjectionMatrix()
    });
}

// Scene and Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
const targetPosition = new THREE.Vector3(2, 2.25, -0.35); 
camera.position.set(-.1, 1.0, -0.35); 

// Renderer
const renderer = new THREE.WebGLRenderer({antialias: true,});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Function to hide the loading screen
const hideLoadingScreen = () => {
  document.getElementById('loading-screen').style.display = 'none';
};

// Environment (exr)
const exrLoader = new EXRLoader();
exrLoader.load('./assets/images/bg.exr', function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    scene.background = texture;

// Load the 3D model
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

loader.load('./assets/images/blackSupraComp2.glb', function (gltf) {
    const supra = gltf.scene;
 
  supra.traverse(function (node) {
    if (node.isMesh) {
      node.castShadow = true;    
      node.receiveShadow = true; 
    }
  });

 

  supra.position.set(0, 0, 0); 
  supra.scale.set(1, 1, 1); 
  supra.rotation.set(0, Math.PI / 2, 0);
  scene.add(supra);

  hideLoadingScreen();

}, undefined, function (error) {
    console.error('An error occurred while loading the model:', error);
    hideLoadingScreen(); // Hide the loading screen even if there's an error
});

});

  // Adjust camera position and lookAt() 
  camera.lookAt(targetPosition); 
  
 const CACHE_NAME = 'v1'

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

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, err => {
          console.log('ServiceWorker registration failed: ', err);
      });
  });
}

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

