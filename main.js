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
// Load the 3D models
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

//cache version
 const CACHE_NAME = 'v7'

//Camera settings
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
  manual: {
    perspective: 50,
    lookAt: new THREE.Vector3(-10, 80, 25), 
    position: new THREE.Vector3( -15, 90, -7), 
    duration: 3.4,
  },
  phone: {
    perspective: 35,
    lookAt: new THREE.Vector3(6.7, 87, 25), 
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

const secondaryModels = {
  phone: {
    path: './assets/images/phoneV2Comp.glb', 
    name: 'phone', 
    duration: 2.5,
    position: new THREE.Vector3(50, 25, 0 ), 
    scale: [100, 100, 100], 
    rotation: new THREE.Vector3(0, 0, 0),
    newPosition: new THREE.Vector3(3.35, 80, -5),
    newRotation: new THREE.Vector3( 0, 120, 5)
  },
  manual: {
    path: './assets/images/manualComp.glb',
    name: 'manual',
    duration: 3.4, 
    position: new THREE.Vector3(10, 50, 37.5), 
    scale: [1, 1, 1], 
    rotation: new THREE.Vector3(0, 0, 0),
    newPosition: new THREE.Vector3(-18, 80, 20),
    newRotation: new THREE.Vector3(-50, 183, -5),
  },
  tablet: {
    path: './assets/images/tabletV2Comp.glb',
    name: 'tablet',
    duration: 4,
    newPosition: new THREE.Vector3(-5, 80, 25),
    newRotation: new THREE.Vector3( -50, 45, 10),
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
camera.position.set(cameraPositions.home.position.x, cameraPositions.home.position.y, cameraPositions.home.position.z);
camera.lookAt(cameraPositions.home.lookAt);


const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
// controls.maxPolarAngle = Math.PI / 2;
controls.enabled = false
controls.update();

//Intro
window.addEventListener('load', startIntro)

function startIntro() {
  setTimeout(animateIntro, 1000);
}
function animateIntro() {
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
  onUpdate: () => controls.update(),},  
  `-=${cameraPositions.dash.duration }`);

  gsap.to(camera, {
      fov: cameraPositions.dash.perspective,
      duration: 4.5,
      onUpdate: () => camera.updateProjectionMatrix()},
      `-=${cameraPositions.dash.duration }`);
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

    const animTime = camStartDuration;

    gsap.to(camera.position, {
      duration: animTime,
      x: cameraPositions.home.position.x,
      y: cameraPositions.home.position.y,
      z: cameraPositions.home.position.z,
      onComplete: onComplete,
      onUpdate: () => controls.update(),  
    });

    gsap.to(controls.target, {
      duration: animTime,
      x: cameraPositions.home.lookAt.x,
      y: cameraPositions.home.lookAt.y,
      z: cameraPositions.home.lookAt.z,
      onUpdate: () => controls.update(),},  
      );
    

    gsap.to(camera, {
      fov: cameraPositions.home.perspective,
      duration: animTime,
      onUpdate: () => camera.updateProjectionMatrix()},
      );
    

    camStartLook = cameraPositions.home.lookAt.clone();
    
  }

  function goToDest(config){ 
  
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
      onUpdate: () => controls.update(),},  
    );
    
  
    gsap.to(camera, {
      fov: config.perspective,
      duration: config.duration,
      onUpdate: () => camera.updateProjectionMatrix()}
     );
  
  camStartDuration = config.duration;};
}

  function handleSecondaryModel(targetValues) {
    const modelConfig = secondaryModels[targetValues];
    if (!modelConfig) {
      console.error(`No config found for key: ${targetValues}`);
      return;
    }

    let model = scene.getObjectByName(modelConfig.name);

    if (!model) {
      loader.load(modelConfig.path, function (gltf) {
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
        loadedModel.scale.set(
          modelConfig.scale[0], 
          modelConfig.scale[1], 
          modelConfig.scale[2]
        );
        scene.add(loadedModel);

        animateSecondaryModel(loadedModel, modelConfig);
      });
    }
    else {
      animateSecondaryModel(model, modelConfig);
    }

  function animateSecondaryModel(loadedModel, modelConfig) {
    gsap.to(loadedModel.position, {
      duration: modelConfig.duration || 2,
      x: modelConfig.newPosition.x,
      y: modelConfig.newPosition.y,
      z: modelConfig.newPosition.z,
    });
   
    gsap.to(loadedModel.rotation, {
      duration: modelConfig.duration || 2,
      x: THREE.MathUtils.degToRad(modelConfig.newRotation.x),
      y: THREE.MathUtils.degToRad(modelConfig.newRotation.y),
      z: THREE.MathUtils.degToRad(modelConfig.newRotation.z),
    });
  }
};

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

  const models = [
    { path: './assets/images/blackSupraComp2.glb', 
      name: 'supra',
      position: [0, 0, 0], 
      scale: [100, 100, 100], 
      rotation: [0, Math.PI / 2, 0]
    },
    { path: './assets/images/tabletV2Comp.glb',
      name: 'tablet',
      position: [0, 40, 40 ],
      scale: [80, 80, 80],
      rotation: [
        THREE.MathUtils.degToRad(-10), 
        THREE.MathUtils.degToRad(45), 
        THREE.MathUtils.degToRad(20),
      ]
    },
  ]

  models.forEach(model =>{
    loader.load(model.path, function (gltf) {
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

