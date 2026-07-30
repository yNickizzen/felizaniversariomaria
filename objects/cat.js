import * as THREE from "three";

// Sleeping cat with breathing + blink animation.

export function buildCat(scene, animatables) {
  const group = new THREE.Group();
  scene.add(group);

  const fur = new THREE.MeshStandardMaterial({ color: 0x8a5a3a, roughness: 0.95, flatShading: true });
  const dark = new THREE.MeshStandardMaterial({ color: 0x4a2e1a, roughness: 0.95, flatShading: true });
  const pink = new THREE.MeshStandardMaterial({ color: 0xd9a090, roughness: 0.7, flatShading: true });

  // Body (curled loaf)
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 12), fur);
  body.scale.set(1, 0.7, 1.3);
  body.castShadow = true;
  group.add(body);

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 12), fur);
  head.position.set(0.18, 0.12, 0.22);
  head.castShadow = true;
  group.add(head);

  // Ears
  [-0.06, 0.06].forEach((x) => {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.08, 4), fur);
    ear.position.set(0.18 + x, 0.26, 0.22);
    ear.castShadow = true;
    group.add(ear);
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.05, 4), pink);
    inner.position.set(0.18 + x, 0.25, 0.22);
    group.add(inner);
  });

  // Closed eyes (thin dark slits)
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x2a1a10 });
  const eyeL = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 0.008), eyeMat);
  eyeL.position.set(0.3, 0.14, 0.2);
  eyeL.rotation.y = Math.PI / 2;
  group.add(eyeL);
  const eyeR = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 0.008), eyeMat);
  eyeR.position.set(0.3, 0.14, 0.24);
  eyeR.rotation.y = Math.PI / 2;
  group.add(eyeR);

  // Tail wrapping around
  const tail = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.05, 8, 16, Math.PI * 1.2), fur);
  tail.position.set(-0.18, 0.05, -0.1);
  tail.rotation.set(Math.PI / 2, 0, 0.5);
  tail.castShadow = true;
  group.add(tail);

  // Paws
  const pawMat = fur;
  [[-0.1, 0.3], [0.1, 0.3]].forEach(([x, z]) => {
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), pawMat);
    p.position.set(x, -0.12, z);
    p.castShadow = true;
    group.add(p);
  });

  // Place cat on the bed
  group.position.set(-3.0, 0.72, -2.2);
  group.rotation.y = -0.4;

  group.userData = { body, head, eyes: [eyeL, eyeR], tail };

  const catState = { group, body, head, eyes: [eyeL, eyeR], tail, blinkTimer: 2 + Math.random() * 3, purr: 0, baseY: group.position.y };
  animatables.push({ type: "cat", state: catState });

  return Object.assign(catState, { interactable: { mesh: body, kind: "cat", root: group, label: "gato" } });
}
