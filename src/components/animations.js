import * as THREE from "three";

let ctx = {};

export function setupAnimations({ cat, room, furniture, dinos, lights }) {
  ctx = { cat, room, furniture, dinos, lights };
}

export function tickAnimations(dt, t) {
  const { cat, room, furniture, lights } = ctx;

  // ---- Cat breathing + blink + purr ----
  if (cat) {
    const breathe = 1 + Math.sin(t * 1.8) * 0.025;
    cat.body.scale.set(breathe, breathe * 0.97, breathe * 1.3);
    cat.blinkTimer -= dt;
    if (cat.blinkTimer < 0.18 && cat.blinkTimer > 0) {
      cat.eyes.forEach((e) => (e.scale.y = 0.1));
    } else {
      cat.eyes.forEach((e) => (e.scale.y = 1));
    }
    if (cat.blinkTimer < 0) cat.blinkTimer = 3 + Math.random() * 4;
    if (cat.purr > 0) {
      cat.purr -= dt;
      cat.group.position.y = cat.baseY + Math.sin(t * 22) * 0.004;
    }
    if (cat.tail) cat.tail.rotation.z = 0.5 + Math.sin(t * 0.7) * 0.08;
  }

  // ---- Curtains sway ----
  if (room && room.window && room.window.userData.curtains) {
    room.window.userData.curtains.forEach((c, i) => {
      c.rotation.z = Math.sin(t * 0.6 + i * 1.5) * 0.04;
      c.position.x = (i ? 1 : -1) * (1.15 + Math.sin(t * 0.5 + i) * 0.02);
    });
  }

  // ---- Plants sway ----
  // handled via animatables in main? we stored in furniture.animatables
  // We iterate the global animatables list passed through main instead.
  // (kept here for any direct refs)
}

// Extended tick that also walks the animatables list created in main.js.
// main.js calls tickAnimations; we also export a runner for animatables.
export function tickAnimatables(list, dt, t) {
  for (const a of list) {
    switch (a.type) {
      case "plant": {
        a.mesh.rotation.z = Math.sin(t * 0.8 + a.phase) * 0.06;
        a.mesh.rotation.x = Math.cos(t * 0.5 + a.phase) * 0.04;
        break;
      }
      case "fairy": {
        const bulbs = a.mesh.userData.bulbs || [];
        for (let i = 0; i < bulbs.length; i++) {
          const b = bulbs[i];
          const flick = 0.7 + Math.sin(t * 2.0 + i * 1.3) * 0.15 + Math.sin(t * 7 + i) * 0.08;
          b.material.emissiveIntensity = Math.max(0.3, flick);
        }
        break;
      }
      case "candle": {
        if (!a.lit) break;
        const fl = a.flame;
        const s = 1 + Math.sin(t * 9 + a.phase) * 0.12 + Math.sin(t * 23) * 0.05;
        fl.scale.set(s, 1 + Math.sin(t * 11) * 0.1, s);
        fl.position.x = Math.sin(t * 5) * 0.004;
        if (a.light) a.light.intensity = 0.4 + Math.sin(t * 9) * 0.08;
        break;
      }
      case "dust": {
        const pos = a.points.geometry.attributes.position;
        for (let i = 0; i < a.seeds.length; i++) {
          const s = a.seeds[i];
          pos.array[i * 3] += Math.sin(t * 0.3 + s) * 0.0006;
          pos.array[i * 3 + 1] += Math.sin(t * 0.2 + s * 1.3) * 0.0008 + 0.0004;
          pos.array[i * 3 + 2] += Math.cos(t * 0.25 + s) * 0.0006;
          if (pos.array[i * 3 + 1] > 4.3) pos.array[i * 3 + 1] = 0.3;
        }
        pos.needsUpdate = true;
        break;
      }
      case "cat": {
        // purr decay handled in tickAnimations (same object reference)
        break;
      }
    }
  }
}
