import { useTexture } from '@react-three/drei'
import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const POSTER_H = 1.1 * 1.4 * 1.2

export function Poster({ isNight }: { isNight: boolean }) {
  const lightRef = useRef<THREE.PointLight>(null)
  const target = useRef(0)
  const current = useRef(0)

  useEffect(() => { target.current = isNight ? 1 : 0 }, [isNight])

  useFrame((_, delta) => {
    const d = target.current - current.current
    if (Math.abs(d) < 0.001) { current.current = target.current; return }
    current.current += d * Math.min(delta * 3, 1)
    if (lightRef.current) {
      lightRef.current.intensity = 3.2 - current.current * 2.95
    }
  })

  const tex = useTexture('/3 copy copy.png', (t) => {
    t.colorSpace = THREE.SRGBColorSpace
    t.minFilter = THREE.LinearFilter
    t.magFilter = THREE.LinearFilter
    t.generateMipmaps = false
    t.anisotropy = 16
    t.needsUpdate = true
  })

  const posterWidth = useMemo(() => {
    const image = tex.image as HTMLImageElement
    return POSTER_H * (image.width / image.height)
  }, [tex])

  return (
    <group>
      <pointLight ref={lightRef} position={[5.6, 3.2, 1.8]} intensity={3.2} distance={3.5} decay={2} color="#ffe8c8" />
      <mesh position={[5.6, 2.95, 0.004]}>
        <planeGeometry args={[posterWidth, POSTER_H]} />
        <meshStandardMaterial map={tex} roughness={1} metalness={0} transparent alphaTest={0.05} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
