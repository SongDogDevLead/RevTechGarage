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
 const CACHE_NAME = 'v3'

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
  tablet: {
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

const secondaryModels = {
  phone: {
    path: './assets/images/phoneV2Comp.glb', 
    position: [0, 0, 0], 
    scale: [1, 1, 1], 
    rotation: [0, 0, 0],
    newPosition: [0, 0, 0],
    newRotation: [0, 0, 0],
    duration: 2.5
  },
  manual: {
    path: './assets/images/manualComp.glb', 
    position: [0, 0, 0], 
    scale: [1, 1, 1], 
    rotation: [0, 0, 0],
    newPosition: [0, 0, 0],
    newRotation: [0, 0, 0],
    duration: 3.4,
  },
  tablet: {
    newPosition: [0, 0, 0],
    newRotation: [0, 0, 0],
    duration: 4,
  }
}


// Scene and Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set( -.5, 1.0, -0.35);
camera.lookAt(cameraPositions.home.lookAt);

const globalClippingPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0.75);



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
  const targetValues = target.dataset.target;

  if (cameraPositions[targetValues]) {
    animateCamera(cameraPositions[targetValues], targetValues);
  }
  else {   
    console.log('No matching camera position for this element');
  }

function animateCamera(config, targetValues) {
  goToHome(config, () => {
    goToDest(config); 

    if (secondaryModels[targetValues]) {
      handleSecondaryModel(targetValues);
    }
  });
};

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
}

function handleSecondaryModel(targetValues) {
  const modelConfig = secondaryModels[targetValues];
  if (!modelConfig) {
    console.error('No config found for key: ${targetValues}');
    return;
  }

  let model = scene.getObjectByName(targetValues);

  if (!model) {
    loader.load(modelConfig.path, function (gltf) {
      const loadedModel = gltf.scene;
  
        loadedModel.traverse(function (node) {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });
    
        loadedModel.position.set(modelConfig.position);
        loadedModel.scale.set(modelConfig.scale);
        loadedModel.rotation.set(modelConfig.rotation);
        scene.add(loadedModel);

        animateSecondaryModel(model, modelConfig);
    });
  }
  else {animateSecondaryModel(model, modelConfig);
  }
}

function animateSecondaryModel(model, modelConfig) {
  gsap.to(model.position, {
    duration: modelConfig.duration || 2,
    x: modelConfig.newPosition.x,
    y:modelConfig.newPosition.y,
    z:modelConfig.newPosition.z,
  });

  gsap.to(model.rotation, {
    duration: modelConfig.duration || 2,
    x: THREE.Math.degToRad(modelConfig.newRotation[0]),
  y: THREE.Math.degToRad(modelConfig.newRotation[1]),
  z: THREE.Math.degToRad(modelConfig.newRotation[2]),
  });
}

};

// Renderer
const renderer = new THREE.WebGLRenderer({antialias: true,});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.clippingPlanes = [globalClippingPlane];

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

// Load the 3D models
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

const models = [
  { path: './assets/images/blackSupraComp2.glb', 
    position: [0, 0, 0], 
    scale: [1, 1, 1], 
    rotation: [0, Math.PI / 2, 0]},
  { path: './assets/images/tabletV2Comp.glb',
    position: [0.05, .4, 0.375],
    scale: [.85, .85, .85],
    rotation: [THREE.MathUtils.degToRad(50), THREE.MathUtils.degToRad(150), THREE.MathUtils.degToRad(8)]
  },
]

models.forEach(model =>{
  loader.load(model.path, function (gltf) {
    const object = gltf.scene;

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

    hideLoadingScreen();

  }, undefined, function (error) {
    console.error('An error occurred while loading the model:', error);
    hideLoadingScreen();
  });
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

