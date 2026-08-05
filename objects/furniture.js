import * as THREE from "three";

// All furniture + props. Pushes clickable meshes into `interactables`
// and animated meshes into `animatables`.

export function buildFurniture(scene, interactables, animatables) {
  const group = new THREE.Group();
  scene.add(group);

  const wood = (c = 0x8a5a32) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8, flatShading: true });
  const fabric = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95, flatShading: true });
  const metal = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.4, metalness: 0.6, flatShading: true });

  // ---- Bed (back-left corner) ----
  const bed = makeBed(fabric, wood);
  bed.position.set(-2.7, 0, -2.6);
  group.add(bed);

  // ---- Nightstand next to bed ----
  const nightstand = makeBox(0.6, 0.6, 0.6, wood(0x7a4a28));
  nightstand.position.set(-1.7, 0.3, -3.2);
  nightstand.castShadow = true;
  group.add(nightstand);
  // small lamp on nightstand
  const nlamp = makeLamp();
  nlamp.position.set(-1.7, 0.6, -3.2);
  group.add(nlamp);

  // ---- Desk (right side) ----
  const desk = makeDesk(wood);
  desk.position.set(2.2, 0, 1.0);
  group.add(desk);

  // ---- Chair ----
  const chair = makeChair(wood, fabric);
  chair.position.set(2.2, 0, 2.2);
  chair.rotation.y = Math.PI;
  group.add(chair);

  // ---- Writing desk against back wall (under window) ----
  const writingDesk = makeWritingDesk(wood);
  writingDesk.position.set(1.6, 0, -3.55);
  group.add(writingDesk);

  // ---- Bookshelf (back wall, right of window) ----
  const shelf = makeBookshelf(wood);
  shelf.position.set(-0.4, 0, -3.85);
  group.add(shelf);

  // ---- Rug ----
  const rug = new THREE.Mesh(
    new THREE.CylinderGeometry(2.4, 2.4, 0.04, 28),
    fabric(0xc8694a)
  );
  rug.position.set(0.3, 0.02, 0.6);
  rug.receiveShadow = true;
  group.add(rug);
  const rugRing = new THREE.Mesh(
    new THREE.RingGeometry(1.9, 2.1, 28),
    new THREE.MeshStandardMaterial({ color: 0xf2d9b0, roughness: 0.9, side: THREE.DoubleSide, flatShading: true })
  );
  rugRing.rotation.x = -Math.PI / 2;
  rugRing.position.set(0.3, 0.041, 0.6);
  group.add(rugRing);

  // ---- Floor cushions (almofadas) ----
  for (let i = 0; i < 2; i++) {
    const cush = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 12, 8),
      fabric(i ? 0xe0a86a : 0x9c6b8a)
    );
    cush.scale.y = 0.55;
    cush.position.set(-0.2 + i * 0.7, 0.18, 1.5);
    cush.castShadow = true;
    group.add(cush);
  }

  // ---- Mirror (left wall) ----
  const mirror = makeMirror();
  mirror.position.set(-3.86, 2.2, 1.8);
  mirror.rotation.y = Math.PI / 2;
  group.add(mirror);
  interactables.push({ mesh: mirror.userData.glass, kind: "mirror", label: "espelho" });

  // ---- Posters (dino) on back wall ----
  const posters = makePosters();
  posters.position.set(-3.2, 3.0, -3.78);
  group.add(posters);
  posters.userData.posters.forEach((p, i) => interactables.push({ mesh: p, kind: "poster", index: i }));

  // ---- Frames (quadros) on left wall ----
  const frames = makeFrames();
  frames.position.set(-3.86, 3.1, -0.4);
  frames.rotation.y = Math.PI / 2;
  group.add(frames);

  // ---- Plants ----
  const plant1 = makeCactus(0x4a7a3a);
  plant1.position.set(2.7, 0, -3.2);
  group.add(plant1);
  animatables.push({ type: "plant", mesh: plant1.userData.leaves, phase: 0 });
  const plant2 = makePlant(0x5a8a4a, 0.8);
  plant2.position.set(-3.4, 0.62, -3.0); // on a small stool
  const stool = makeBox(0.4, 0.6, 0.4, wood(0x6a4220));
  stool.position.set(-3.4, 0.3, -3.0);
  group.add(stool);
  plant2.position.y = 0.62;
  group.add(plant2);
  animatables.push({ type: "plant", mesh: plant2.userData.leaves, phase: 1.7 });

  // ---- Fairy lights (along top of back wall) ----
  const fairy = makeFairyLights();
  group.add(fairy);
  animatables.push({ type: "fairy", mesh: fairy });

  // ---- Desk lamp ----
  const dlamp = makeDeskLamp();
  dlamp.position.set(1.5, 1.0, 1.0);
  group.add(dlamp);

  // ---- Radio on desk ----
  const radio = makeRadio();
  radio.position.set(2.7, 1.25, 0.7);
  group.add(radio);
  interactables.push({ mesh: radio.userData.body, kind: "radio", label: "rádio", root: radio });

  // ---- Books on desk ----
  const deskBooks = makeDeskBooks();
  deskBooks.position.set(1.7, 1.05, 1.4);
  group.add(deskBooks);
  interactables.push({ mesh: deskBooks.userData.top, kind: "books", label: "livros" });

  // ---- Cake on desk ----
  const cake = makeCake();
  cake.position.set(2.45, 1.04, 1.0);
  group.add(cake);
  animatables.push({ type: "candle", flame: cake.userData.flame, light: cake.userData.light, phase: 0, lit: true });
  interactables.push({ mesh: cake.userData.plate, kind: "cake", root: cake, label: "bolo" });

  // ---- Letter on desk ----
  const letter = makeLetter();
  letter.position.set(2.2, 1.05, 1.5);
  letter.rotation.y = 0.3;
  group.add(letter);
  interactables.push({ mesh: letter.userData.envelope, kind: "letter", label: "carta", root: letter });

  // ---- Storage boxes (caixas organizadoras) ----
  const box1 = makeBox(0.7, 0.5, 0.5, wood(0x9c6b43));
  box1.position.set(-3.2, 0.25, 2.6);
  box1.castShadow = true;
  group.add(box1);
  const box2 = makeBox(0.5, 0.4, 0.5, fabric(0x8a6a4a));
  box2.position.set(-3.2, 0.7, 2.6);
  box2.castShadow = true;
  group.add(box2);

  return { group, interactables: [], animatables, bed, desk, radio, letter, cake, fairy };
}

// ---------- helpers ----------
function makeBox(w, h, d, mat) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function makeBed(fabric, wood) {
  const g = new THREE.Group();
  const frame = makeBox(2.2, 0.35, 3.0, wood(0x7a4a28));
  frame.position.y = 0.2;
  g.add(frame);
  const mattress = makeBox(2.0, 0.3, 2.8, fabric(0xf2e6d0));
  mattress.position.y = 0.5;
  g.add(mattress);
  // blanket
  const blanket = makeBox(2.05, 0.12, 1.9, fabric(0xc8694a));
  blanket.position.set(0, 0.7, 0.45);
  g.add(blanket);
  // pillows (rounded like the floor cushions)
  const pmat = fabric(0xfaf0e0);
  const p1 = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), pmat);
  p1.scale.set(1.1, 0.28, 0.7);
  p1.position.set(-0.45, 0.66, -1.05);
  p1.castShadow = true;
  g.add(p1);
  const p2 = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), pmat);
  p2.scale.set(1.1, 0.28, 0.7);
  p2.position.set(0.45, 0.66, -1.05);
  p2.castShadow = true;
  g.add(p2);
  // headboard
  const hb = makeBox(2.2, 0.9, 0.12, wood(0x6a4220));
  hb.position.set(0, 0.65, -1.5);
  g.add(hb);
  return g;
}

function makeLamp() {
  const g = new THREE.Group();
  const base = makeBox(0.3, 0.06, 0.3, new THREE.MeshStandardMaterial({ color: 0x6a4220, roughness: 0.7, flatShading: true }));
  g.add(base);
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8),
    new THREE.MeshStandardMaterial({ color: 0x6a4220, roughness: 0.6, flatShading: true })
  );
  pole.position.y = 0.23;
  g.add(pole);
  const shade = new THREE.Mesh(
    new THREE.ConeGeometry(0.22, 0.28, 12, 1, true),
    new THREE.MeshStandardMaterial({ color: 0xfff0c0, roughness: 0.6, flatShading: true, side: THREE.DoubleSide, emissive: 0xffb24c, emissiveIntensity: 0.6 })
  );
  shade.position.y = 0.55;
  g.add(shade);
  return g;
}

function makeDesk(wood) {
  const g = new THREE.Group();
  const top = makeBox(2.0, 0.08, 1.1, wood(0x9c6b43));
  top.position.y = 1.0;
  g.add(top);
  const legGeo = new THREE.BoxGeometry(0.1, 1.0, 0.1);
  const legMat = wood(0x7a4a28);
  [[-0.9, -0.45], [0.9, -0.45], [-0.9, 0.45], [0.9, 0.45]].forEach(([x, z]) => {
    const l = new THREE.Mesh(legGeo, legMat);
    l.position.set(x, 0.5, z);
    l.castShadow = true;
    g.add(l);
  });
  // drawer
  const dr = makeBox(0.9, 0.25, 0.95, wood(0x8a5a32));
  dr.position.set(0.5, 0.75, 0);
  g.add(dr);
  const knob = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xd9b27a, roughness: 0.4, metalness: 0.5 })
  );
  knob.position.set(0.5, 0.75, 0.5);
  g.add(knob);
  return g;
}

function makeWritingDesk(wood) {
  const g = new THREE.Group();
  const topW = 1.3, topD = 0.65, topH = 0.04;
  const deskH = 0.75;
  const cabW = 0.42, cabH = 0.65, cabD = 0.58;

  // Top
  const top = makeBox(topW, topH, topD, wood(0x9c6b43));
  top.position.y = deskH;
  g.add(top);

  // Front apron
  const apron = makeBox(topW - 0.1, 0.07, 0.03, wood(0x7a4a28));
  apron.position.set(0, deskH - 0.055, topD / 2 - 0.015);
  g.add(apron);

  // Drawer cabinet (right side)
  const cab = makeBox(cabW, cabH, cabD, wood(0x7a4a28));
  cab.position.set(topW / 2 - cabW / 2, deskH - cabH / 2, 0);
  g.add(cab);

  // 2 drawers with knobs
  const drwH = (cabH - 0.10) / 2;
  for (let i = 0; i < 2; i++) {
    const dy = deskH - cabH + 0.05 + i * (drwH + 0.02) + drwH / 2;
    const drw = makeBox(cabW - 0.06, drwH - 0.02, 0.03, wood(0x8a5a32));
    drw.position.set(topW / 2 - cabW / 2, dy, cabD / 2);
    g.add(drw);
    const knob = new THREE.Mesh(
      new THREE.SphereGeometry(0.032, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xd9b27a, roughness: 0.4, metalness: 0.5 })
    );
    knob.position.set(topW / 2 - cabW / 2, dy, cabD / 2 + 0.03);
    g.add(knob);
  }

  // 2 legs on left side
  const legGeo = new THREE.BoxGeometry(0.08, deskH - topH, 0.08);
  const legMat = wood(0x7a4a28);
  [[-(topW / 2 - 0.06), -(topD / 2 - 0.06)], [-(topW / 2 - 0.06), topD / 2 - 0.06]].forEach(([x, z]) => {
    const l = new THREE.Mesh(legGeo, legMat);
    l.position.set(x, (deskH - topH) / 2, z);
    l.castShadow = true;
    g.add(l);
  });

  // Notebook on top
  const notebook = makeBox(0.24, 0.025, 0.33,
    new THREE.MeshStandardMaterial({ color: 0x6a8a9c, roughness: 0.9, flatShading: true }));
  notebook.position.set(-0.3, deskH + topH / 2 + 0.013, 0);
  g.add(notebook);

  // Pencil cup
  const cup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.04, 0.1, 10),
    new THREE.MeshStandardMaterial({ color: 0xc8694a, roughness: 0.8, flatShading: true })
  );
  cup.position.set(0.15, deskH + topH / 2 + 0.05, -0.15);
  cup.castShadow = true;
  g.add(cup);
  // pencils in cup
  for (let i = 0; i < 3; i++) {
    const pen = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.16, 5),
      new THREE.MeshStandardMaterial({ color: [0xe0a050, 0x4a7a5a, 0x9c4a4a][i], roughness: 0.6 })
    );
    pen.position.set(0.15 + (i - 1) * 0.02, deskH + topH / 2 + 0.08, -0.15);
    pen.rotation.z = (i - 1) * 0.08;
    g.add(pen);
  }

  return g;
}

function makeChair(wood, fabric) {
  const g = new THREE.Group();
  const seat = makeBox(0.6, 0.08, 0.6, wood(0x8a5a32));
  seat.position.y = 0.5;
  g.add(seat);
  const cushion = makeBox(0.55, 0.06, 0.55, fabric(0xc8694a));
  cushion.position.y = 0.55;
  g.add(cushion);
  [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]].forEach(([x, z]) => {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.06), wood(0x7a4a28));
    l.position.set(x, 0.25, z);
    l.castShadow = true;
    g.add(l);
  });
  const back = makeBox(0.6, 0.7, 0.06, wood(0x8a5a32));
  back.position.set(0, 0.85, -0.27);
  g.add(back);
  return g;
}

function makeBookshelf(wood) {
  const g = new THREE.Group();
  const w = 1.8, h = 2.6, d = 0.5;
  const back = makeBox(w, h, 0.06, wood(0x6a4220));
  back.position.set(0, h / 2, -d / 2 + 0.03);
  g.add(back);
  const sideL = makeBox(0.08, h, d, wood(0x7a4a28));
  sideL.position.set(-w / 2, h / 2, 0);
  g.add(sideL);
  const sideR = makeBox(0.08, h, d, wood(0x7a4a28));
  sideR.position.set(w / 2, h / 2, 0);
  g.add(sideR);
  const shelves = 4;
  for (let i = 0; i <= shelves; i++) {
    const sh = makeBox(w - 0.1, 0.06, d, wood(0x8a5a32));
    sh.position.set(0, (h / shelves) * i + 0.03, 0);
    g.add(sh);
  }
  // books
  const bookColors = [0xc8694a, 0x6a8a9c, 0x8a6a9c, 0x9c8a4a, 0x4a7a5a, 0x9c4a4a, 0xd9a050, 0x5a6a9c];
  for (let s = 0; s < shelves; s++) {
    const yBase = (h / shelves) * s + 0.1;
    let x = -w / 2 + 0.16;
    while (x < w / 2 - 0.2) {
      const bw = 0.08 + Math.random() * 0.06;
      const bh = 0.3 + Math.random() * 0.12;
      const b = new THREE.Mesh(
        new THREE.BoxGeometry(bw, bh, 0.28),
        new THREE.MeshStandardMaterial({ color: bookColors[Math.floor(Math.random() * bookColors.length)], roughness: 0.9, flatShading: true })
      );
      b.position.set(x, yBase + bh / 2, 0.05);
      b.castShadow = true;
      g.add(b);
      x += bw + 0.01;
    }
    // a few leaning books
    if (s % 2 === 1) {
      const b = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.34, 0.28),
        new THREE.MeshStandardMaterial({ color: 0x4a6a8a, roughness: 0.9, flatShading: true })
      );
      b.position.set(w / 2 - 0.3, yBase + 0.18, 0.05);
      b.rotation.z = 0.2;
      g.add(b);
    }
  }
  return g;
}

function makeMirror() {
  const g = new THREE.Group();
  const frame = makeBox(0.9, 1.6, 0.1, new THREE.MeshStandardMaterial({ color: 0x9c6b43, roughness: 0.7, flatShading: true }));
  g.add(frame);
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(0.7, 1.4),
    new THREE.MeshStandardMaterial({ color: 0xa8c8d8, roughness: 0.1, metalness: 0.7, flatShading: true })
  );
  glass.position.z = 0.06;
  g.add(glass);
  g.userData.glass = glass;
  return g;
}

function makePosters() {
  const g = new THREE.Group();
  const posters = [];
  const colors = [0x3a5a2a, 0x6a3a2a, 0x2a4a6a];
  const accents = [0x9cd06a, 0xe0a050, 0x6ac8e0];
  for (let i = 0; i < 3; i++) {
    const pg = new THREE.Group();
    const bg = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 0.9),
      new THREE.MeshStandardMaterial({ color: colors[i], roughness: 0.8, flatShading: true, emissive: 0x000000, emissiveIntensity: 0 })
    );
    pg.add(bg);
    // simple dino silhouette (a couple of triangles + body)
    const dinoMat = new THREE.MeshStandardMaterial({ color: accents[i], roughness: 0.7, flatShading: true });
    const body = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.18), dinoMat);
    body.position.set(0, -0.1, 0.001);
    pg.add(body);
    const neck = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.25), dinoMat);
    neck.position.set(0.16, 0.05, 0.001);
    pg.add(neck);
    const head = new THREE.Mesh(new THREE.CircleGeometry(0.06, 8), dinoMat);
    head.position.set(0.2, 0.18, 0.001);
    pg.add(head);
    pg.position.set(i * 0.85 - 0.85, 0, 0.01);
    g.add(pg);
    posters.push(bg);
  }
  g.userData.posters = posters;
  return g;
}

function makeFrames() {
  const g = new THREE.Group();
  for (let i = 0; i < 2; i++) {
    const f = makeBox(0.6, 0.7, 0.05, new THREE.MeshStandardMaterial({ color: 0x9c6b43, roughness: 0.7, flatShading: true }));
    f.position.set(i * 0.8 - 0.4, 0, 0.03);
    g.add(f);
    const art = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.6),
      new THREE.MeshStandardMaterial({ color: i ? 0xc8694a : 0x6a8a9c, roughness: 0.8, flatShading: true })
    );
    art.position.set(i * 0.8 - 0.4, 0, 0.06);
    g.add(art);
  }
  return g;
}

function makePlant(color, scale = 1) {
  const g = new THREE.Group();
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.18, 0.3, 10),
    new THREE.MeshStandardMaterial({ color: 0xb06a4a, roughness: 0.8, flatShading: true })
  );
  pot.position.y = 0.15;
  pot.castShadow = true;
  g.add(pot);
  const leaves = new THREE.Group();
  const lmat = new THREE.MeshStandardMaterial({ color, roughness: 0.8, flatShading: true, side: THREE.DoubleSide });
  for (let i = 0; i < 7; i++) {
    const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.4), lmat);
    const a = (i / 7) * Math.PI * 2;
    leaf.position.set(Math.cos(a) * 0.08, 0.5, Math.sin(a) * 0.08);
    leaf.rotation.y = a;
    leaf.rotation.z = (Math.random() - 0.5) * 0.3;
    leaf.castShadow = true;
    leaves.add(leaf);
  }
  g.add(leaves);
  g.scale.setScalar(scale);
  g.userData.leaves = leaves;
  return g;
}

function makeCactus(color) {
  const g = new THREE.Group();
  const potMat = new THREE.MeshStandardMaterial({ color: 0xb06a4a, roughness: 0.8, flatShading: true });
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.38, 12), potMat);
  pot.position.y = 0.19;
  pot.castShadow = true;
  g.add(pot);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.04, 8, 16), potMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.38;
  g.add(rim);

  const cmat = new THREE.MeshStandardMaterial({ color, roughness: 0.7, flatShading: true });
  const leaves = new THREE.Group();

  // Main trunk
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.1, 12), cmat);
  trunk.position.y = 0.38 + 0.55;
  trunk.castShadow = true;
  leaves.add(trunk);

  // Two arms
  const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 0.5, 10), cmat);
  armL.position.set(-0.22, 0.85, 0);
  armL.rotation.z = 0.5;
  armL.castShadow = true;
  leaves.add(armL);
  const armLTop = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), cmat);
  armLTop.position.set(-0.36, 1.05, 0);
  leaves.add(armLTop);

  const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.42, 10), cmat);
  armR.position.set(0.2, 0.95, 0.05);
  armR.rotation.z = -0.45;
  armR.castShadow = true;
  leaves.add(armR);
  const armRTop = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), cmat);
  armRTop.position.set(0.32, 1.16, 0.05);
  leaves.add(armRTop);

  // Ribs (vertical ridges)
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1.0, 0.04), cmat);
    rib.position.set(Math.cos(a) * 0.2, 0.93, Math.sin(a) * 0.2);
    leaves.add(rib);
  }

  // Spines (tiny cones)
  const spineMat = new THREE.MeshStandardMaterial({ color: 0xf0e0c0, roughness: 0.5 });
  for (let i = 0; i < 24; i++) {
    const a = Math.random() * Math.PI * 2;
    const y = 0.5 + Math.random() * 0.7;
    const r = 0.21;
    const sp = new THREE.Mesh(new THREE.ConeGeometry(0.01, 0.06, 4), spineMat);
    sp.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
    sp.lookAt(0, y, 0);
    sp.rotateX(Math.PI / 2);
    leaves.add(sp);
  }

  // Top dome
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 8), cmat);
  dome.position.y = 0.38 + 1.1;
  dome.scale.y = 0.4;
  leaves.add(dome);

  g.add(leaves);
  g.userData.leaves = leaves;
  return g;
}

function makeFairyLights() {
  const g = new THREE.Group();
  const wireMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.8 });
  const bulbMat = new THREE.MeshStandardMaterial({ color: 0xffe6a0, roughness: 0.3, emissive: 0xffd070, emissiveIntensity: 1.4, flatShading: true });
  const bulbs = [];
  for (let i = 0; i < 14; i++) {
    const x = -3.5 + (i / 13) * 7;
    const y = 3.6 + Math.sin(i * 0.6) * 0.12;
    const z = -3.78;
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), bulbMat.clone());
    bulb.position.set(x, y, z);
    g.add(bulb);
    bulbs.push(bulb);
  }
  g.userData.bulbs = bulbs;
  return g;
}

function makeDeskLamp() {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.05, 12), new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.5, metalness: 0.5, flatShading: true }));
  g.add(base);
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6), new THREE.MeshStandardMaterial({ color: 0x5a5a5a, roughness: 0.4, metalness: 0.6 }));
  arm.position.set(0, 0.27, 0);
  arm.rotation.z = 0.2;
  g.add(arm);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.18, 12, 1, true), new THREE.MeshStandardMaterial({ color: 0xffe6b0, roughness: 0.5, flatShading: true, side: THREE.DoubleSide, emissive: 0xffb24c, emissiveIntensity: 0.8 }));
  shade.position.set(0.1, 0.5, 0.04);
  shade.rotation.z = -0.6;
  g.add(shade);
  return g;
}

function makeRadio() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.42, 0.28),
    new THREE.MeshStandardMaterial({ color: 0x9c6a3a, roughness: 0.7, flatShading: true })
  );
  body.castShadow = true;
  g.add(body);
  // speaker grill
  const grill = new THREE.Mesh(
    new THREE.CircleGeometry(0.13, 16),
    new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.8 })
  );
  grill.position.set(-0.2, 0, 0.141);
  g.add(grill);
  // dial
  const dial = new THREE.Mesh(
    new THREE.PlaneGeometry(0.2, 0.1),
    new THREE.MeshStandardMaterial({ color: 0xf2d9b0, roughness: 0.4, emissive: 0xffb24c, emissiveIntensity: 0.3 })
  );
  dial.position.set(0.2, 0.05, 0.141);
  g.add(dial);
  // knobs
  for (let i = 0; i < 2; i++) {
    const k = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.04, 10), new THREE.MeshStandardMaterial({ color: 0xd9b27a, roughness: 0.5, metalness: 0.4 }));
    k.rotation.x = Math.PI / 2;
    k.position.set(0.2, -0.1 + i * 0.0, 0.141);
    k.position.y = -0.12;
    g.add(k);
  }
  // antenna
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.4, 6), new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.6, roughness: 0.3 }));
  ant.position.set(0.3, 0.4, 0);
  ant.rotation.z = -0.3;
  g.add(ant);
  g.userData.body = body;
  return g;
}

function makeDeskBooks() {
  const g = new THREE.Group();
  const cols = [0x6a8a9c, 0x9c6a4a, 0x4a7a5a];
  let x = -0.2;
  cols.forEach((c, i) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.22), new THREE.MeshStandardMaterial({ color: c, roughness: 0.9, flatShading: true }));
    b.position.set(x + i * 0.13, 0.04, 0);
    b.castShadow = true;
    g.add(b);
  });
  // top book (the clickable "open" one)
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.03, 0.22), new THREE.MeshStandardMaterial({ color: 0xc8694a, roughness: 0.9, flatShading: true }));
  top.position.set(0, 0.095, 0);
  g.add(top);
  g.userData.top = top;
  return g;
}

function makeCake() {
  const g = new THREE.Group();
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.03, 16), new THREE.MeshStandardMaterial({ color: 0xf2ead2, roughness: 0.5, flatShading: true }));
  g.add(plate);
  const cake = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.18, 18), new THREE.MeshStandardMaterial({ color: 0xf2c8a0, roughness: 0.8, flatShading: true }));
  cake.position.y = 0.1;
  cake.castShadow = true;
  g.add(cake);
  // frosting drip
  const frost = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.03, 8, 18), new THREE.MeshStandardMaterial({ color: 0xfae0c0, roughness: 0.7, flatShading: true }));
  frost.position.y = 0.18;
  frost.rotation.x = Math.PI / 2;
  g.add(frost);
  // candle
  const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.14, 8), new THREE.MeshStandardMaterial({ color: 0xffd0a0, roughness: 0.6 }));
  candle.position.y = 0.25;
  g.add(candle);
  // flame
  const flame = new THREE.Mesh(
    new THREE.ConeGeometry(0.03, 0.09, 8),
    new THREE.MeshBasicMaterial({ color: 0xffb050, transparent: true, opacity: 0.9 })
  );
  flame.position.y = 0.34;
  g.add(flame);
  const light = new THREE.PointLight(0xffa64d, 0.4, 2.0, 2);
  light.position.y = 0.36;
  g.add(light);
  g.userData.flame = flame;
  g.userData.light = light;
  g.userData.plate = plate;
  return g;
}

function makeLetter() {
  const g = new THREE.Group();
  const env = new THREE.Mesh(
    new THREE.BoxGeometry(0.34, 0.02, 0.24),
    new THREE.MeshStandardMaterial({ color: 0xf6ead2, roughness: 0.8, flatShading: true })
  );
  env.castShadow = true;
  g.add(env);
  // wax seal
  const seal = new THREE.Mesh(new THREE.CircleGeometry(0.04, 12), new THREE.MeshStandardMaterial({ color: 0xc8694a, roughness: 0.5, flatShading: true }));
  seal.position.set(0, 0.012, 0);
  seal.rotation.x = -Math.PI / 2;
  g.add(seal);
  g.userData.envelope = env;
  return g;
}
