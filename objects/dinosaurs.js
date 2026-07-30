import * as THREE from "three";

// Dinosaur theme: plush, toys, dino books on shelf, small figures.
// Posters are created in furniture.js; here we add 3D dino objects.

export function buildDinosaurs(scene, interactables) {
  const group = new THREE.Group();
  scene.add(group);

  // Plush dinosaur on the bed
  const plush = makePlushDino();
  plush.position.set(-2.2, 0.7, -1.6);
  plush.rotation.y = 0.6;
  group.add(plush);
  interactables.push({ mesh: plush.userData.body, kind: "dino-plush", root: plush, label: "rex" });

  // Toy dino on the rug
  const toy = makeToyDino(0x4a7a5a);
  toy.position.set(0.3, 0.08, 0.6);
  toy.rotation.y = -0.5;
  group.add(toy);

  // Dino figure on nightstand
  const fig = makeToyDino(0xc8694a, 0.6);
  fig.position.set(-1.7, 0.62, -3.2);
  fig.rotation.y = 0.4;
  group.add(fig);

  // Dino book stack on floor by shelf
  const dinoBooks = makeDinoBooks();
  dinoBooks.position.set(-1.6, 0.06, -3.4);
  group.add(dinoBooks);

  return { group, interactables: [] };
}

function box(w, h, d, mat) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.castShadow = true;
  return m;
}

function makePlushDino() {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0x6a9c5a, roughness: 0.95, flatShading: true });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), mat);
  body.scale.set(1, 0.85, 1.2);
  body.castShadow = true;
  g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), mat);
  head.position.set(0.05, 0.18, 0.2);
  head.castShadow = true;
  g.add(head);
  // eyes
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x111, roughness: 0.3 });
  [-0.05, 0.05].forEach((x) => {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), eyeMat);
    e.position.set(x, 0.2, 0.3);
    g.add(e);
  });
  // tail
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.3, 8), mat);
  tail.position.set(0, 0.05, -0.28);
  tail.rotation.x = Math.PI / 2;
  tail.castShadow = true;
  g.add(tail);
  // legs
  [[-0.1, 0.12], [0.1, 0.12], [-0.1, -0.12], [0.1, -0.12]].forEach(([x, z]) => {
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.12, 8), mat);
    l.position.set(x, -0.2, z);
    l.castShadow = true;
    g.add(l);
  });
  g.userData.body = body;
  return g;
}

function makeToyDino(color, scale = 1) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7, flatShading: true });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), mat);
  body.scale.set(1, 0.7, 1.4);
  body.castShadow = true;
  g.add(body);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.12, 6), mat);
  neck.position.set(0.04, 0.1, 0.1);
  neck.rotation.z = 0.3;
  g.add(neck);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), mat);
  head.position.set(0.08, 0.17, 0.14);
  g.add(head);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.16, 6), mat);
  tail.position.set(0, 0.02, -0.16);
  tail.rotation.x = Math.PI / 2;
  g.add(tail);
  // back plates
  for (let i = 0; i < 3; i++) {
    const p = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.05, 4), mat);
    p.position.set(0, 0.08, -0.04 - i * 0.05);
    g.add(p);
  }
  g.scale.setScalar(scale);
  return g;
}

function makeDinoBooks() {
  const g = new THREE.Group();
  const cols = [0x3a5a2a, 0x6a3a2a, 0x2a4a6a];
  cols.forEach((c, i) => {
    const b = box(0.18, 0.04, 0.24, new THREE.MeshStandardMaterial({ color: c, roughness: 0.9, flatShading: true }));
    b.position.set(i * 0.06 - 0.06, 0.02 + i * 0.04, 0);
    g.add(b);
  });
  return g;
}
