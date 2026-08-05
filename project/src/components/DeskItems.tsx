import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

const DESK_W = 2.8, DESK_D = 1.7, DESK_H = 1.377, TOP_T = 0.045, LEG_T = 0.06
const LEG_H = DESK_H - TOP_T
const DESK_SURFACE = LEG_H + TOP_T
const GRP_X = 4.5, GRP_Z = DESK_D / 2 + 0.06

// ── Birthday Cake ──────────────────────────────────────────────
export function BirthdayCake() {
  const flameRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (flameRef.current) {
      flameRef.current.scale.y = 1 + Math.sin(t * 8) * 0.12
      flameRef.current.scale.x = 1 + Math.cos(t * 6) * 0.08
      flameRef.current.rotation.z = Math.sin(t * 5) * 0.05
    }
    if (lightRef.current) {
      lightRef.current.intensity = 0.5 + Math.sin(t * 10) * 0.08
    }
  })

  const CAKE_X = -0.55, CAKE_Z = -0.20
  const R = 0.13, H = 0.10

  return (
    <group position={[CAKE_X, DESK_SURFACE, CAKE_Z]}>
      {/* Plate */}
      <mesh position={[0, 0.005, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[R + 0.04, R + 0.04, 0.012, 24]} />
        <meshStandardMaterial color="#f0ede8" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Cake base layer */}
      <mesh position={[0, H / 2 + 0.012, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[R, R, H, 24]} />
        <meshStandardMaterial color="#f5d0c8" roughness={0.7} />
      </mesh>
      {/* Frosting drips — torus around top rim */}
      <mesh position={[0, H + 0.012, 0]}>
        <torusGeometry args={[R, 0.018, 8, 32]} />
        <meshStandardMaterial color="#fff0ee" roughness={0.5} />
      </mesh>
      {/* Top frosting layer */}
      <mesh position={[0, H + 0.022, 0]} castShadow>
        <cylinderGeometry args={[R - 0.01, R, 0.03, 24]} />
        <meshStandardMaterial color="#fff0ee" roughness={0.5} />
      </mesh>
      {/* Candle */}
      <mesh position={[0, H + 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.05, 8]} />
        <meshStandardMaterial color="#e8d0e0" roughness={0.4} />
      </mesh>
      {/* Wick */}
      <mesh position={[0, H + 0.09, 0]}>
        <cylinderGeometry args={[0.002, 0.002, 0.008, 4]} />
        <meshStandardMaterial color="#3a3028" roughness={0.9} />
      </mesh>
      {/* Flame */}
      <mesh ref={flameRef} position={[0, H + 0.105, 0]}>
        <coneGeometry args={[0.012, 0.035, 8]} />
        <meshStandardMaterial
          color="#ffaa30"
          emissive="#ff8020"
          emissiveIntensity={1.5}
          roughness={0.2}
        />
      </mesh>
      {/* Flame glow */}
      <pointLight ref={lightRef} position={[0, H + 0.11, 0]} color="#ffb050" intensity={0.5} distance={1.5} decay={2} />
    </group>
  )
}

// ── Envelope ───────────────────────────────────────────────────
const ENV_W = 0.28, ENV_H = 0.19, ENV_D = 0.006

export function Envelope({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const flapRef = useRef<THREE.Group>(null)
  const letterRef = useRef<THREE.Group>(null)

  useFrame((_, dt) => {
    if (flapRef.current) {
      const target = open ? -2.4 : 0
      flapRef.current.rotation.x += (target - flapRef.current.rotation.x) * Math.min(dt * 6, 1)
    }
    if (letterRef.current) {
      const target = open ? 0.14 : 0.0
      letterRef.current.position.y += (target - letterRef.current.position.y) * Math.min(dt * 5, 1)
      const rotTarget = open ? -0.3 : 0
      letterRef.current.rotation.x += (rotTarget - letterRef.current.rotation.x) * Math.min(dt * 5, 1)
    }
  })

  const ENV_X = 0.30, ENV_Z = -0.25
  const PAPER = <meshStandardMaterial color="#f8f5ee" roughness={0.85} side={THREE.DoubleSide} />
  const ENV_COL = <meshStandardMaterial color="#e8dcc0" roughness={0.8} side={THREE.DoubleSide} />
  const WAX = <meshStandardMaterial color="#c84040" roughness={0.3} metalness={0.1} />

  return (
    <group position={[ENV_X, DESK_SURFACE + 0.01, ENV_Z]}>
      {/* Envelope body — flat box */}
      <mesh castShadow receiveShadow
        onClick={(e) => { e.stopPropagation(); onToggle() }}
        onPointerOver={() => { document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = 'auto' }}>
        <boxGeometry args={[ENV_W, ENV_H, ENV_D]} />
        {ENV_COL}
      </mesh>

      {/* Envelope front flaps (triangles via scaled boxes) */}
      {/* Bottom flap */}
      <mesh position={[0, -ENV_H * 0.25, ENV_D / 2 + 0.001]} rotation={[0, 0, 0]}>
        <planeGeometry args={[ENV_W, ENV_H * 0.5]} />
        {ENV_COL}
      </mesh>

      {/* Letter — slides up when open */}
      <group ref={letterRef} position={[0, 0, 0]}>
        <mesh position={[0, 0, -ENV_D / 2 - 0.003]} castShadow>
          <planeGeometry args={[ENV_W - 0.02, ENV_H - 0.02]} />
          {PAPER}
        </mesh>
        {/* Heart seal on letter */}
        <mesh position={[0, 0, -ENV_D / 2 - 0.005]}>
          <circleGeometry args={[0.018, 16]} />
          {WAX}
        </mesh>
      </group>

      {/* Top flap — rotates open */}
      <group ref={flapRef} position={[0, ENV_H / 2, 0]}>
        <mesh position={[0, -ENV_H / 4, 0]} castShadow>
          <planeGeometry args={[ENV_W, ENV_H / 2]} />
          {ENV_COL}
        </mesh>
      </group>
    </group>
  )
}
