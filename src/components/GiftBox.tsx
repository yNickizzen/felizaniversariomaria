import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

const S = 0.40
const LID_T = 0.024
const WALL = 0.018
const RW = 0.048   // ribbon width
const RT = 0.009   // ribbon thickness

// Match Bed.tsx constants
const BED_LEN = 3.2, LEG_H = 0.33, FRAME_H = 0.39, MATT_H = 0.255, BED_WID = 1.8
const ROOM_D = 6.5
// Raise above blanket surface
const BED_TOP = LEG_H + FRAME_H + MATT_H + 0.045
const BED_GRP_X = 0.13 + BED_LEN / 2
const BED_GRP_Z = ROOM_D - 0.03 - BED_WID / 2
const BOX_POS: [number, number, number] = [
  BED_GRP_X + BED_LEN / 2 - S / 2 - 0.14,
  BED_TOP,
  BED_GRP_Z - 0.22,
]

function makeBoxTex(variant: 'side' | 'front' | 'top'): THREE.CanvasTexture {
  const W = 512, H = 512
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')!

  // White background
  ctx.fillStyle = '#f8f7f3'
  ctx.fillRect(0, 0, W, H)

  // Faint ruled lines matching the paper look
  ctx.strokeStyle = 'rgba(160,148,138,0.28)'
  ctx.lineWidth = 0.9
  const lineH = 28
  for (let y = 0; y < H; y += lineH) {
    ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); ctx.stroke()
  }

  // Larger cursive "eu te amo, " — 2x the previous size
  ctx.fillStyle = 'rgba(22,20,40,0.82)'
  ctx.font = 'italic 18px Georgia, "Times New Roman", serif'
  const phrase = 'eu te amo, '
  const line = phrase.repeat(8)
  for (let row = 0; row < 19; row++) {
    const y = row * lineH + 18
    const ox = (row % 2 === 0) ? 0 : -38
    ctx.fillText(line, ox, y)
  }

  if (variant === 'front') {
    const cx = W / 2, cy = H * 0.46
    const r = 180  // big heart — fills most of the face

    // Clip to heart and flood with the same background — erases the text inside
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(cx, cy + r * 0.78)
    ctx.bezierCurveTo(cx - r * 0.46, cy + r * 1.08, cx - r * 1.22, cy + r * 0.14, cx - r * 1.02, cy - r * 0.28)
    ctx.bezierCurveTo(cx - r * 0.82, cy - r * 0.84, cx - r * 0.22, cy - r * 1.02, cx, cy - r * 0.48)
    ctx.bezierCurveTo(cx + r * 0.22, cy - r * 1.02, cx + r * 0.82, cy - r * 0.84, cx + r * 1.02, cy - r * 0.28)
    ctx.bezierCurveTo(cx + r * 1.22, cy + r * 0.14, cx + r * 0.46, cy + r * 1.08, cx, cy + r * 0.78)
    ctx.closePath()
    ctx.clip()
    // Fill with the exact same background color — clears all text inside
    ctx.fillStyle = '#f8f7f3'
    ctx.fillRect(0, 0, W, H)
    ctx.restore()

    // "N + M" in dark ink, centred inside the heart
    ctx.fillStyle = 'rgba(22,20,40,0.90)'
    ctx.font = 'italic bold 62px Georgia, "Times New Roman", serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('N + M', cx, cy + 14)
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
  }

  const t = new THREE.CanvasTexture(c)
  t.needsUpdate = true
  return t
}

function playPopSound() {
  try {
    const ac = new AudioContext()
    const now = ac.currentTime
    const o1 = ac.createOscillator()
    const g1 = ac.createGain()
    o1.type = 'sine'
    o1.frequency.setValueAtTime(480, now)
    o1.frequency.exponentialRampToValueAtTime(55, now + 0.18)
    g1.gain.setValueAtTime(0.55, now)
    g1.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
    o1.connect(g1); g1.connect(ac.destination)
    o1.start(now); o1.stop(now + 0.25)
    const o2 = ac.createOscillator()
    const g2 = ac.createGain()
    o2.type = 'sine'
    o2.frequency.setValueAtTime(160, now + 0.06)
    o2.frequency.exponentialRampToValueAtTime(540, now + 0.48)
    g2.gain.setValueAtTime(0, now + 0.06)
    g2.gain.linearRampToValueAtTime(0.22, now + 0.10)
    g2.gain.exponentialRampToValueAtTime(0.001, now + 0.52)
    o2.connect(g2); g2.connect(ac.destination)
    o2.start(now + 0.06); o2.stop(now + 0.55)
  } catch (_) {}
}

// Chibi Batman — starts sitting inside the box, pops out when opened
function BatmanPlushie({ open }: { open: boolean }) {
  const ref = useRef<THREE.Group>(null)
  const prog = useRef(0)

  useFrame((_, dt) => {
    if (!ref.current) return
    const target = open ? 1 : 0
    prog.current += (target - prog.current) * Math.min(dt * 5.5, 1)
    const p = prog.current
    // spring bounce on the way up
    const bounce = Math.sin(p * Math.PI * 2.8) * 0.028 * Math.exp(-p * 3.0)
    // feet start at 0 (floor of box interior), rise to 0.28 above floor (head clears rim)
    ref.current.position.y = p * 0.28 + bounce
  })

  const dark = <meshStandardMaterial color="#1e1e28" roughness={0.88}/>
  const gray = <meshStandardMaterial color="#42425a" roughness={0.84}/>
  const lgray = <meshStandardMaterial color="#5e5e78" roughness={0.80}/>
  const skin = <meshStandardMaterial color="#d4a07a" roughness={0.88}/>
  const wht = <meshStandardMaterial color="#cfe0ec" roughness={0.35}/>
  const gold = <meshStandardMaterial color="#b09018" roughness={0.45} metalness={0.4}/>

  return (
    // Group base sits at box floor level; batman height ~0.25 units fits inside closed box
    <group ref={ref} position={[0, 0, 0]}>
      {/* Cape panel behind body */}
      <mesh position={[0, 0.075, -0.045]} rotation={[0.18, 0, 0]}>
        <boxGeometry args={[0.200, 0.170, 0.008]}/>
        {dark}
      </mesh>
      <mesh position={[0, -0.010, -0.036]} rotation={[0.45, 0, 0]}>
        <boxGeometry args={[0.215, 0.036, 0.007]}/>
        {dark}
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.066, 0]} castShadow>
        <boxGeometry args={[0.115, 0.128, 0.080]}/>
        {gray}
      </mesh>
      {/* Chest armour */}
      <mesh position={[0, 0.073, 0.042]}>
        <boxGeometry args={[0.088, 0.088, 0.007]}/>
        {lgray}
      </mesh>
      {/* Bat logo */}
      <mesh position={[0, 0.076, 0.047]}>
        <boxGeometry args={[0.050, 0.021, 0.006]}/>
        {dark}
      </mesh>
      {/* Belt */}
      <mesh position={[0, 0.003, 0.042]}>
        <boxGeometry args={[0.115, 0.016, 0.007]}/>
        {gold}
      </mesh>
      {/* Arms */}
      <mesh position={[-0.075, 0.063, 0]} rotation={[0, 0, 0.28]}>
        <boxGeometry args={[0.052, 0.031, 0.031]}/>
        {dark}
      </mesh>
      <mesh position={[0.075, 0.063, 0]} rotation={[0, 0, -0.28]}>
        <boxGeometry args={[0.052, 0.031, 0.031]}/>
        {dark}
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.175, 0]} castShadow>
        <sphereGeometry args={[0.060, 14, 12]}/>
        {gray}
      </mesh>
      {/* Face skin */}
      <mesh position={[0, 0.167, 0.049]}>
        <boxGeometry args={[0.070, 0.040, 0.009]}/>
        {skin}
      </mesh>
      {/* Cowl over upper face */}
      <mesh position={[0, 0.180, 0.053]}>
        <boxGeometry args={[0.072, 0.025, 0.008]}/>
        {dark}
      </mesh>
      {/* White eyes */}
      <mesh position={[-0.020, 0.183, 0.059]}>
        <boxGeometry args={[0.017, 0.011, 0.004]}/>
        {wht}
      </mesh>
      <mesh position={[0.020, 0.183, 0.059]}>
        <boxGeometry args={[0.017, 0.011, 0.004]}/>
        {wht}
      </mesh>
      {/* Smile */}
      <mesh position={[0, 0.153, 0.057]}>
        <boxGeometry args={[0.024, 0.006, 0.004]}/>
        <meshStandardMaterial color="#b06060" roughness={0.9}/>
      </mesh>
      {/* Bat ears */}
      <mesh position={[-0.027, 0.228, -0.005]} rotation={[0.08, 0.12, -0.26]}>
        <coneGeometry args={[0.010, 0.036, 4]}/>
        {dark}
      </mesh>
      <mesh position={[0.027, 0.228, -0.005]} rotation={[0.08, -0.12, 0.26]}>
        <coneGeometry args={[0.010, 0.036, 4]}/>
        {dark}
      </mesh>
    </group>
  )
}

export function GiftBox() {
  const [open, setOpen] = useState(false)
  const lidRef = useRef<THREE.Group>(null)
  const lidProg = useRef(0)
  const LID_RISE = 0.48   // how far up the lid floats

  const sideTex = useMemo(() => makeBoxTex('side'), [])
  const frontTex = useMemo(() => makeBoxTex('front'), [])
  const topTex = useMemo(() => makeBoxTex('top'), [])

  useFrame((_, dt) => {
    if (!lidRef.current) return
    const target = open ? 1 : 0
    lidProg.current += (target - lidProg.current) * Math.min(dt * 3.5, 1)
    // Lid translates straight up
    lidRef.current.position.y = S + lidProg.current * LID_RISE
  })

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    const next = !open
    setOpen(next)
    if (next) playPopSound()
  }

  const boxMat = (tex: THREE.CanvasTexture) => (
    <meshStandardMaterial map={tex} roughness={0.72} metalness={0.02}/>
  )
  const YEL = <meshStandardMaterial color="#ddc030" roughness={0.40} metalness={0.15}/>

  return (
    <group position={BOX_POS} rotation={[0, Math.PI / 2, 0]} onClick={handleClick}>
      {/* ── BOX BODY (5 faces, no top) ── */}
      <mesh position={[0, WALL / 2, 0]} receiveShadow>
        <boxGeometry args={[S, WALL, S]}/>
        {boxMat(sideTex)}
      </mesh>
      {/* Front face (+Z) — heart */}
      <mesh position={[0, S / 2, S / 2 - WALL / 2]} castShadow>
        <boxGeometry args={[S, S, WALL]}/>
        {boxMat(frontTex)}
      </mesh>
      {/* Back face (-Z) */}
      <mesh position={[0, S / 2, -S / 2 + WALL / 2]}>
        <boxGeometry args={[S, S, WALL]}/>
        {boxMat(sideTex)}
      </mesh>
      {/* Left (-X) */}
      <mesh position={[-S / 2 + WALL / 2, S / 2, 0]}>
        <boxGeometry args={[WALL, S, S]}/>
        {boxMat(sideTex)}
      </mesh>
      {/* Right (+X) */}
      <mesh position={[S / 2 - WALL / 2, S / 2, 0]} castShadow>
        <boxGeometry args={[WALL, S, S]}/>
        {boxMat(sideTex)}
      </mesh>

      {/* ── RIBBON — single vertical stripe on right face only ── */}
      {/* Right face (+X): vertical stripe running full height */}
      <mesh position={[S / 2 + 0.002, S / 2, 0]}>
        <boxGeometry args={[RT, S, RW]}/>
        {YEL}
      </mesh>
      {/* Left face (-X): the ribbon passes through on the other side */}
      <mesh position={[-S / 2 - 0.002, S / 2, 0]}>
        <boxGeometry args={[RT, S, RW]}/>
        {YEL}
      </mesh>

      {/* ── BATMAN inside — sits at floor, rises on open ── */}
      <group position={[0, WALL + 0.015, 0]}>
        <BatmanPlushie open={open}/>
      </group>

      {/* ── LID — translates straight upward ── */}
      <group ref={lidRef} position={[0, S, 0]}>
        {/* Lid panel */}
        <mesh position={[0, LID_T / 2, 0]} castShadow>
          <boxGeometry args={[S + WALL * 2, LID_T, S + WALL * 2]}/>
          {boxMat(topTex)}
        </mesh>
        {/* Ribbon stripe across lid (X direction, connecting left/right side stripes) */}
        <mesh position={[0, LID_T + 0.001, 0]}>
          <boxGeometry args={[S + WALL * 2, RT, RW]}/>
          {YEL}
        </mesh>
        {/* Bow — two paper-loop style half-toruses, sitting on lid */}
        <mesh position={[-0.054, LID_T + 0.030, 0]} rotation={[0, 0, 0.52]}>
          <torusGeometry args={[0.044, 0.019, 8, 24, Math.PI]}/>
          {YEL}
        </mesh>
        <mesh position={[0.054, LID_T + 0.030, 0]} rotation={[0, 0, -0.52]}>
          <torusGeometry args={[0.044, 0.019, 8, 24, Math.PI]}/>
          {YEL}
        </mesh>
        {/* Centre knot */}
        <mesh position={[0, LID_T + 0.006, 0]}>
          <sphereGeometry args={[0.021, 8, 8]}/>
          {YEL}
        </mesh>
        {/* Tails */}
        <mesh position={[-0.052, LID_T + 0.003, 0]} rotation={[0, 0, 0.36]}>
          <boxGeometry args={[0.062, 0.015, 0.013]}/>
          {YEL}
        </mesh>
        <mesh position={[0.052, LID_T + 0.003, 0]} rotation={[0, 0, -0.36]}>
          <boxGeometry args={[0.062, 0.015, 0.013]}/>
          {YEL}
        </mesh>
      </group>
    </group>
  )
}
