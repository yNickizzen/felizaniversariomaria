import { useMemo, useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame, useLoader } from '@react-three/fiber'
import pillowAssetUrl from './almofadaimagem.jpg'
import { pillowGeo } from './Bed'

// Box dimensions — large shipping box
const BOX_W = 1.30
const BOX_D = 1.10
const BOX_H = 0.76
const WALL = 0.03
const LID_T = 0.04

// Pillow uses the same geometry as the bed pillow (exported from Bed.tsx)
const PILLOW_W = 0.44
const PILLOW_H = 0.76
const PILLOW_T = 0.13
const PILLOW_OFFSET_X = 0.30

function cardboardTex(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 512; c.height = 512
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#c9a06b'
  ctx.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 2400; i++) {
    const x = Math.random() * 512, y = Math.random() * 512
    ctx.fillStyle = `rgba(${150 + Math.random() * 30},${100 + Math.random() * 25},${50 + Math.random() * 20},${Math.random() * 0.3})`
    ctx.fillRect(x, y, 2, 1)
  }
  ctx.strokeStyle = 'rgba(100,60,25,0.12)'
  ctx.lineWidth = 1
  for (let y = 0; y < 512; y += 8) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke()
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

function shippingLabelTex(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 512; c.height = 256
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#f5f0e6'
  ctx.fillRect(0, 0, 512, 256)
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 3
  ctx.strokeRect(8, 8, 496, 240)
  ctx.fillStyle = '#222'
  ctx.font = 'bold 22px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('ENCOMENDA', 256, 38)
  ctx.font = '14px monospace'
  ctx.fillText('Para: Meu amor', 256, 68)
  ctx.fillText('De: Seu namorado', 256, 90)
  ctx.fillStyle = '#000'
  let bx = 60
  for (let i = 0; i < 40; i++) {
    const w = Math.random() > 0.5 ? 3 : 1
    ctx.fillRect(bx, 120, w, 80)
    bx += w + 2
  }
  ctx.font = '12px monospace'
  ctx.fillText('FRAGIL · SURPRESA DENTRO', 256, 225)
  const t = new THREE.CanvasTexture(c)
  t.needsUpdate = true
  return t
}

function preparePillowPhoto(source: THREE.Texture): THREE.Texture {
  const texture = source.clone()
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping

  // almofadaimagem.jpg is 4160×3055 (landscape); pillow face is portrait (0.44×0.76).
  // Rotate 90° CW so the landscape photo matches the portrait face, then "cover"
  // (fill entire face, crop excess) to preserve aspect ratio without distortion.
  const img = source.image as { width?: number; height?: number } | undefined
  const imgW = img?.width || 4160
  const imgH = img?.height || 3055
  const rotatedAspect = imgH / imgW // w/h after 90° rotation
  const faceAspect = PILLOW_W / PILLOW_H
  const range = faceAspect / rotatedAspect // fraction of rotated width shown
  const offset = (1 - range) / 2

  // Geometry UVs are raw shape coords: u in [-PILLOW_W/2, PILLOW_W/2], v in [-PILLOW_H/2, PILLOW_H/2]
  // Combined transform: normalize → rotate 90° CW → cover
  //   s = (v/PILLOW_H + 0.5) * range + offset  →  v * (range/PILLOW_H) + 0.5
  //   t = 1 - (u/PILLOW_W + 0.5)              →  -u / PILLOW_W + 0.5
  texture.matrix.set(
    0, range / PILLOW_H, 0.5,
    -1 / PILLOW_W, 0, 0.5,
    0, 0, 1
  )
  texture.matrixAutoUpdate = false
  texture.needsUpdate = true
  return texture
}

function polkaDotTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 256; c.height = 256
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#e8a4be'
  ctx.fillRect(0, 0, 256, 256)
  ctx.fillStyle = '#ffffff'
  for (let y = 16; y < 256; y += 32) {
    for (let x = 16; x < 256; x += 32) {
      ctx.beginPath()
      ctx.arc(x + (Math.floor((y / 32) % 2) * 16), y, 4, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(2, 3)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function playOpenSound() {
  try {
    const ac = new AudioContext()
    const now = ac.currentTime
    const o = ac.createOscillator()
    const g = ac.createGain()
    o.type = 'triangle'
    o.frequency.setValueAtTime(220, now)
    o.frequency.exponentialRampToValueAtTime(80, now + 0.15)
    g.gain.setValueAtTime(0.3, now)
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
    o.connect(g); g.connect(ac.destination)
    o.start(now); o.stop(now + 0.25)
    const o2 = ac.createOscillator()
    const g2 = ac.createGain()
    o2.type = 'sine'
    o2.frequency.setValueAtTime(523, now + 0.1)
    o2.frequency.linearRampToValueAtTime(784, now + 0.4)
    g2.gain.setValueAtTime(0, now + 0.1)
    g2.gain.linearRampToValueAtTime(0.15, now + 0.15)
    g2.gain.exponentialRampToValueAtTime(0.001, now + 0.5)
    o2.connect(g2); g2.connect(ac.destination)
    o2.start(now + 0.1); o2.stop(now + 0.55)
  } catch (_) {}
}

// Sasuke pillow — rises out of the box when opened
function SasukePillow({ opened }: { opened: boolean }) {
  const ref = useRef<THREE.Group>(null)
  const prog = useRef(0)
  const sourceTexture = useLoader(THREE.TextureLoader, pillowAssetUrl)
  const pillowTex = useMemo(() => preparePillowPhoto(sourceTexture), [sourceTexture])
  const geometry = useMemo(() => pillowGeo(), [])
  const dotsTex = useMemo(() => polkaDotTexture(), [])

  const photoMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: pillowTex, roughness: 0.85, side: THREE.FrontSide }),
    [pillowTex]
  )
  const dotsMat = useMemo(
    () => new THREE.MeshStandardMaterial({ map: dotsTex, roughness: 0.95, side: THREE.DoubleSide }),
    [dotsTex]
  )

  useFrame((_, dt) => {
    if (!ref.current) return
    const target = opened ? 1 : 0
    prog.current += (target - prog.current) * Math.min(dt * 3.5, 1)
    const p = prog.current
    const startY = WALL + 0.01
    const endY = WALL + PILLOW_T / 2 + 0.02
    ref.current.position.y = startY + (endY - startY) * p
    const s = 0.3 + p * 0.7
    ref.current.scale.setScalar(s)
    ref.current.rotation.x = -Math.PI / 2 + Math.sin(p * Math.PI * 2) * 0.03 * Math.exp(-p * 2)
    ref.current.rotation.z = Math.sin(p * Math.PI * 3) * 0.04 * Math.exp(-p * 2.5)
  })

  return (
    <group ref={ref} position={[PILLOW_OFFSET_X, WALL + 0.08, 0]} scale={0.3}>
      {/* Body — Sasuke photo on large faces, pink polka dots on the sides */}
      <mesh geometry={geometry} castShadow receiveShadow material={[photoMat, dotsMat]} />
    </group>
  )
}

export function SurpriseBox({
  unlockDate,
  onLockedClick,
}: {
  unlockDate: Date
  onLockedClick: () => void
}) {
  const [opened, setOpened] = useState(false)
  const [boxVisible, setBoxVisible] = useState(true)
  const [canOpen, setCanOpen] = useState(false)
  const lidRef = useRef<THREE.Group>(null)
  const lidProg = useRef(0)

  const cardboard = useMemo(() => cardboardTex(), [])
  const label = useMemo(() => shippingLabelTex(), [])

  useEffect(() => {
    const check = () => setCanOpen(Date.now() >= unlockDate.getTime())
    check()
    const timer = window.setInterval(check, 1000)
    return () => window.clearInterval(timer)
  }, [unlockDate])

  useFrame((_, dt) => {
    if (lidRef.current) {
      const target = opened ? 1 : 0
      lidProg.current += (target - lidProg.current) * Math.min(dt * 3, 1)
      const p = lidProg.current
      // Lid flies up and tilts to the side
      lidRef.current.position.y = BOX_H + p * 0.55
      lidRef.current.position.x = p * 0.15
      lidRef.current.rotation.x = -p * 0.5
      lidRef.current.rotation.z = p * 0.3
    }
  })

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    if (!canOpen) {
      onLockedClick()
      return
    }
    if (!opened) {
      setOpened(true)
      playOpenSound()
      window.setTimeout(() => setBoxVisible(false), 1800)
    }
  }

  const boxMat = <meshStandardMaterial map={cardboard} roughness={0.85} metalness={0} />

  return (
    <group position={[0, 0, 0]} onClick={handleClick}
      onPointerOver={() => { document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'auto' }}>
      {boxVisible && <group>
      {/* Box body (5 faces, open top) */}
      <mesh position={[0, WALL / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[BOX_W, WALL, BOX_D]} />
        {boxMat}
      </mesh>
      {/* Front (+Z) with shipping label */}
      <mesh position={[0, BOX_H / 2, BOX_D / 2 - WALL / 2]} castShadow>
        <boxGeometry args={[BOX_W, BOX_H, WALL]} />
        <meshStandardMaterial map={label} roughness={0.7} />
      </mesh>
      {/* Back (-Z) */}
      <mesh position={[0, BOX_H / 2, -BOX_D / 2 + WALL / 2]} castShadow>
        <boxGeometry args={[BOX_W, BOX_H, WALL]} />
        {boxMat}
      </mesh>
      {/* Left (-X) */}
      <mesh position={[-BOX_W / 2 + WALL / 2, BOX_H / 2, 0]} castShadow>
        <boxGeometry args={[WALL, BOX_H, BOX_D]} />
        {boxMat}
      </mesh>
      {/* Right (+X) */}
      <mesh position={[BOX_W / 2 - WALL / 2, BOX_H / 2, 0]} castShadow>
        <boxGeometry args={[WALL, BOX_H, BOX_D]} />
        {boxMat}
      </mesh>

      {/* Packing tape strips */}
      <mesh position={[0, BOX_H + 0.002, 0]}>
        <boxGeometry args={[0.10, 0.006, BOX_D + 0.04]} />
        <meshStandardMaterial color="#d4c898" roughness={0.6} transparent opacity={0.75} />
      </mesh>

      {/* Lid — flies up when opened */}
      <group ref={lidRef} position={[0, BOX_H, 0]}>
        <mesh position={[0, LID_T / 2, 0]} castShadow>
          <boxGeometry args={[BOX_W + 0.03, LID_T, BOX_D + 0.03]} />
          {boxMat}
        </mesh>
        {/* Tape on lid */}
        <mesh position={[0, LID_T + 0.001, 0]}>
          <boxGeometry args={[0.10, 0.005, BOX_D + 0.03]} />
          <meshStandardMaterial color="#d4c898" roughness={0.6} transparent opacity={0.75} />
        </mesh>
      </group>

      {/* "FRAGILE" stamp on top when closed */}
      {!opened && (
        <mesh position={[0, BOX_H + LID_T + 0.003, 0]} rotation={[-Math.PI / 2, 0, 0.12]}>
          <planeGeometry args={[0.60, 0.24]} />
          <meshStandardMaterial color="#c8302a" transparent opacity={0.85} roughness={0.7} />
        </mesh>
      )}
      </group>}
      <SasukePillow opened={opened} />
    </group>
  )
}
