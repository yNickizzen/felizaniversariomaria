import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

const BED_LEN = 3.2, BED_WID = 1.8, ROOM_D = 6.5
const BED_GRP_X = 0.13 + BED_LEN / 2
const BED_GRP_Z = ROOM_D - 0.03 - BED_WID / 2

const NS_W = 0.55, NS_D = 0.42, NS_H = 0.70
const WALL_T = 0.022, DRAWER_H = 0.16, DRAWER_GAP = 0.008
const DRAWER_SLIDE = 0.25

const NS_X = BED_GRP_X + BED_LEN / 2 + (NS_D * NS_SCALE) / 2 + 0.08
const NS_Z = BED_GRP_Z - BED_WID / 2 - NS_D / 2 - 0.06
const NS_SCALE = 1.6

function woodTex(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 512; c.height = 512
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#c49a60'; ctx.fillRect(0, 0, 512, 512)
  for (let row = 0; row < 8; row++) {
    const y = row * 64, s = 0.92 + Math.random() * 0.12
    ctx.fillStyle = `rgb(${Math.min(255, Math.floor(196 * s))},${Math.min(255, Math.floor(154 * s))},${Math.min(255, Math.floor(96 * s))})`
    ctx.fillRect(0, y, 512, 64)
    ctx.strokeStyle = 'rgba(130,90,40,0.22)'; ctx.lineWidth = 1
    for (let i = 0; i < 9; i++) {
      const yl = y + Math.random() * 64
      ctx.beginPath(); ctx.moveTo(0, yl)
      ctx.bezierCurveTo(150, yl + (Math.random() - .5) * 10, 360, yl + (Math.random() - .5) * 10, 512, yl + (Math.random() - .5) * 6)
      ctx.stroke()
    }
    ctx.strokeStyle = 'rgba(100,65,25,0.4)'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke()
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

function drawerFrontTex(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 256; c.height = 128
  const ctx = c.getContext('2d')!
  const grad = ctx.createLinearGradient(0, 0, 0, 128)
  grad.addColorStop(0, '#d4a86a')
  grad.addColorStop(0.5, '#c89858')
  grad.addColorStop(1, '#b88a48')
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 256, 128)
  ctx.strokeStyle = 'rgba(100,60,20,0.3)'; ctx.lineWidth = 2
  for (let i = 0; i < 256; i += 8) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 3, 128); ctx.stroke()
  }
  ctx.strokeStyle = 'rgba(180,120,60,0.4)'; ctx.lineWidth = 1
  ctx.strokeRect(8, 8, 240, 112)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function Plant() {
  const leaves = [
    { p: [0, 0.16, 0] as [number, number, number], s: 1.0, c: '#4a8a3a', r: [0.3, 0, 0] as [number, number, number] },
    { p: [0.045, 0.14, 0.02] as [number, number, number], s: 0.75, c: '#5a9a42', r: [0.5, 0.5, 0.2] as [number, number, number] },
    { p: [-0.04, 0.15, -0.025] as [number, number, number], s: 0.7, c: '#4a8a3a', r: [0.4, -0.4, -0.15] as [number, number, number] },
    { p: [0.01, 0.19, -0.035] as [number, number, number], s: 0.6, c: '#5a9a42', r: [0.6, 0.2, 0.1] as [number, number, number] },
    { p: [-0.025, 0.12, 0.04] as [number, number, number], s: 0.65, c: '#4a8a3a', r: [0.2, 0.6, 0.3] as [number, number, number] },
    { p: [0.03, 0.11, -0.01] as [number, number, number], s: 0.55, c: '#5a9a42', r: [0.1, 0.3, -0.2] as [number, number, number] },
  ]
  return (
    <group>
      <mesh position={[0, 0.045, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.058, 0.044, 0.09, 24]} />
        <meshStandardMaterial color="#b06840" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.092, 0]} castShadow>
        <torusGeometry args={[0.059, 0.01, 8, 24]} />
        <meshStandardMaterial color="#a05830" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.085, 0]}>
        <cylinderGeometry args={[0.053, 0.053, 0.008, 24]} />
        <meshStandardMaterial color="#2a1a10" roughness={0.95} />
      </mesh>
      {leaves.map((l, i) => (
        <mesh key={i} position={l.p} scale={[l.s, l.s * 1.3, l.s]} rotation={l.r} castShadow>
          <sphereGeometry args={[0.038, 8, 8]} />
          <meshStandardMaterial color={l.c} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

function PhotoFrame() {
  const FW = 0.14, FH = 0.18, FT = 0.014, FB = 0.005
  const M = <meshStandardMaterial color="#8a6a3a" roughness={0.5} metalness={0.1} />
  return (
    <group rotation={[0.1, 0, 0.03]}>
      <mesh position={[0, 0, -FB / 2]} castShadow>
        <boxGeometry args={[FW, FH, FB]} />{M}
      </mesh>
      <mesh position={[0, 0, 0.001]}>
        <planeGeometry args={[FW - 0.026, FH - 0.026]} />
        <meshStandardMaterial color="#080808" roughness={0.9} />
      </mesh>
      <mesh position={[0, FH / 2 - 0.007, 0]} castShadow>
        <boxGeometry args={[FW, 0.014, FT]} />{M}
      </mesh>
      <mesh position={[0, -FH / 2 + 0.007, 0]} castShadow>
        <boxGeometry args={[FW, 0.014, FT]} />{M}
      </mesh>
      <mesh position={[-FW / 2 + 0.007, 0, 0]} castShadow>
        <boxGeometry args={[0.014, FH, FT]} />{M}
      </mesh>
      <mesh position={[FW / 2 - 0.007, 0, 0]} castShadow>
        <boxGeometry args={[0.014, FH, FT]} />{M}
      </mesh>
    </group>
  )
}

function DrawerKnob() {
  return (
    <group position={[0, 0, 0.022]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.014, 0.016, 0.012, 16]} />
        <meshStandardMaterial color="#d4a843" roughness={0.25} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.008]} castShadow>
        <cylinderGeometry args={[0.022, 0.024, 0.006, 16]} />
        <meshStandardMaterial color="#c9a040" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0, -0.004]} castShadow>
        <cylinderGeometry args={[0.01, 0.01, 0.012, 12]} />
        <meshStandardMaterial color="#8a6a20" roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  )
}

export function Nightstand() {
  const [open, setOpen] = useState(false)
  const drawerRef = useRef<THREE.Group>(null)
  const drawerProg = useRef(0)
  const wt = useMemo(() => woodTex(), [])
  const dft = useMemo(() => drawerFrontTex(), [])
  const W = <meshStandardMaterial map={wt} roughness={0.58} metalness={0.05} />

  useFrame((_, dt) => {
    if (!drawerRef.current) return
    const target = open ? 1 : 0
    drawerProg.current += (target - drawerProg.current) * Math.min(dt * 4, 1)
    drawerRef.current.position.z = -NS_D / 2 - drawerProg.current * DRAWER_SLIDE
  })

  const drawerY = NS_H - WALL_T - DRAWER_GAP - DRAWER_H / 2
  const lowerPanelH = drawerY - DRAWER_H / 2 - DRAWER_GAP - WALL_T
  const lowerPanelY = WALL_T + lowerPanelH / 2

  return (
    <group position={[NS_X, 0, NS_Z]} rotation={[0, -Math.PI / 2, 0]} scale={NS_SCALE}>
      {/* Top surface */}
      <mesh position={[0, NS_H - WALL_T / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[NS_W, WALL_T, NS_D]} />{W}
      </mesh>
      {/* Decorative top trim */}
      <mesh position={[0, NS_H - WALL_T - 0.008, NS_D / 2 - 0.004]} castShadow>
        <boxGeometry args={[NS_W + 0.02, 0.016, 0.012]} />
        <meshStandardMaterial color="#a07840" roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[0, NS_H - WALL_T - 0.008, -NS_D / 2 + 0.004]} castShadow>
        <boxGeometry args={[NS_W + 0.02, 0.016, 0.012]} />
        <meshStandardMaterial color="#a07840" roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[-NS_W / 2 - 0.004, NS_H - WALL_T - 0.008, 0]} castShadow>
        <boxGeometry args={[0.012, 0.016, NS_D + 0.02]} />
        <meshStandardMaterial color="#a07840" roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[NS_W / 2 + 0.004, NS_H - WALL_T - 0.008, 0]} castShadow>
        <boxGeometry args={[0.012, 0.016, NS_D + 0.02]} />
        <meshStandardMaterial color="#a07840" roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Bottom panel */}
      <mesh position={[0, WALL_T / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[NS_W, WALL_T, NS_D]} />{W}
      </mesh>
      {/* Back panel */}
      <mesh position={[0, NS_H / 2, NS_D / 2 - WALL_T / 2]} castShadow>
        <boxGeometry args={[NS_W, NS_H - 2 * WALL_T, WALL_T]} />{W}
      </mesh>
      {/* Left side panel */}
      <mesh position={[-NS_W / 2 + WALL_T / 2, NS_H / 2, 0]} castShadow>
        <boxGeometry args={[WALL_T, NS_H - 2 * WALL_T, NS_D - 2 * WALL_T]} />{W}
      </mesh>
      {/* Right side panel */}
      <mesh position={[NS_W / 2 - WALL_T / 2, NS_H / 2, 0]} castShadow>
        <boxGeometry args={[WALL_T, NS_H - 2 * WALL_T, NS_D - 2 * WALL_T]} />{W}
      </mesh>
      {/* Lower front panel with accent color */}
      <mesh position={[0, lowerPanelY, -NS_D / 2 + WALL_T / 2]} castShadow>
        <boxGeometry args={[NS_W - 2 * WALL_T, lowerPanelH, WALL_T]} />
        <meshStandardMaterial color="#7a5a3a" roughness={0.6} metalness={0.05} />
      </mesh>
      {/* Decorative inlay strip on lower panel */}
      <mesh position={[0, lowerPanelY + lowerPanelH * 0.3, -NS_D / 2 + 0.014]} castShadow>
        <boxGeometry args={[NS_W - 2 * WALL_T - 0.04, 0.008, 0.004]} />
        <meshStandardMaterial color="#c9a843" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0, lowerPanelY - lowerPanelH * 0.3, -NS_D / 2 + 0.014]} castShadow>
        <boxGeometry args={[NS_W - 2 * WALL_T - 0.04, 0.008, 0.004]} />
        <meshStandardMaterial color="#c9a843" roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Legs */}
      {([[-NS_W / 2 + 0.04, -NS_D / 2 + 0.04], [NS_W / 2 - 0.04, -NS_D / 2 + 0.04], [-NS_W / 2 + 0.04, NS_D / 2 - 0.04], [NS_W / 2 - 0.04, NS_D / 2 - 0.04]] as [number, number][]).map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.015, lz]} castShadow>
          <boxGeometry args={[0.04, 0.03, 0.04]} />
          <meshStandardMaterial color="#5a3a20" roughness={0.5} metalness={0.15} />
        </mesh>
      ))}

      {/* Drawer */}
      <group ref={drawerRef} position={[0, drawerY, -NS_D / 2]}>
        {/* Invisible click target */}
        <mesh position={[0, 0, -0.03]} onClick={(e) => { e.stopPropagation(); setOpen(v => !v) }} onPointerOver={() => { document.body.style.cursor = 'pointer' }} onPointerOut={() => { document.body.style.cursor = 'auto' }}>
          <boxGeometry args={[NS_W + 0.06, DRAWER_H + 0.06, 0.08]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        {/* Drawer front face with wood texture */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[NS_W - 0.008, DRAWER_H, 0.018]} />
          <meshStandardMaterial map={dft} roughness={0.55} metalness={0.05} />
        </mesh>
        {/* Decorative frame around drawer front */}
        <mesh position={[0, DRAWER_H / 2 - 0.006, 0.005]} castShadow>
          <boxGeometry args={[NS_W - 0.02, 0.006, 0.006]} />
          <meshStandardMaterial color="#a07840" roughness={0.5} metalness={0.1} />
        </mesh>
        <mesh position={[0, -DRAWER_H / 2 + 0.006, 0.005]} castShadow>
          <boxGeometry args={[NS_W - 0.02, 0.006, 0.006]} />
          <meshStandardMaterial color="#a07840" roughness={0.5} metalness={0.1} />
        </mesh>
        <mesh position={[-NS_W / 2 + 0.012, 0, 0.005]} castShadow>
          <boxGeometry args={[0.006, DRAWER_H - 0.012, 0.006]} />
          <meshStandardMaterial color="#a07840" roughness={0.5} metalness={0.1} />
        </mesh>
        <mesh position={[NS_W / 2 - 0.012, 0, 0.005]} castShadow>
          <boxGeometry args={[0.006, DRAWER_H - 0.012, 0.006]} />
          <meshStandardMaterial color="#a07840" roughness={0.5} metalness={0.1} />
        </mesh>
        {/* Drawer knob */}
        <DrawerKnob />
        {/* Drawer sides */}
        <mesh position={[-(NS_W - 0.06) / 2, 0, 0.08]} castShadow>
          <boxGeometry args={[0.01, DRAWER_H - 0.02, 0.16]} />{W}
        </mesh>
        <mesh position={[(NS_W - 0.06) / 2, 0, 0.08]} castShadow>
          <boxGeometry args={[0.01, DRAWER_H - 0.02, 0.16]} />{W}
        </mesh>
        <mesh position={[0, -DRAWER_H / 2 + 0.01, 0.08]} castShadow>
          <boxGeometry args={[NS_W - 0.06, 0.01, 0.16]} />{W}
        </mesh>
        {/* Drawer back */}
        <mesh position={[0, 0, 0.16]} castShadow>
          <boxGeometry args={[NS_W - 0.06, DRAWER_H - 0.02, 0.01]} />{W}
        </mesh>
      </group>

      {/* Items on top */}
      <group position={[0, NS_H, 0]}>
        <group position={[-0.13, 0, -0.02]}>
          <Plant />
        </group>
        <group position={[0.12, 0.09, 0.03]}>
          <PhotoFrame />
        </group>
      </group>
    </group>
  )
}
