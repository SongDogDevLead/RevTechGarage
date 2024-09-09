import './style.css'

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

//Define Loaders

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

//cache version
 const CACHE_NAME = 'v6'

//Camera settingsc
const cameraPositions = {
  home: {
    perspective: 75,
    lookAt: new THREE.Vector3(20, 100, -37.5), 
    position: new THREE.Vector3(-35, 100, -37.5), 
    duration: 3.5,
  },
  dash:{
    perspective: 30,
    lookAt: new THREE.Vector3(50, 80, -37.5), 
    position: new THREE.Vector3( -1, 91, -37.5), 
    duration: 3.5,
  },
  tablet: {
    perspective: 50,
    lookAt: new THREE.Vector3(-15, 80, 25), 
    position: new THREE.Vector3( -15, 90, -7), 
    duration: 4,
  },
  visor: {
    perspective: 65,
    lookAt: new THREE.Vector3(60, 140, -37.5), 
    position: new THREE.Vector3( -5, 100, -37.5),
    duration: 3.25,
  },
  windHUD: {
    perspective: 60,
    lookAt: new THREE.Vector3(140, 140, -37.5), 
    position: new THREE.Vector3( 5, 100, -37.5),
    duration: 3.25,
  },
  phone: {
    perspective: 35,
    lookAt: new THREE.Vector3(3, 90, -5), 
    position: new THREE.Vector3(-20, 98, -25), 
    duration: 2.5,
  },
  navScreen: {
    perspective: 35,
    lookAt: new THREE.Vector3(100, 80, 0), 
    position: new THREE.Vector3( 5, 90, 0 ), 
    duration: 3.375,
  },
}

let tempPosVar = new THREE.Vector3(50, 52.5, 45);

const secondaryModels = {
  phone: {
    path: './assets/models/phoneV2Comp.glb', 
    name: 'phone', 
    duration: 1,
    position: new THREE.Vector3(50, 52, 48), 
    scale: [100, 100, 100], 
    rotation: new THREE.Vector3(0, 0, 0),
    newPosition: new THREE.Vector3(3.4, 80, -5),
    newRotation: new THREE.Vector3( 0, 50, 0),
    delay: 0
  },
  tablet: {
    path: './assets/models/tabletV2Comp.glb',
    name: 'tablet',
    duration: 4,
    scale: [80, 80, 80],
    position: new THREE.Vector3(0, 40, 40),
    rotation: new THREE.Vector3(0, 0, 0),
    newPosition: new THREE.Vector3(-8, 80, 25),
    newRotation: new THREE.Vector3( -80, 90, 0),
    delay: 0
  }
}

const globalClippingPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 75);

// Renderer
const renderer = new THREE.WebGLRenderer({antialias: true,});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.clippingPlanes = [globalClippingPlane];

// Scene and Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 5000);
let controls;
initializeCamera();

function initializeCamera() {
  camera.position.set(
    cameraPositions.home.position.x, 
    cameraPositions.home.position.y, 
    cameraPositions.home.position.z
  );
  camera.lookAt(
    cameraPositions.home.lookAt.x, 
    cameraPositions.home.lookAt.y, 
    cameraPositions.home.lookAt.z
  );
  camera.updateMatrixWorld();
  camera.updateProjectionMatrix();
  
  // Orbit Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.screenSpacePanning = false;
  controls.enabled = false;
  controls.update();
}

let mixers = {};
let actions = {};

// Model Loading and Animation Setup
const models = [
  { path: './assets/models/blackSupraCompv3.glb', 
    name: 'supra', 
    position: [0, 0, 0], 
    scale: [100, 100, 100], 
    rotation: [0, Math.PI / 2, 0] 
  },
  {  path: secondaryModels.tablet.path,
    name: secondaryModels.tablet.name,
    position: [
      secondaryModels.tablet.position.x, 
      secondaryModels.tablet.position.y, 
      secondaryModels.tablet.position.z
    ], 
    scale: [
      secondaryModels.tablet.scale[0], 
      secondaryModels.tablet.scale[1], 
      secondaryModels.tablet.scale[2]
    ],
    rotation: [
      THREE.MathUtils.degToRad(secondaryModels.tablet.rotation.x), 
      THREE.MathUtils.degToRad(secondaryModels.tablet.rotation.y), 
      THREE.MathUtils.degToRad(secondaryModels.tablet.rotation.z),
    ]
  },
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

//Intro
function checkSceneLoaded() {
  if (scene.getObjectByName('bg') && 
      scene.getObjectByName('tablet') && 
      scene.getObjectByName('supra')) {
      hideLoadingScreen(); 
  }
}

function hideLoadingScreen() {
  
  initializeCamera();  

  gsap.to(controls.target, {
    x: cameraPositions.home.lookAt.x, 
    y: cameraPositions.home.lookAt.y, 
    z: cameraPositions.home.lookAt.z,
    duration: 0,
    onUpdate: () => controls.update(),  
  });
  setTimeout(() => {
    document.getElementById('loading-screen').style.display = 'none';
    startIntro(); 
  }, 1500); 
}

function startIntro() {
  gsap.to(controls.target, {
    x: cameraPositions.dash.lookAt.x, 
    y: cameraPositions.dash.lookAt.y, 
    z: cameraPositions.dash.lookAt.z,
    duration: cameraPositions.dash.duration,
    onUpdate: () => controls.update(),  
  })

  gsap.to(camera.position, {
    x: cameraPositions.dash.position.x, 
    y: cameraPositions.dash.position.y, 
    z: cameraPositions.dash.position.z, 
    duration: cameraPositions.dash.duration,
    onUpdate: () => controls.update()},  
    `-=${cameraPositions.dash.duration }`
  );

  gsap.to(camera, {
    fov: cameraPositions.dash.perspective,
    duration: 4.5,
    onUpdate: () => camera.updateProjectionMatrix()},
    `-=${cameraPositions.dash.duration }`
  );
}

//Camera animation handling
document.addEventListener('click', handleClick);
const dashCopy = Object.assign({}, cameraPositions.dash);
let camStartDuration = dashCopy.duration;
let lastTargetValues = ''

function handleClick(event) {
  const target = event.target;
  const targetValues = target.dataset.target;

  if (cameraPositions[targetValues]) {
    animateCamera(cameraPositions[targetValues], targetValues);
  }
  else {   
    console.log('No matching camera position for this element');
  }
}
async function animateCamera(config, targetValues) {
  await goToHome(config, targetValues); 
  
    await goToDest(config, targetValues); // Use arrow function to ensure proper timing
}
    
function playAnimation(modelName, animationName) {
  const action = actions[modelName] && actions[modelName][animationName];
  if (action) {
    action.timeScale = 1; 
    action.reset();
    action.play();
    action.setLoop(THREE.LoopOnce); 
    action.clampWhenFinished = true;
  } else {
    console.error(`Animation ${animationName} not found for model ${modelName}`);
  }
}

function reverseAnimation(modelName, animationName) {
  const action = actions[modelName] && actions[modelName][animationName];
  if (action) {
    action.timeScale = -1; 
    action.play();
    action.setLoop(THREE.LoopOnce);  // Play only once
    action.clampWhenFinished = true;
    action.paused = false;
  } 
  else {
    console.error(`Animation ${animationName} not found for model ${modelName}`);
  }
}

  
  function goToHome(config, targetValuesIn) {
    const animTime = camStartDuration;
  
    return new Promise((resolve) => {
      gsap.to(camera.position, {
        duration: animTime,
        x: cameraPositions.home.position.x,
        y: cameraPositions.home.position.y,
        z: cameraPositions.home.position.z,
        onComplete: resolve,  
        onUpdate: () => controls.update(),  
      });
  
      gsap.to(controls.target, {
        duration: animTime,
        x: cameraPositions.home.lookAt.x,
        y: cameraPositions.home.lookAt.y,
        z: cameraPositions.home.lookAt.z,
        onUpdate: () => controls.update(),  
      });
  
      gsap.to(camera, {
        fov: cameraPositions.home.perspective,
        duration: animTime,
        onUpdate: () => camera.updateProjectionMatrix(), 
      });
  
      if (scene.getObjectByName('phone')) {
        reverseSecondaryModel('phone');
      }
      if (scene.getObjectByName('tablet')) {
        reverseSecondaryModel('tablet');
      }
      if (lastTargetValues === 'visor') {
      reverseAnimation('supra', 'visor');
      }
      else {
        console.log(`nope its this: ${lastTargetValues}`)
      }
  });
} 
function goToDest(config, targetValues) {
  return new Promise((resolve) => {
    gsap.to(camera.position, {
      duration: config.duration,
      x: config.position.x,
      y: config.position.y,
      z: config.position.z,
      onComplete: resolve,  
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

    
    if (secondaryModels[targetValues]) {
      handleSecondaryModel(targetValues);
    }
    else if (targetValues === 'visor') {
      gsap.delayedCall(0.5, () => {
        playAnimation('supra', 'visor');
    })
  }
   lastTargetValues = targetValues
    console.log(`and lastTargetValues gives ${lastTargetValues}`)
  });
}
  
  

function handleSecondaryModel(targetValues) {
  const modelConfig = secondaryModels[targetValues];
  if (!modelConfig) {
    console.error(`No config found for key: ${targetValues}`);
    return Promise.resolve(); 
  }

  
  let model = scene.getObjectByName(modelConfig.name);

  if (model) {
    
    animateSecondaryModel(model, modelConfig);
    return Promise.resolve();
  } 
  else {
    return new Promise((resolve, reject) => {
      loader.load(modelConfig.path + '?v=' + Date.now(), function (gltf) {
        const loadedModel = gltf.scene;
        loadedModel.name = modelConfig.name;

        loadedModel.traverse(function (node) {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });

        loadedModel.position.set(
          modelConfig.position.x, 
          modelConfig.position.y, 
          modelConfig.position.z
        );
        loadedModel.rotation.set(
          modelConfig.rotation.x, 
          modelConfig.rotation.y, 
          modelConfig.rotation.z
        );
        loadedModel.quaternion.setFromEuler(loadedModel.rotation);
        loadedModel.scale.set(
          modelConfig.scale[0], 
          modelConfig.scale[1], 
          modelConfig.scale[2]
        );

        
        
        scene.add(loadedModel);
        
        if (gltf.animations && gltf.animations.length) {
          mixers[loadedModel.name] = new THREE.AnimationMixer(loadedModel);
          actions[loadedModel.name] = {};

          gltf.animations.forEach((clip, index) => {
            const action = mixers[loadedModel.name].clipAction(clip);
            actions[loadedModel.name][clip.name || `animation_${index}`] = action;
            console.log(`Loaded animation: ${clip.name || `animation_${index}`} for ${loadedModel.name}`);
          });
        }
        
        animateSecondaryModel(loadedModel, modelConfig);

        resolve();
      }, undefined, (error) => {
        console.error(`Error loading model: ${error}`);
        reject(error);
      });
    });
  }
}

function animateSecondaryModel(loadedModel, modelConfig) {  
    
  gsap.to(loadedModel.position, {
    delay: modelConfig.delay || 0,
    duration: modelConfig.duration || 0,
    x: modelConfig.newPosition.x,
    y: modelConfig.newPosition.y,
    z: modelConfig.newPosition.z,
  });
 
  gsap.to(loadedModel.rotation, {
    duration: modelConfig.duration || 0,
    delay: modelConfig.delay || 0,
    x: THREE.MathUtils.degToRad(modelConfig.newRotation.x),
    y: THREE.MathUtils.degToRad(modelConfig.newRotation.y),
    z: THREE.MathUtils.degToRad(modelConfig.newRotation.z),
  });
  console.log('Position:', loadedModel.position);
  console.log('Rotation:', loadedModel.rotation);
};

function reverseSecondaryModel(targetValues) {
  const modelConfig = secondaryModels[targetValues];
  const model = scene.getObjectByName(modelConfig.name);

  if (model) {
  
    gsap.to(model.position, {
     duration: modelConfig.duration || 2,
      x: modelConfig.position.x,
      y: modelConfig.position.y,
      z: modelConfig.position.z,
      onComplete: () => {
        if (targetValues !== 'tablet') { 
          scene.remove(model);
        }
      },
    });
 
    gsap.to(model.rotation, {
      duration: modelConfig.duration || 2,
      x: THREE.MathUtils.degToRad(modelConfig.rotation.x),
      y: THREE.MathUtils.degToRad(modelConfig.rotation.y),
      z: THREE.MathUtils.degToRad(modelConfig.rotation.z),
    });
  }
};

  // Environment (exr)
const exrLoader = new EXRLoader();
exrLoader.load('./assets/images/bg.exr', function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
  scene.background = texture;

  const bgObject = new THREE.Object3D();
  bgObject.name = 'bg';
  scene.add(bgObject);

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
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta(); 

  
  for (const key in mixers) {
    if (mixers.hasOwnProperty(key)) {
      mixers[key].update(delta); 
    }
  }

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
  