import * as THREE from "three";

// Warm, cozy lighting: window sun, ambient bounce, lamp, fairy lights, soft shadows.

export function createLights(scene) {
  const group = new THREE.Group();
  scene.add(group);

  // Ambient + hemisphere fill (very soft)
  const hemi = new THREE.HemisphereLight(0xffd9a0, 0x3a2418, 0.45);
  group.add(hemi);

  // Warm sun coming through the window
  const sun = new THREE.DirectionalLight(0xffb86b, 2.0);
  sun.position.set(-6, 5.5, -4);
  sun.target.position.set(0.5, 1.0, 0);
  group.add(sun.target);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 22;
  sun.shadow.camera.left = -8;
  sun.shadow.camera.right = 8;
  sun.shadow.camera.top = 8;
  sun.shadow.camera.bottom = -8;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  sun.shadow.radius = 4;
  group.add(sun);

  // Soft fill from the right (room interior bounce)
  const fill = new THREE.PointLight(0xffc28a, 0.5, 14, 2);
  fill.position.set(3.5, 2.6, 3.2);
  group.add(fill);

  // Lamp light (desk)
  const lamp = new THREE.PointLight(0xffb24c, 1.4, 7, 2);
  lamp.position.set(-1.6, 1.85, 1.1);
  group.add(lamp);

  // Fairy lights glow (a row of tiny lights handled in furniture, but add a soft point)
  const fairy = new THREE.PointLight(0xffd98a, 0.9, 6, 2);
  fairy.position.set(2.2, 3.0, -1.8);
  group.add(fairy);

  // Cake candle glow
  const candle = new THREE.PointLight(0xffa64d, 0.8, 3.5, 2);
  candle.position.set(0.4, 1.35, 1.6);
  group.add(candle);

  return { group, sun, hemi, fill, lamp, fairy, candle };
}
