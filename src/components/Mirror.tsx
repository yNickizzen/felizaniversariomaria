import { useMemo } from 'react'
import * as THREE from 'three'

const MIRROR_W = 0.80
const ARCH_R   = MIRROR_W / 2
const RECT_H   = 1.45
const MIRROR_H = RECT_H + ARCH_R
const FRAME_T  = 0.075
const FRAME_D  = 0.055

const POST_X   = MIRROR_W * 0.44
const POST_W   = 0.046
const POST_H   = MIRROR_H * 0.90
const BASE_ARM = 0.19
const BASE_H   = 0.052
const BASE_W   = POST_W

const POS_X = 5.5
const POS_Z = 0.55

const DEFAULT_ROT: [number, number, number] = [0.05, 0, 0]

function makeOuterShape(): THREE.Shape {
  const s  = new THREE.Shape()
  const hw = MIRROR_W / 2
  s.moveTo(-hw, 0)
  s.lineTo( hw, 0)
  s.lineTo( hw, RECT_H)
  s.absarc(0, RECT_H, ARCH_R, 0, Math.PI, false)
  s.closePath()
  const h   = new THREE.Path()
  const ihw = hw - FRAME_T
  const ir  = ARCH_R - FRAME_T
  h.moveTo(-ihw, FRAME_T)
  h.lineTo( ihw, FRAME_T)
  h.lineTo( ihw, RECT_H)
  h.absarc(0, RECT_H, ir, 0, Math.PI, false)
  h.closePath()
  s.holes.push(h)
  return s
}

function makeGlassShape(): THREE.Shape {
  const s   = new THREE.Shape()
  const ihw = MIRROR_W / 2 - FRAME_T
  const ir  = ARCH_R - FRAME_T
  s.moveTo(-ihw, FRAME_T)
  s.lineTo( ihw, FRAME_T)
  s.lineTo( ihw, RECT_H)
  s.absarc(0, RECT_H, ir, 0, Math.PI, false)
  s.closePath()
  return s
}

function makeMirrorTex(): THREE.CanvasTexture {
  const w = 256, h = 512
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  const ctx = c.getContext('2d')!

  const base = ctx.createLinearGradient(0, 0, w, h)
  base.addColorStop(0,    '#b8c8d4')
  base.addColorStop(0.35, '#ddeaf2')
  base.addColorStop(0.5,  '#ecf4f8')
  base.addColorStop(0.65, '#ddeaf2')
  base.addColorStop(1,    '#b8c8d4')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, w, h)

  const radial = ctx.createRadialGradient(w * 0.42, h * 0.35, 0, w * 0.5, h * 0.5, w * 0.9)
  radial.addColorStop(0,   'rgba(255,255,255,0.55)')
  radial.addColorStop(0.4, 'rgba(255,255,255,0.15)')
  radial.addColorStop(1,   'rgba(180,200,215,0.0)')
  ctx.fillStyle = radial
  ctx.fillRect(0, 0, w, h)

  const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.85)
  vig.addColorStop(0, 'rgba(0,0,0,0.0)')
  vig.addColorStop(1, 'rgba(0,0,0,0.28)')
  ctx.fillStyle = vig
  ctx.fillRect(0, 0, w, h)

  return new THREE.CanvasTexture(c)
}

function makeFrameTex(): THREE.CanvasTexture {
  const c   = document.createElement('canvas')
  c.width   = 256
  c.height  = 512
  const ctx = c.getContext('2d')!
  const g   = ctx.createLinearGradient(0, 0, 256, 0)
  g.addColorStop(0,   '#a07030')
  g.addColorStop(0.3, '#d4aa60')
  g.addColorStop(0.5, '#f0cc80')
  g.addColorStop(0.7, '#d4aa60')
  g.addColorStop(1,   '#a07030')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 512)
  ctx.strokeStyle = 'rgba(100,65,20,0.35)'
  ctx.lineWidth   = 1.2
  for (let y = 12; y < 512; y += 24) {
    for (let x = 12; x < 256; x += 24) {
      ctx.beginPath()
      ctx.arc(x, y, 9, 0, Math.PI * 2)
      ctx.stroke()
    }
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

export function Mirror({ onClick }: { onClick?: () => void }) {
  const outerShape = useMemo(() => makeOuterShape(),  [])
  const glassShape = useMemo(() => makeGlassShape(),  [])
  const frameTex   = useMemo(() => makeFrameTex(),    [])
  const mirrorTex  = useMemo(() => makeMirrorTex(),    [])

  const frameGeo = useMemo(() => new THREE.ExtrudeGeometry(outerShape, {
    depth: FRAME_D,
    bevelEnabled:    true,
    bevelThickness:  0.011,
    bevelSize:       0.011,
    bevelSegments:   3,
    curveSegments:   28,
  }), [outerShape])

  const glassGeo = useMemo(() => new THREE.ShapeGeometry(glassShape, 28), [glassShape])

  const WOOD = <meshStandardMaterial color="#8a6030" roughness={0.55} metalness={0.12} />
  const GOLD = <meshStandardMaterial color="#c9a060" roughness={0.28} metalness={0.72} />

  return (
    <group position={[POS_X, 0, POS_Z]} rotation={[0, 0, 0]} scale={1.2}>

      {/* ── STAND ──────────────────────────────── */}

      <mesh position={[-POST_X, POST_H / 2, 0]} castShadow>
        <boxGeometry args={[POST_W, POST_H, POST_W]} />{WOOD}
      </mesh>
      <mesh position={[POST_X, POST_H / 2, 0]} castShadow>
        <boxGeometry args={[POST_W, POST_H, POST_W]} />{WOOD}
      </mesh>

      <mesh position={[-POST_X, BASE_H / 2, 0]} castShadow>
        <boxGeometry args={[BASE_W, BASE_H, BASE_ARM * 2]} />{WOOD}
      </mesh>
      <mesh position={[POST_X, BASE_H / 2, 0]} castShadow>
        <boxGeometry args={[BASE_W, BASE_H, BASE_ARM * 2]} />{WOOD}
      </mesh>

      <mesh position={[0, BASE_H / 2, 0]} castShadow>
        <boxGeometry args={[POST_X * 2, BASE_H * 0.7, BASE_W]} />{WOOD}
      </mesh>

      <mesh position={[0, MIRROR_H * 0.52, 0]} castShadow>
        <boxGeometry args={[POST_X * 2 + POST_W, POST_W * 0.7, POST_W * 0.7]} />{WOOD}
      </mesh>

      <mesh position={[-POST_X, POST_H + 0.038, 0]} castShadow>
        <sphereGeometry args={[0.038, 16, 16]} />{GOLD}
      </mesh>
      <mesh position={[POST_X, POST_H + 0.038, 0]} castShadow>
        <sphereGeometry args={[0.038, 16, 16]} />{GOLD}
      </mesh>

      {/* ── MIRROR PANEL ── */}
      <group rotation={DEFAULT_ROT}>

        {/* frame */}
        <mesh geometry={frameGeo} castShadow receiveShadow
          onClick={(e) => { e.stopPropagation(); onClick?.() }}
          onPointerOver={onClick ? () => { document.body.style.cursor = 'pointer' } : undefined}
          onPointerOut={onClick ? () => { document.body.style.cursor = 'auto' } : undefined}>
          <meshStandardMaterial
            map={frameTex}
            color="#d4aa70"
            roughness={0.38}
            metalness={0.62}
          />
        </mesh>

        {/* reflective glass */}
        <mesh geometry={glassGeo} position={[0, 0, FRAME_D + 0.001]}
          onClick={(e) => { e.stopPropagation(); onClick?.() }}>
          <meshStandardMaterial
            emissiveMap={mirrorTex}
            emissive="#ffffff"
            emissiveIntensity={0.85}
            color="#d0dde6"
            roughness={0.08}
            metalness={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* backing panel */}
        <mesh geometry={glassGeo} position={[0, 0, -0.004]}>
          <meshStandardMaterial color="#3a2a18" roughness={0.9} side={THREE.BackSide} />
        </mesh>

        {/* crest finial */}
        <mesh position={[0, MIRROR_H + 0.028, FRAME_D / 2]} castShadow>
          <sphereGeometry args={[0.046, 16, 16]} />{GOLD}
        </mesh>
        <mesh position={[0, MIRROR_H + 0.092, FRAME_D / 2]} castShadow>
          <coneGeometry args={[0.028, 0.068, 14]} />{GOLD}
        </mesh>

      </group>
    </group>
  )
}
