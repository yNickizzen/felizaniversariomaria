import * as THREE from "three";

// Room shell: floor + two visible walls (back & left), window opening, door.
// Right and front walls are absent so the camera can see in.

export function buildRoom(scene) {
  const group = new THREE.Group();
  scene.add(group);

  // Floor planks (a few long boxes for low-poly plank feel)
  const plankGeo = new THREE.BoxGeometry(1.0, 0.08, 8);
  const plankMats = [0x9c6b43, 0x8a5e3c, 0xa5724b].map(
    (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.9, flatShading: true })
  );
  for (let i = -3; i <= 3; i++) {
    const m = new THREE.Mesh(plankGeo, plankMats[(i + 3) % plankMats.length]);
    m.position.set(i, -0.04, 0);
    m.receiveShadow = true;
    group.add(m);
  }

  // Back wall (z = -4) — built as segments to leave a window opening
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xc9a079,
    roughness: 0.95,
    flatShading: true,
  });
  // Window opening: centered at x=1.6, width 2.2, sill height 1.7, top height 3.7
  const winCX = 1.6, winW = 2.2, winBottom = 1.7, winTop = 3.7, wallH = 5;
  // Left of window (full height)
  const bwLeft = new THREE.Mesh(new THREE.BoxGeometry(winCX - winW / 2 + 4, wallH, 0.2), wallMat);
  bwLeft.position.set(-4 + (winCX - winW / 2) / 2, wallH / 2, -4);
  bwLeft.receiveShadow = true;
  group.add(bwLeft);
  // Right of window (full height)
  const bwRightW = 4 - (winCX + winW / 2);
  const bwRight = new THREE.Mesh(new THREE.BoxGeometry(bwRightW, wallH, 0.2), wallMat);
  bwRight.position.set(winCX + winW / 2 + bwRightW / 2, wallH / 2, -4);
  bwRight.receiveShadow = true;
  group.add(bwRight);
  // Above window
  const bwTopH = wallH - winTop;
  const bwTop = new THREE.Mesh(new THREE.BoxGeometry(winW, bwTopH, 0.2), wallMat);
  bwTop.position.set(winCX, winTop + bwTopH / 2, -4);
  bwTop.receiveShadow = true;
  group.add(bwTop);
  // Below window (sill area)
  const bwBotH = winBottom;
  const bwBot = new THREE.Mesh(new THREE.BoxGeometry(winW, bwBotH, 0.2), wallMat);
  bwBot.position.set(winCX, bwBotH / 2, -4);
  bwBot.receiveShadow = true;
  group.add(bwBot);
  const backWall = bwLeft; // ref for any external use

  // Left wall (x = -4)
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5, 8), wallMat);
  leftWall.position.set(-4, 2.4, 0);
  leftWall.receiveShadow = true;
  group.add(leftWall);

  // Baseboards
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x6e4a2e, roughness: 0.8, flatShading: true });
  const bb1 = new THREE.Mesh(new THREE.BoxGeometry(8, 0.18, 0.06), baseMat);
  bb1.position.set(0, 0.09, -3.92);
  group.add(bb1);
  const bb2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 8), baseMat);
  bb2.position.set(-3.92, 0.09, 0);
  group.add(bb2);

  // Window: sits in the opening of the back wall
  const win = makeWindow();
  win.position.set(1.6, 2.7, -3.9);
  group.add(win);

  // Door on the left wall
  const door = makeDoor();
  door.position.set(-3.92, 1.1, -2.4);
  group.add(door);

  return { group, window: win, door, backWall, leftWall, sky: win.userData.sky };
}

function makeWindow() {
  const g = new THREE.Group();

  // Frame
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xefe0c4, roughness: 0.7, flatShading: true });
  const w = 2.2, h = 2.0, t = 0.12;
  const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.12, t), frameMat);
  top.position.y = h / 2; g.add(top);
  const bot = new THREE.Mesh(new THREE.BoxGeometry(w, 0.12, t), frameMat);
  bot.position.y = -h / 2; g.add(bot);
  const lft = new THREE.Mesh(new THREE.BoxGeometry(0.12, h, t), frameMat);
  lft.position.x = -w / 2; g.add(lft);
  const rgt = new THREE.Mesh(new THREE.BoxGeometry(w * 0.06, h * 0.92, t * 0.5), frameMat);
  rgt.position.x = 0; g.add(rgt);
  const farL = new THREE.Mesh(new THREE.BoxGeometry(0.12, h, t), frameMat);
  farL.position.x = w / 2; g.add(farL);

  // Sky plane (will be swapped by window interactions)
  const skyMat = new THREE.MeshBasicMaterial({ color: 0xffb066, fog: false });
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.2, h - 0.2), skyMat);
  sky.position.z = -0.08;
  g.add(sky);
  g.userData.sky = sky;

  // Sill
  const sill = new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, 0.1, 0.3), frameMat);
  sill.position.y = -h / 2 - 0.08;
  sill.castShadow = true;
  g.add(sill);

  // Curtains (two panels) — animated
  const curtainMat = new THREE.MeshStandardMaterial({
    color: 0xf2d9b0, roughness: 0.9, flatShading: true, side: THREE.DoubleSide,
  transparent: true, opacity: 0.92,
  emissive: 0x3a2410, emissiveIntensity: 0.05,
  });
  const cw = 0.7, ch = h + 0.1;
  const cL = new THREE.Mesh(new THREE.BoxGeometry(cw, ch, 0.05), curtainMat);
  cL.position.set(-w / 2 - 0.05, 0.05, 0.08);
  cL.castShadow = true;
  g.add(cL);
  const cR = new THREE.Mesh(new THREE.BoxGeometry(cw, ch, 0.05), curtainMat);
  cR.position.set(w / 2 + 0.05, 0.05, 0.08);
  cR.castShadow = true;
  g.add(cR);

  g.userData.curtains = [cL, cR];

  return g;
}

function makeDoor() {
  const g = new THREE.Group();
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x7a4a28, roughness: 0.7, flatShading: true });
  const d = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.2, 1.0), doorMat);
  d.castShadow = true;
  g.add(d);
  const handle = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xd9b27a, roughness: 0.4, metalness: 0.6 })
  );
  handle.position.set(0.08, 0, 0.32);
  g.add(handle);
  g.rotation.y = Math.PI / 2; // face into room
  return g;
}
