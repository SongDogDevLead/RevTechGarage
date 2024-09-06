import './style.css';

import * as THREE from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { gsap } from "gsap";

export default {
  build: {
    chunkSizeWarningLimit: 10000, // Increase this number based on your needs
  },
};

// Define Loaders
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

// Cache version
const CACHE_NAME = 'v6';

// Camera Settings
const cameraPositions = {
  home: { perspective: 75, lookAt: new THREE.Vector3(20, 100, -37.5), position: new THREE.Vector3(-35, 100, -37.5), duration: 3.5 },
  dash: { perspective: 30, lookAt: new THREE.Vector3(50, 80, -37.5), position: new THREE.Vector3(-1, 91, -37.5), duration: 3.5 },
  tablet: { perspective: 50, lookAt: new THREE.Vector3(-15, 80, 25), position: new THREE.Vector3(-15, 90, -7), duration: 4 },
  visor: { perspective: 65, lookAt: new THREE.Vector3(60, 140, -37.5), position: new THREE.Vector3(-5, 100, -37.5), duration: 3.25 },
  windHUD: { perspective: 60, lookAt: new THREE.Vector3(140, 140, -37.5), position: new THREE.Vector3(5, 100, -37.5), duration: 3.25 },
  manual: { perspective: 50, lookAt: new THREE.Vector3(-15, 80, 20), position: new THREE.Vector3(-15, 90, -7), duration: 3.4 },
  phone: { perspective: 35, lookAt: new THREE.Vector3(3, 90, -5), position: new THREE.Vector3(-20, 98, -25), duration: 2.5 },
  navScreen: { perspective: 35, lookAt: new THREE.Vector3(100, 80, 0), position: new THREE.Vector3(5, 90, 0), duration: 3.375 },
};

// Secondary Models Configuration
const secondaryModels = {
  phone: { path: './assets/models/phoneV2Comp.glb', name: 'phone', duration: 2.5, position: new THREE.Vector3(0, 0, 0), scale: [100, 100, 100], rotation: new THREE.Vector3(0, 0, 0), newPosition: new THREE.Vector3(3.4, 80, -5), newRotation: new THREE.Vector3(0, 50, 0) },
  manual: { path: './assets/models/manualCompv2.glb', name: 'manual', duration: 0, position: new THREE.Vector3(-12, 80, 20), scale: [1, 1, 1], rotation: new THREE.Vector3(-50, 183, -5), newPosition: new THREE.Vector3(-12, 80, 20), newRotation: new THREE.Vector3(-50, 183, -5) },
  tablet: { path: './assets/models/tabletV2Comp.glb', name: 'tablet', duration: 4, scale: [80, 80, 80], position: new THREE.Vector3(0, 40, 40), rotation: new THREE.Vector3(0, 0, 0), newPosition: new THREE.Vector3(-8, 80, 25), newRotation: new THREE.Vector3(-80, 90, 0) },
};

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Scene and Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
initializeCamera();

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.enabled = false;
controls.update();

function initializeCamera() {
  camera.position.set(cameraPositions.home.position.x, cameraPositions.home.position.y, cameraPositions.home.position.z);
  camera.lookAt(cameraPositions.home.lookAt.x, cameraPositions.home.lookAt.y, cameraPositions.home.lookAt.z);
  camera.updateMatrixWorld();
  camera.updateProjectionMatrix();
  controls.update();
}

let mixers = {};
let actions = {};

// Model Loading and Animation Setup
const models = [
  { path: './assets/models/blackSupraCompv3.glb', name: 'supra', position: [0, 0, 0], scale: [100, 100, 100], rotation: [0, Math.PI / 2, 0] },
  { path: secondaryModels.manual.path, name: secondaryModels.manual.name, position: [secondaryModels.manual.position.x, secondaryModels.manual.position.y, secondaryModels.manual.position.z], scale: [secondaryModels.manual.scale[0], secondaryModels.manual.scale[1], secondaryModels.manual.scale[2]], rotation: [THREE.MathUtils.degToRad(secondaryModels.manual.rotation.x), THREE.MathUtils.degToRad(secondaryModels.manual.rotation.y), THREE.MathUtils.degToRad(secondaryModels.manual.rotation.z)] },
];

models.forEach(model => {
  loader.load(model.path + '?v=' + Date.now(), function (gltf) {
    const object = gltf.scene;
    object.name = model.name;
    object.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });

    object.position.set(...model.position);
    object.scale.set(...model.scale);
    object.rotation.set(...model.rotation);
    scene.add(object);

    if (gltf.animations && gltf.animations.length) {
      mixers[model.name] = new THREE.AnimationMixer(object);
      actions[model.name] = {};
      gltf.animations.forEach((clip, index) => {
        const action = mixers[model.name].clipAction(clip);
        actions[model.name][clip.name || `animation_${index}`] = action;
        console.log(`Loaded animation: ${clip.name || `animation_${index}`} for ${model.name}`);
      });
    }
    checkSceneLoaded();
  }, undefined, function (error) {
    console.error('An error occurred while loading the model:', error);
  });
});

function playAnimation(modelName, animationName) {
    const action = actions[modelName] && actions[modelName][animationName];
    if (action) {
      action.play();
    } else {
      console.error(`Animation ${animationName} not found for model ${modelName}`);
    }
  }
  
  function stopAnimation(modelName, animationName) {
    const action = actions[modelName] && actions[modelName][animationName];
    if (action) {
      action.stop();
    }
  }
  
  function reverseAnimation(modelName, animationName) {
    const action = actions[modelName] && actions[modelName][animationName];
    if (action) {
      action.timeScale = -1;
      action.play();
    }
  }
  
  function goToDest(config, targetModel) {
    gsap.to(camera.position, {
      duration: config.duration,
      x: config.position.x,
      y: config.position.y,
      z: config.position.z,
      onUpdate: () => controls.update(),
    });
  
    gsap.to(controls.target, {
      duration: config.duration,
      x: config.lookAt.x,
      y: config.lookAt.y,
      z: config.lookAt.z,
      onUpdate: () => controls.update(),
    });
  
    gsap.to(camera, {
      fov: config.perspective,
      duration: config.duration,
      onUpdate: () => camera.updateProjectionMatrix(),
    });
  
    if (targetModel === 'manual') {
      playAnimation('supra', 'OpenGlovebox');
      playAnimation('manual', 'OpenBook');
    } else if (targetModel === 'visor') {
      playAnimation('supra', 'OpenVisor');
    }
  }
  
  function goToHome(config, targetModel) {
    gsap.to(camera.position, {
      duration: config.duration,
      x: cameraPositions.home.position.x,
      y: cameraPositions.home.position.y,
      z: cameraPositions.home.position.z,
      onUpdate: () => controls.update(),
    });
  
    gsap.to(controls.target, {
      duration: config.duration,
      x: cameraPositions.home.lookAt.x,
      y: cameraPositions.home.lookAt.y,
      z: cameraPositions.home.lookAt.z,
      onUpdate: () => controls.update(),
    });
  
    if (targetModel === 'manual') {
      stopAnimation('supra', 'OpenGlovebox');
      stopAnimation('manual', 'OpenBook');
    } else if (targetModel === 'visor') {
      stopAnimation('supra', 'OpenVisor');
    }
  }
  
  // Environment (exr)
const exrLoader = new EXRLoader();
exrLoader.load('./assets/images/bg.exr', function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
  scene.background = texture;
  checkSceneLoaded();
});

// Lights
const pointLight = new THREE.PointLight(0xffffff, 8);
pointLight.position.set(0, 1, -0.375);
pointLight.castShadow = true;
pointLight.shadow.mapSize.width = 1;
pointLight.shadow.mapSize.height = 1;
pointLight.shadow.radius = 100;
scene.add(pointLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 10);
scene.add(ambientLight);

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

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, err => {
        console.log('ServiceWorker registration failed: ', err);
      });
    });
  }
  