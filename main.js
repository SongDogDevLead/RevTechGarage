
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



//cache version
 const CACHE_NAME = 'v1'

//Camera settings
const cameraPositions = {
  home: {
    perspective: 75,
    lookAt: new THREE.Vector3(30, 5, -0.35), 
    position: new THREE.Vector3( -0.5, 1, -0.35), 
    duration: 3.5,
  },
  dash:{
    perspective: 30,
    lookAt: new THREE.Vector3(30, -5, -.25), 
    position: new THREE.Vector3( 0.05, 0.9, -0.375 ), 
    duration: 3.5,
  },
  laptop: {
    perspective: 35,
    lookAt: new THREE.Vector3(0, -75, 100), 
    position: new THREE.Vector3( 0, 1, 0 ), 
    duration: 4,
  },
  visor: {
    perspective: 65,
    lookAt: new THREE.Vector3(20, 22.5, -3.5),
    position: new THREE.Vector3(-0.1, 1.0, -0.35), 
    duration: 3.25,
  },
  windHUD: {
    perspective: 65,
    lookAt: new THREE.Vector3(30, 5, -.25), 
    position: new THREE.Vector3( 0.05, 1.05, -0.35), 
    duration: 3.25,
  },
  manual: {
    perspective: 35,
    lookAt: new THREE.Vector3(10, -10, 10), 
    position: new THREE.Vector3( 0, 1, 0 ), 
    duration: 3.4,
  },
  phone: {
    perspective: 65,
    lookAt: new THREE.Vector3(10, -8, 10), 
    position: new THREE.Vector3(-0.4, 1, -0.35), 
    duration: 2.5,
  },
  navScreen: {
    perspective: 35,
    lookAt: new THREE.Vector3(30, -1, -1), 
    position: new THREE.Vector3( 0.03, 0.9, 0 ), 
    duration: 3.375,
  },
}

// Scene and Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set( -.5, 1.0, -0.35);
camera.lookAt(cameraPositions.home.lookAt);


//Intro
window.addEventListener('load', startIntro)

function startIntro(){
  setTimeout(animateIntro, 10000);
}

function animateIntro() {
  gsap.to(camera.position, {
    duration: 4.5,
    x: cameraPositions.dash.position.x,
    y: cameraPositions.dash.position.y,
    z: cameraPositions.dash.position.z,

    onUpdate: () => camera.lookAt(cameraPositions.home.lookAt) 
  });

  gsap.to(cameraPositions.home.lookAt, {
    duration: 4.5,
    x: cameraPositions.dash.lookAt.x,
    y: cameraPositions.dash.lookAt.y,
    z: cameraPositions.dash.lookAt.z,
   
    onUpdate: () => camera.lookAt(cameraPositions.home.lookAt) 
  });

  gsap.to(camera, {
      fov: cameraPositions.dash.perspective,
      duration: 4.5,
      onUpdate: () => camera.updateProjectionMatrix()
    });
}

//Camera animation handling
document.addEventListener('click', handleClick);
const dashCopy = Object.assign({}, cameraPositions.dash);
let camStartLook = dashCopy.lookAt;
let camStartDuration = dashCopy.duration;

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

function animateCamera(config) {
  goToHome(config, () => goToDest(config)); 
}


function goToHome(config, onComplete){
  const currentCamTarget = camStartLook.clone();
  const animTime = camStartDuration;

  gsap.to(camera.position, {
    duration: animTime,
    x: cameraPositions.home.position.x,
    y: cameraPositions.home.position.y,
    z: cameraPositions.home.position.z,
    onComplete: onComplete,
    onUpdate: () => camera.lookAt(currentCamTarget) 
  });

  gsap.to(currentCamTarget, {
    duration: animTime,
    x: cameraPositions.home.lookAt.x,
    y: cameraPositions.home.lookAt.y,
    z: cameraPositions.home.lookAt.z,
    onUpdate: () => camera.lookAt(currentCamTarget)
  });

    gsap.to(camera, {
      fov: cameraPositions.home.perspective,
      duration: animTime,
      onUpdate: () => camera.updateProjectionMatrix()
    });

    camStartLook = cameraPositions.home.lookAt.clone();
    
}

function goToDest(config){ 
  const currentCamTarget = camStartLook.clone();

  gsap.to(camera.position, {
  duration: config.duration,
  x: config.position.x,
  y: config.position.y,
  z: config.position.z,
 
  onUpdate: () => camera.lookAt(currentCamTarget) 
});

  gsap.to(currentCamTarget, {
    duration: config.duration,
    x: config.lookAt.x,
    y: config.lookAt.y,
    z: config.lookAt.z,
   
    onUpdate: () => camera.lookAt(currentCamTarget)
  });

  gsap.to(camera, {
    fov: config.perspective,
    duration: config.duration,
    onUpdate: () => camera.updateProjectionMatrix()
  });

camStartLook = config.lookAt.clone();
camStartDuration = config.duration;

};

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

// // Helpers (Optional)
// const gridHelper = new THREE.GridHelper(200, 50);
// const lightHelper = new THREE.PointLightHelper(pointLight)
// scene.add(lightHelper, gridHelper);

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

