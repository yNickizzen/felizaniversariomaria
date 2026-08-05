import * as THREE from "three";

// Isometric-style camera with smooth parallax following pointer/finger.
// No free rotation — only gentle offset around a fixed isometric framing.

let targetX = 0;
let targetY = 0;
let isTouch = false;

const BASE = new THREE.Vector3(5.8, 4.8, 5.8);
const LOOK = new THREE.Vector3(0, 1.1, 0);

export function createCamera() {
  const aspect = window.innerWidth / window.innerHeight;
  const cam = new THREE.PerspectiveCamera(38, aspect, 0.1, 100);
  cam.position.copy(BASE);
  cam.lookAt(LOOK);
  return cam;
}

function setTargets(nx, ny) {
  // nx, ny in [-1, 1]
  targetX = nx;
  targetY = ny;
}

window.addEventListener("pointermove", (e) => {
  isTouch = e.pointerType === "touch";
  const nx = (e.clientX / window.innerWidth) * 2 - 1;
  const ny = (e.clientY / window.innerHeight) * 2 - 1;
  setTargets(nx, -ny);
}, { passive: true });

window.addEventListener("pointerdown", (e) => {
  if (e.pointerType === "touch") {
    isTouch = true;
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = (e.clientY / window.innerHeight) * 2 - 1;
    setTargets(nx, -ny);
  }
}, { passive: true });

// strength of parallax
const SWAY = 1.1;

export function updateCamera(cam, dt, t) {
  const strength = isTouch ? 0.9 : 1.0;
  const tx = BASE.x - targetX * SWAY * strength;
  const ty = BASE.y + targetY * SWAY * 0.6 * strength;
  // gentle idle drift
  const drift = Math.sin(t * 0.15) * 0.08;

  cam.position.x += (tx + drift - cam.position.x) * Math.min(1, dt * 2.4);
  cam.position.y += (ty - cam.position.y) * Math.min(1, dt * 2.4);
  cam.position.z += (BASE.z - drift * 0.5 - cam.position.z) * Math.min(1, dt * 2.4);
  cam.lookAt(LOOK.x, LOOK.y, LOOK.z);
}

// Smoothly move camera to an arbitrary target and look point, then return.
export function focusCamera(cam, pos, look, dt, lerpSpeed = 2.0) {
  cam.position.x += (pos.x - cam.position.x) * Math.min(1, dt * lerpSpeed);
  cam.position.y += (pos.y - cam.position.y) * Math.min(1, dt * lerpSpeed);
  cam.position.z += (pos.z - cam.position.z) * Math.min(1, dt * lerpSpeed);
  cam.lookAt(look.x, look.y, look.z);
}

export const CAMERA_BASE = BASE.clone();
export const CAMERA_LOOK = LOOK.clone();
