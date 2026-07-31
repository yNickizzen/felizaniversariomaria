import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

import { createCamera, updateCamera } from "./camera.js";
import { createLights } from "./lights.js";
import { buildRoom } from "./objects/room.js";
import { buildFurniture } from "./objects/furniture.js";
import { buildDinosaurs } from "./objects/dinosaurs.js";
import { buildCat } from "./objects/cat.js";
import { buildDust } from "./objects/dust.js";
import { setupAnimations, tickAnimations, tickAnimatables } from "./animations.js";
import { setupInteractions } from "./interactions.js";
import { AudioManager } from "./audio/audio.js";

// ---------- Renderer ----------
const canvas = document.getElementById("scene");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// ---------- Scene ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color("#0c0907");
scene.fog = new THREE.FogExp2("#0c0907", 0.022);

// ---------- Camera ----------
const camera = createCamera();

// ---------- Lights ----------
const lights = createLights(scene);

// ---------- World ----------
const interactables = [];
const animatables = [];

const room = buildRoom(scene);
const furniture = buildFurniture(scene, interactables, animatables);
const dinos = buildDinosaurs(scene, interactables);
const cat = buildCat(scene, animatables);
const dust = buildDust(scene, animatables);

interactables.push(...furniture.interactables, ...dinos.interactables, cat.interactable);

// ---------- Post-processing ----------
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.55, 0.6, 0.85
);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// ---------- Audio ----------
const audio = new AudioManager();

// ---------- Animations ----------
setupAnimations({ cat, room, furniture, dinos, lights });

// ---------- Interactions ----------
setupInteractions({
  canvas,
  camera,
  scene,
  interactables,
  animatables,
  cat,
  room,
  furniture,
  dinos,
  lights,
  audio,
  composer,
  renderer,
});

// ---------- Resize ----------
function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  composer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", onResize);

// ---------- Loop ----------
const clock = new THREE.Clock();
let veilHidden = false;
function hideVeil() {
  if (veilHidden) return;
  veilHidden = true;
  const veil = document.getElementById("veil");
  if (veil) {
    veil.classList.add("hidden");
    setTimeout(() => veil.remove(), 1000);
  }
}
function animate() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  updateCamera(camera, dt, t);
  tickAnimations(dt, t);
  tickAnimatables(animatables, dt, t);
  composer.render();
  if (!veilHidden) hideVeil();
  requestAnimationFrame(animate);
}
animate();
