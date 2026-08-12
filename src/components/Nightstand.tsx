import { useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'
const photo = '/portaretrato.jpg'

const NIGHTSTAND_W = 0.88
const NIGHTSTAND_D = 0.72
const LEG_H = 0.18
const BODY_H = 0.82
const TOP_T = 0.09
const BODY_TOP = LEG_H + BODY_H
const TOP_Y = BODY_TOP + TOP_T / 2

function woodTex(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 512
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#9b6337'
  ctx.fillRect(0, 0, 512, 512)
  for (let row = 0; row < 10; row++) {
    const y = row * 52
    const shade = 0.9 + Math.random() * 0.12
    ctx.fillStyle = `rgb(${Math.floor(155 * shade)},${Math.floor(99 * shade)},${Math.floor(55 * shade)})`
    ctx.fillRect(0, y, 512, 52)
    ctx.strokeStyle = 'rgba(74,40,18,0.26)'
    ctx.lineWidth = 1.2
    for (let i = 0; i < 8; i++) {
      const lineY = y + Math.random() * 52
      ctx.beginPath()
      ctx.moveTo(0, lineY)
      ctx.bezierCurveTo(130, lineY + (Math.random() - 0.5) * 12, 360, lineY + (Math.random() - 0.5) * 12, 512, lineY + (Math.random() - 0.5) * 8)
      ctx.stroke()
    }
  }
  const texture = new THREE.CanvasTexture(c)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(1.8, 1.2)
  return texture
}

function FrameMaterial({ color, metalness = 0.1, roughness = 0.55 }: { color: string; metalness?: number; roughness?: number }) {
  return <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
}

export function Nightstand() {
  const wood = useMemo(() => woodTex(), [])
  const image = useLoader(THREE.TextureLoader, photo)
  const W = <meshStandardMaterial map={wood} roughness={0.58} metalness={0.05} />
  const drawerH = 0.21
  const drawerGap = 0.025
  const drawerFrontDepth = NIGHTSTAND_D / 2 + 0.018
  const firstDrawerY = LEG_H + 0.12
  const photoWidth = 0.28
  const photoHeight = 0.387

  return (
    <group position={[0.46, 0, 4.06]} rotation={[0, Math.PI / 2, 0]} >
      <mesh position={[0, LEG_H + BODY_H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[NIGHTSTAND_W, BODY_H, NIGHTSTAND_D]} />
        {W}
      </mesh>

      <mesh position={[0, TOP_Y, 0]} castShadow receiveShadow>
        <boxGeometry args={[NIGHTSTAND_W + 0.08, TOP_T, NIGHTSTAND_D + 0.08]} />
        {W}
      </mesh>
      <mesh position={[0, BODY_TOP + TOP_T + 0.018, 0]} castShadow>
        <boxGeometry args={[NIGHTSTAND_W + 0.02, 0.025, NIGHTSTAND_D + 0.02]} />
        <FrameMaterial color="#d2a15f" roughness={0.48} />
      </mesh>

      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (NIGHTSTAND_W / 2 - 0.035), LEG_H / 2, 0]} castShadow>
          <boxGeometry args={[0.09, LEG_H, NIGHTSTAND_D - 0.06]} />
          {W}
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={`back-${side}`} position={[side * (NIGHTSTAND_W / 2 - 0.035), LEG_H / 2, NIGHTSTAND_D / 2 - 0.05]} castShadow>
          <boxGeometry args={[0.09, LEG_H, 0.09]} />
          {W}
        </mesh>
      ))}

      {Array.from({ length: 3 }, (_, index) => {
        const y = firstDrawerY + index * (drawerH + drawerGap)
        return (
          <group key={index} position={[0, y, drawerFrontDepth]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[NIGHTSTAND_W - 0.07, drawerH, 0.055]} />
              {W}
            </mesh>
            <mesh position={[0, drawerH * 0.32, 0.035]} castShadow>
              <boxGeometry args={[NIGHTSTAND_W - 0.14, 0.018, 0.018]} />
              <FrameMaterial color="#75431f" roughness={0.6} />
            </mesh>
            <mesh position={[0, -drawerH * 0.32, 0.035]} castShadow>
              <boxGeometry args={[NIGHTSTAND_W - 0.14, 0.018, 0.018]} />
              <FrameMaterial color="#75431f" roughness={0.6} />
            </mesh>
            <mesh position={[0, 0, 0.065]} castShadow>
              <sphereGeometry args={[0.038, 16, 12]} />
              <FrameMaterial color="#c89b51" metalness={0.65} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0, 0.075]} castShadow>
              <sphereGeometry args={[0.018, 12, 10]} />
              <FrameMaterial color="#f0c878" metalness={0.55} roughness={0.25} />
            </mesh>
          </group>
        )
      })}

      <group position={[0.01, BODY_TOP + TOP_T + 0.035, 0.015]} rotation={[-0.10, 0, 0]}>
        <mesh position={[0, photoHeight / 2 + 0.08, 0]} castShadow>
          <boxGeometry args={[photoWidth + 0.12, photoHeight + 0.12, 0.065]} />
          <FrameMaterial color="#d0a15d" metalness={0.35} roughness={0.34} />
        </mesh>
        <mesh position={[0, photoHeight / 2 + 0.08, 0.038]}>
          <planeGeometry args={[photoWidth, photoHeight]} />
          <meshStandardMaterial map={image} roughness={0.72} metalness={0} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.045, -0.035]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <boxGeometry args={[photoWidth + 0.22, 0.15, 0.05]} />
          <FrameMaterial color="#b87b39" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.13, -0.08]} rotation={[-0.3, 0, 0]} castShadow>
          <boxGeometry args={[0.07, 0.26, 0.035]} />
          <FrameMaterial color="#8d572d" roughness={0.58} />
        </mesh>
      </group>
    </group>
  )
}
