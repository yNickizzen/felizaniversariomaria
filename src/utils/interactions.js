import * as THREE from "three";

// Raycast hover + click interactions. No menus — objects ARE the interface.
// A subtle emissive glow on hover is the only UI affordance.

const LETTER_MSG = `Hoje é seu dia.

Eu juntei cada detalhe deste quarto pensando em você —
o tapete macio, a luz quente da janela,
o bolo com uma vela só, e o gato que dorme
como se soubesse que aqui dentro ninguém tem pressa.

Queria que você pudesse sentir, só por um instante,
que o mundo inteiro fez silêncio pra te desejar
tudo de bom que existe.

Feliz aniversário. Que o seu próximo ano
seja tão aconchegante quanto este quarto.`;

const MIRROR_MSG = `Você é mais forte
do que imagina —
e mais amado
do que consegue ver.`;

const BOOK_MEMORIES = [
  { title: "A viagem", text: "Aquela tarde que não acabava mais — você rindo até o sol sumir. Eu nunca esqueci." },
  { title: "A promessa", text: "Você disse que a gente ia voltar aqui um dia. A gente voltou. Só que em 3D." },
  { title: "A música", text: "Toda vez que essa toca, eu lembro de você cantando errado e feliz." },
];

export function setupInteractions({
  canvas, camera, scene, interactables, animatables, cat, room, furniture, dinos, lights, audio,
}) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hovered = null;
  const savedEmissive = new Map();
  let windowMode = 0; // 0 sunset, 1 night, 2 rain

  const letterOverlay = document.getElementById("letter-overlay");
  const letterText = document.getElementById("letter-text");
  const letterClose = document.getElementById("letter-close");
  const mirrorOverlay = document.getElementById("mirror-overlay");
  const mirrorText = document.getElementById("mirror-text");
  const mirrorClose = document.getElementById("mirror-close");
  const bookOverlay = document.getElementById("book-overlay");
  const bookContent = document.getElementById("book-content");
  const bookClose = document.getElementById("book-close");

  // Make the window sky clickable too
  if (room && room.window) {
    const sky = room.window.userData.sky;
    interactables.push({ mesh: sky, kind: "window" });
  }

  // Store original emissive for hover glow
  interactables.forEach((it) => {
    const m = it.mesh.material;
    if (m && m.emissive) {
      savedEmissive.set(it.mesh, { color: m.emissive.getHex(), intensity: m.emissiveIntensity ?? 0 });
    }
  });

  function setPointer(e) {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  function findInteractive(mesh) {
    for (const it of interactables) if (it.mesh === mesh) return it;
    return null;
  }

  function glowOn(mesh) {
    const m = mesh.material;
    if (m && m.emissive) {
      m.emissive.setHex(0xffd98a);
      m.emissiveIntensity = 0.35;
      m.needsUpdate = true;
    }
  }
  function glowOff(mesh) {
    const saved = savedEmissive.get(mesh);
    const m = mesh.material;
    if (m && m.emissive && saved) {
      m.emissive.setHex(saved.color);
      m.emissiveIntensity = saved.intensity;
      m.needsUpdate = true;
    }
  }

  function onMove(e) {
    setPointer(e);
    raycaster.setFromCamera(pointer, camera);
    const meshes = interactables.map((it) => it.mesh);
    const hits = raycaster.intersectObjects(meshes, false);
    const hit = hits.length ? hits[0].object : null;
    if (hit !== hovered) {
      if (hovered) glowOff(hovered);
      hovered = hit;
      if (hovered) glowOn(hovered);
      canvas.classList.toggle("hovering", !!hovered);
    }
  }

  function onClick(e) {
    setPointer(e);
    raycaster.setFromCamera(pointer, camera);
    const meshes = interactables.map((it) => it.mesh);
    const hits = raycaster.intersectObjects(meshes, false);
    if (!hits.length) return;
    const it = findInteractive(hits[0].object);
    if (it) handle(it);
  }

  function toggleCandle() {
    const candleState = animatables.find((a) => a.type === "candle");
    if (!candleState) return;
    candleState.lit = !candleState.lit;
    candleState.flame.visible = candleState.lit;
    if (candleState.light) candleState.light.visible = candleState.lit;
  }

  function handle(it) {
    switch (it.kind) {
      case "radio": audio.toggleMusic(); pulse(it.root ?? it.mesh); break;
      case "letter": openLetter(); break;
      case "books": openBook(); break;
      case "mirror": openMirror(); break;
      case "cat": cat.purr = 4; pulse(cat.group, 0.06); audio.purr(); break;
      case "cake": toggleCandle(); break;
      case "dino-plush": pulse(it.root ?? it.mesh, 0.1); break;
      case "poster": posterWobble(it.mesh); break;
      case "window": cycleWindow(); break;
    }
  }

  function pulse(obj, amount = 0.05) {
    if (!obj) return;
    const s0 = obj.scale.x;
    obj.scale.setScalar(s0 + amount);
    setTimeout(() => obj.scale.setScalar(s0), 180);
  }

  function posterWobble(mesh) {
    const parent = mesh.parent;
    const r0 = parent.rotation.z;
    const start = performance.now();
    (function wobble() {
      const dt = (performance.now() - start) / 1000;
      if (dt > 0.6) { parent.rotation.z = r0; return; }
      parent.rotation.z = r0 + Math.sin(dt * 12) * 0.06 * (1 - dt / 0.6);
      requestAnimationFrame(wobble);
    })();
  }

  function cycleWindow() {
    windowMode = (windowMode + 1) % 3;
    const sky = room.window.userData.sky;
    if (windowMode === 0) {
      sky.material.color.set(0xffb066);
      lights.sun.color.set(0xffb86b); lights.sun.intensity = 2.0; lights.hemi.intensity = 0.45;
      scene.fog.color.set(0x0c0907); scene.background.set(0x0c0907);
    } else if (windowMode === 1) {
      sky.material.color.set(0x1a1a3a);
      lights.sun.color.set(0x6a7ab0); lights.sun.intensity = 0.4; lights.hemi.intensity = 0.2;
      scene.fog.color.set(0x070612); scene.background.set(0x070612);
    } else {
      sky.material.color.set(0x5a6470);
      lights.sun.color.set(0x9aa0b0); lights.sun.intensity = 0.9; lights.hemi.intensity = 0.35;
      scene.fog.color.set(0x10131a); scene.background.set(0x10131a);
    }
  }

  function openLetter() {
    letterText.textContent = LETTER_MSG;
    letterOverlay.classList.add("show");
    letterOverlay.setAttribute("aria-hidden", "false");
  }
  function openMirror() {
    mirrorText.textContent = MIRROR_MSG;
    mirrorOverlay.classList.add("show");
    mirrorOverlay.setAttribute("aria-hidden", "false");
  }
  function openBook() {
    const mem = BOOK_MEMORIES[Math.floor(Math.random() * BOOK_MEMORIES.length)];
    bookContent.innerHTML = `<div class="mem-title">${mem.title}</div>${mem.text}`;
    bookOverlay.classList.add("show");
    bookOverlay.setAttribute("aria-hidden", "false");
  }
  function closeAll() {
    [letterOverlay, mirrorOverlay, bookOverlay].forEach((o) => {
      o.classList.remove("show");
      o.setAttribute("aria-hidden", "true");
    });
  }
  letterClose.addEventListener("click", closeAll);
  mirrorClose.addEventListener("click", closeAll);
  bookClose.addEventListener("click", closeAll);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(); });

  canvas.addEventListener("pointermove", onMove, { passive: true });
  canvas.addEventListener("click", onClick);
}
