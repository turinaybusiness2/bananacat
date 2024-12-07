import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { gsap } from "gsap";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/**
 * Loaders
 */

let sceneReady = false;
let innerBody = null;
let bikini = null;
let dress = null;
const loadingBarElement = document.querySelector(".loading");

const loadingManager = new THREE.LoadingManager(
  // Loaded
  () => {
    setTimeout(() => {
      loadingBarElement.classList.add("hidden"); // Add class to start fade-out animation
      setTimeout(() => {
        loadingBarElement.style.display = "none"; // Remove loading div after animation ends
      }, 500); // Match the transition duration in CSS (0.5s)
    }, 1000); // Delay before starting the fade-out animation (optional)

    window.setTimeout(() => {
      sceneReady = true;
    }, 500);
  }

  // Progress
);

const gltfLoader = new GLTFLoader(loadingManager);
const rgbeLoader = new RGBELoader(loadingManager);
const textureLoader = new THREE.TextureLoader(loadingManager);

/**
 * Base
 */

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setClearColor(0x1c1c1c, 0);
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding; // Use sRGB for color encoding
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.ReinhardToneMapping;
renderer.toneMapping = THREE.LinearToneMapping; // ACES Filmic tone mapping for realistic color
renderer.toneMappingExposure = 1; // Adjust exposure to control brightness
scene.environmentIntensity = 0.5; // Lower the environment lighting if needed
const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(
  new RoomEnvironment(),
  0.04
).texture;
/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  3000
);

camera.position.set(
  -0.6004865973820335,
  0.11812583581959962,
  3.794080233760782
);
camera.rotation.set(
  -0.001807360496999036 - 0.04082544780205027,
  -0.00007376588670783165
);
scene.add(camera);

// OrbitControls setup
const controls = new OrbitControls(camera, canvas);
controls.target.set(-0.5, 0, -1);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.maxPolarAngle = Math.PI / 1.75;
// Limit zoom
controls.minDistance = 1; // Minimum zoom distance
controls.maxDistance = 10; // Maximum zoom distance
controls.update();
/**
 * Environment map
 */
// scene.environmentIntensity = 2;

// rgbeLoader.load(
//   "./environmentMaps/0/2k.hdr",
//   (environmentMap) => {
//     environmentMap.mapping = THREE.EquirectangularReflectionMapping;
//     scene.environment = environmentMap;
//   },
//   undefined,
//   (error) => {
//     console.error("Error loading environment map:", error);
//   }
// );

/**
 * Directional light
 */
const directionalLight = new THREE.DirectionalLight("#ffffff", 2);
directionalLight.position.set(1, 8, 5);

directionalLight.castShadow = true;

directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 20;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
directionalLight.shadow.mapSize.set(2048, 2048);
scene.add(directionalLight);
// Add a helper for the directional light
// const directionalLightHelper = new THREE.DirectionalLightHelper(
//   directionalLight,
//   5
// ); // 5 is the size of the helper
// scene.add(directionalLightHelper);
/**
 * Animation mixer
 */
let mixer;

/**
 * Models
 */
const shadowMat = new THREE.ShadowMaterial({ opacity: 0.25 });
let actions = {};
let currentAction;
let roadMat;
gltfLoader.load("/models/scene-base4.glb", (gltf) => {
  gltf.scene.scale.set(0.05, 0.05, 0.05);

  gltf.scene.position.y -= 1.175;

  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      console.log(child.name); // Log all mesh names
    }
  });
  scene.add(gltf.scene);
  // const grass0 = gltf.scene.getObjectByName("island_grass_0");
  // const grass1 = gltf.scene.getObjectByName("island_sand_0");

  // if (grass0) {
  //   grass0.receiveShadow = true;
  //   console.log("Enabled shadow casting for island_grass_0");
  // } else {
  //   console.warn("island_grass_0 not found!");
  // }

  // if (grass1) {
  //   grass1.receiveShadow = true;
  //   console.log("Enabled shadow casting for island_grass_1");
  // } else {
  //   console.warn("island_grass_1 not found!");
  // }
});
const stops = {
  about: { transitions: { ca: "about-ca", x: "about-x" }, index: 0 },
  ca: { transitions: { about: "ca-about", x: "ca-x" }, index: 1 },
  x: { transitions: { about: "x-about", ca: "x-ca" }, index: 2 },
};
const points = [
  {
    position: new THREE.Vector3(-1.5, 0.3, 0.75),
    element: document.querySelector(".floating-bubble-0"),
  },
  {
    position: new THREE.Vector3(1.5, 0.3, -2.4),
    element: document.querySelector(".floating-bubble-1"),
  },
  {
    position: new THREE.Vector3(0.45, 0.3, 0.75),
    element: document.querySelector(".floating-bubble-2"),
  },
];
let currentStop = "about";
let walkAction, transitionAction;
// Global variable to store the loaded GLTF model
let loadedModel;
let camObject; // To store the 'cam' object
let camAction; // To store the 'camAction' animation
gltfLoader.load("/models/anim10.glb", (gltf) => {
  loadedModel = gltf;
  gltf.scene.scale.set(0.05, 0.05, 0.05);
  gltf.scene.position.y -= 1.2;

  gltf.scene.getObjectByName("GLTF_created_0").position.y -= 0.3;
  scene.add(gltf.scene);

  console.log(gltf.animations.map((clip) => clip.name));
  roadMat = gltf.scene.getObjectByName("CA");

  mixer = new THREE.AnimationMixer(gltf.scene);
  const sceneAnimation = THREE.AnimationClip.findByName(
    gltf.animations,
    "Take 001"
  );
  const sceneAction = mixer.clipAction(sceneAnimation);
  sceneAction.setLoop(THREE.LoopRepeat);
  sceneAction.play();

  const walkAnimation = THREE.AnimationClip.findByName(
    gltf.animations,
    "metarigAction.001"
  );
  const characterStartPos = THREE.AnimationClip.findByName(
    gltf.animations,
    "about-ca"
  );
  walkAction = mixer.clipAction(walkAnimation);
  walkAction.setLoop(THREE.LoopRepeat);
  walkAction.play();
  walkAction.paused = true;

  mixer.addEventListener("finished", (e) => {
    if (e.action === transitionAction) {
      walkAction.paused = true;
    }
  });
  camObject = gltf.scene.getObjectByName("cam").visible = false;
});
let isFirstAboutClick = true;
let buttons = document.querySelectorAll("button");
let isAnimating = false; // Track whether an animation is playing
function moveTo(targetStop) {
  console.log(`Button clicked: ${targetStop}`);
  // if (targetStop === "about" && isFirstAboutClick) {
  //   const clickedButton = document.getElementById(`button-${targetStop}`);
  //   clickedButton.classList.add("active");
  //   isFirstAboutClick = false; // Ensure this runs only once
  //   animateCameraToCharacter().then(() => {
  //     buttons.forEach((button) => {
  //       // Error: Cannot access 'buttons' before initialization
  //       if (button.id !== `button-${targetStop}`) {
  //         button.disabled = false;
  //         button.style.cursor = "pointer";
  //       }
  //     });
  //   });
  // }

  // Skip further actions if targetStop is the same as currentStop
  if (targetStop === currentStop) return;
  points.forEach((point) => {
    point.element.classList.remove("visible");
  });
  isAnimating = true;
  const transitionAnimationName = stops[currentStop].transitions[targetStop];
  console.log(`Transition Animation Name: ${transitionAnimationName}`);

  if (!loadedModel) {
    console.error("Model not loaded yet!");
    return;
  }

  const transitionAnimation = THREE.AnimationClip.findByName(
    loadedModel.animations,
    transitionAnimationName
  );

  if (!transitionAnimation) {
    console.error(
      `Transition animation '${transitionAnimationName}' not found for transition from '${currentStop}' to '${targetStop}'.`
    );
    return;
  }

  // Disable all buttons during the animation
  buttons = document.querySelectorAll("button");
  buttons.forEach((button) => {
    button.disabled = true;
    button.style.cursor = "not-allowed";
    button.classList.remove("active"); // Remove active state from all buttons
  });

  // Disable the clicked button permanently
  const clickedButton = document.getElementById(`button-${targetStop}`);
  clickedButton.classList.add("active");

  // Stop current actions
  if (transitionAction) transitionAction.stop();
  if (walkAction) walkAction.stop();

  // Play transition animation
  transitionAction = mixer.clipAction(transitionAnimation);
  transitionAction.setLoop(THREE.LoopOnce);
  transitionAction.clampWhenFinished = true;

  // Adjust speed for specific animations
  if (
    transitionAnimationName === "about-ca" ||
    transitionAnimationName === "ca-about"
  ) {
    transitionAction.setEffectiveTimeScale(0.5); // Slow down animation
  }

  if (
    transitionAnimationName === "x-ca" ||
    transitionAnimationName === "ca-x"
  ) {
    transitionAction.setEffectiveTimeScale(0.5); // Slow down animation
  }

  transitionAction.play();
  walkAction.play();
  animateCameraForTransition(transitionAnimationName);
  if (
    transitionAnimationName === "about-x" ||
    transitionAnimationName === "x-about"
  ) {
    // trackCameraToCharacter();
  }
  // Start walk animation

  // Listen for the mixer 'finished' event
  const handleFinished = (event) => {
    if (event.action === transitionAction) {
      console.log(`Transition to ${targetStop} completed.`);
      currentStop = targetStop;
      walkAction.paused = true;
      points.forEach((point, index) => {
        console.log(stops[currentStop].index);
        if (index === stops[currentStop].index) {
          point.element.classList.add("visible");
        } else {
          point.element.classList.remove("visible");
        }
      });
      isAnimating = false;
      // Enable other buttons after the animation, but keep the clicked button disabled
      buttons.forEach((button) => {
        if (button.id !== `button-${targetStop}`) {
          button.disabled = false;
          button.style.cursor = "pointer";
        }
      });

      mixer.removeEventListener("finished", handleFinished);
    }
  };

  mixer.addEventListener("finished", handleFinished);
}

// Add event listeners to the buttons
document
  .getElementById("button-about")
  .addEventListener("click", () => moveTo("about"));
document
  .getElementById("button-ca")
  .addEventListener("click", () => moveTo("ca"));
document
  .getElementById("button-x")
  .addEventListener("click", () => moveTo("x"));
function animateCameraForTransition(transitionAnimationName) {
  let targetPosition = {};
  let targetRotation = {};
  let targetPositioncam;
  // Determine the target position and rotation based on the animation name
  if (
    transitionAnimationName === "ca-about" ||
    transitionAnimationName === "ca-x"
  ) {
    targetPosition = {
      x: -0.6004865973820335,
      y: 0.11812583581959962,
      z: 3.794080233760782,
    };
    targetRotation = {
      x: -0.001807360496999036,
      y: -0.04082544780205027,
      z: -0.00007376588670783165,
    };
    targetPositioncam = new THREE.Vector3(-0.5, 0, 1);
  } else if (
    transitionAnimationName === "about-ca" ||
    transitionAnimationName === "x-ca"
  ) {
    targetPosition = {
      x: 4.348235746364294,
      y: 0.03506995725968839,
      z: -1.8693496030449115,
    };
    targetRotation = {
      x: -2.6637580336624467,
      y: 1.5598575201709926,
      z: 2.6637824647995068,
    };
    targetPositioncam = new THREE.Vector3(-1, 0, -2);
  } else {
    console.warn(
      `No camera animation defined for transition: ${transitionAnimationName}`
    );
    return;
  }

  // Animate camera position and rotation using GSAP
  gsap.to(camera.position, {
    x: targetPosition.x,
    y: targetPosition.y,
    z: targetPosition.z,
    duration: 2, // Adjust duration as needed
    delay: 2,
    ease: "power2.inOut",
    onUpdate: () => {
      // controls.update();
      // camera.lookAt(new THREE.Vector3(-1, 0, -2)); // Adjust focus if needed
      camera.lookAt(targetPositioncam); // Adjust focus if needed
    },
    onComplete: () => {
      // Sync OrbitControls with the final camera state
      controls.target.copy(targetPositioncam);
      controls.update();
    },
  });

  gsap.to(camera.rotation, {
    x: targetRotation.x,
    y: targetRotation.y,
    z: targetRotation.z,
    delay: 1,
    duration: 4, // Match duration with position animation
    ease: "power2.inOut",
  });
}

function animateCameraToCharacter() {
  if (!roadMat) {
    console.warn("Character (roadMat) not found.");
    return;
  }

  const buttons = document.querySelectorAll("button");
  buttons.forEach((button) => {
    button.disabled = true;
    button.style.cursor = "not-allowed";
  });

  return new Promise((resolve) => {
    // Get the character's position
    const targetPosition = roadMat.getWorldPosition(new THREE.Vector3());

    // Calculate the desired camera position relative to the character
    const adjustedCameraPosition = targetPosition
      .clone()
      .add(new THREE.Vector3(0, 0.4, 1.25));

    // Smoothly move the camera
    gsap.to(camera.position, {
      x: adjustedCameraPosition.x,
      y: adjustedCameraPosition.y,
      z: adjustedCameraPosition.z,
      duration: 3, // Adjust duration as needed
      ease: "power2.out",
      onUpdate: () => {
        camera.lookAt(targetPosition); // Ensure the camera stays focused on the character
      },
      onComplete: () => {
        // Sync OrbitControls with the final camera state
        controls.target.copy(targetPosition);
        controls.update();
        console.log("Camera animation to character complete.");
        buttons.forEach((button) => {
          button.disabled = false;
          button.style.cursor = "pointer";
        });

        resolve(); // Resolve the promise to indicate completion
      },
    });
  });
}

// Similarly, define `trackXCa` and `trackCaX` with different settings.
function trackCameraToCharacter() {
  if (!roadMat) {
    console.warn("Character (roadMat) not found.");
    return;
  }

  const animationDuration = transitionAction.getClip().duration; // Get the animation's duration
  const trackDuration = animationDuration; // Use the animation's duration for tracking
  const interval = 16; // Update interval in milliseconds (~60 FPS)
  const targetPosition = new THREE.Vector3();

  let elapsedTime = 0;

  // Track the character's position during the animation
  const trackInterval = setInterval(() => {
    elapsedTime += interval / 1000; // Convert interval to seconds

    // Stop tracking after the animation duration
    if (elapsedTime >= trackDuration) {
      clearInterval(trackInterval);

      // Sync OrbitControls at the end of tracking
      roadMat.getWorldPosition(targetPosition);
      controls.target.copy(targetPosition);
      controls.update();

      return;
    }

    // Get the character's current position
    roadMat.getWorldPosition(targetPosition);

    // Adjust the camera's position relative to the character
    const adjustedCameraPosition = targetPosition
      .clone()
      .add(new THREE.Vector3(0, 0.35, 1.5)); // Adjust the offset as needed

    // Smoothly update the camera position
    gsap.to(camera.position, {
      x: adjustedCameraPosition.x,
      y: adjustedCameraPosition.y,
      z: adjustedCameraPosition.z,
      duration: 0.1, // Smoothness of the tracking
      ease: "linear", // Keep tracking linear
      onUpdate: () => {
        camera.lookAt(targetPosition); // Ensure the camera stays focused on the character
      },
    });
  }, interval);
}
/**
 * Sizes
 */

/**
 * Animate
 */
const raycaster = new THREE.Raycaster();

const clock = new THREE.Clock();
window.addEventListener("keydown", (event) => {
  if (event.key === "1") {
    // Press "L" to log the camera position and rotation
    logCameraPositionAndRotation();
  }
});
function logCameraPositionAndRotation() {
  console.log("Camera Position: ", {
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z,
  });

  console.log("Camera Rotation: ", {
    x: camera.rotation.x, // Rotation around X-axis (pitch)
    y: camera.rotation.y, // Rotation around Y-axis (yaw)
    z: camera.rotation.z, // Rotation around Z-axis (roll)
  });
}

const tick = () => {
  if (sceneReady) {
    // Find the point corresponding to the current stop
    const selectedPoint = points[stops[currentStop].index];

    if (selectedPoint && !isAnimating) {
      // Get 2D screen position
      const screenPosition = selectedPoint.position.clone();
      screenPosition.project(camera);

      // Set the raycaster
      raycaster.setFromCamera(screenPosition, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      // Visibility logic for the selected point
      if (intersects.length === 0) {
        selectedPoint.element.classList.add("visible"); // Show
      } else {
        const intersectionDistance = intersects[0].distance;
        const pointDistance = selectedPoint.position.distanceTo(
          camera.position
        );

        if (intersectionDistance < pointDistance) {
          selectedPoint.element.classList.remove("visible"); // Hide
        } else {
          selectedPoint.element.classList.add("visible"); // Show
        }
      }

      // Update screen position
      const translateX = screenPosition.x * sizes.width * 0.5;
      const translateY = -screenPosition.y * sizes.height * 0.5;
      selectedPoint.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`;
    }
  }
  // if (sceneReady) {
  //   // Update visible points' position on the screen
  //   points.forEach((point) => {
  //     if (point.element.classList.contains("visible")) {
  //       const screenPosition = point.position.clone();
  //       screenPosition.project(camera);

  //       const translateX = screenPosition.x * sizes.width * 0.5;
  //       const translateY = -screenPosition.y * sizes.height * 0.5;
  //       point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`;
  //     }
  //   });
  // }
  if (mixer) mixer.update(clock.getDelta());

  renderer.render(scene, camera);
  controls.update();
  window.requestAnimationFrame(tick);
};

tick();
