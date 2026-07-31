import * as THREE from 'three'

function Triceratops({
  posX = 0,
  posZ = 0,
  rotY = 0,
  scale = 1,
}: {
  posX?: number
  posZ?: number
  rotY?: number
  scale?: number
}) {
  const body  = '#2e5c1a'
  const belly = '#3d7022'
  const horn  = '#c8a040'
  const frill = '#1a3a0e'
  const eye   = '#0a0a0a'
  const skin  = '#245016'

  const bL   = 0.30   // body length along Z
  const floorY = 0.09 // foot-to-center-of-leg distance

  // Convenience wrappers
  const M = (color: string, rough = 0.85) =>
    <meshStandardMaterial color={color} roughness={rough} />
  const MM = (color: string) =>
    <meshStandardMaterial color={color} roughness={0.85} side={THREE.DoubleSide} />

  return (
    <group position={[posX, 0, posZ]} rotation={[0, rotY, 0]} scale={scale}>

      {/* ── Legs ── */}
      {([-0.095, 0.095] as number[]).map((lx, xi) =>
        ([-bL * 0.34, bL * 0.34] as number[]).map((lz, zi) => (
          <group key={`lg${xi}${zi}`} position={[lx, 0, lz]}>
            {/* upper leg — cylinder */}
            <mesh position={[0, 0.064, 0]}>
              <cylinderGeometry args={[0.022, 0.026, 0.072, 10]} />
              {M(body)}
            </mesh>
            {/* lower leg — slightly narrower */}
            <mesh position={[0, 0.018, 0]}>
              <cylinderGeometry args={[0.018, 0.021, 0.036, 8]} />
              {M(skin)}
            </mesh>
            {/* foot pad */}
            <mesh position={[0, 0.005, 0.008]}>
              <boxGeometry args={[0.032, 0.010, 0.040]} />
              {M(skin)}
            </mesh>
          </group>
        ))
      )}

      {/* ── Main torso barrel (cylinder on its side) ── */}
      <mesh position={[0, floorY + 0.095, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.082, 0.092, bL, 16]} />
        {M(body)}
      </mesh>

      {/* ── Ribcage bulge — sphere centered on torso ── */}
      <mesh position={[0, floorY + 0.108, -0.02]}>
        <sphereGeometry args={[0.085, 14, 10]} />
        {M(body)}
      </mesh>

      {/* ── Hip sphere ── */}
      <mesh position={[0, floorY + 0.085, -bL * 0.40]}>
        <sphereGeometry args={[0.070, 12, 10]} />
        {M(body)}
      </mesh>

      {/* ── Shoulder sphere ── */}
      <mesh position={[0, floorY + 0.088, bL * 0.38]}>
        <sphereGeometry args={[0.072, 12, 10]} />
        {M(body)}
      </mesh>

      {/* ── Belly plate ── */}
      <mesh position={[0, floorY + 0.022, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.065, bL * 0.78, 14]} />
        {M(belly)}
      </mesh>

      {/* ── Back ridge bumps ── */}
      {([-0.12, -0.06, 0.01, 0.08] as number[]).map((rz, i) => (
        <mesh key={`rd${i}`} position={[0, floorY + 0.192, rz]}>
          <sphereGeometry args={[0.018, 8, 6]} />
          {M(frill)}
        </mesh>
      ))}

       {/* ── Tail — two tapered cylinders pointing backward (-Z) ── */}
      <mesh position={[0, floorY + 0.072, -bL * 0.60]} rotation={[-Math.PI / 2 - 0.12, 0, 0]}>
        <cylinderGeometry args={[0.024, 0.038, 0.12, 10]} />
        {M(body)}
      </mesh>
      <mesh position={[0, floorY + 0.040, -bL * 0.88]} rotation={[-Math.PI / 2 - 0.32, 0, 0]}>
        <cylinderGeometry args={[0.010, 0.022, 0.09, 8]} />
        {M(body)}
      </mesh>

      {/* ── Neck — angled cylinder ── */}
      <mesh
        position={[0, floorY + 0.165, bL * 0.50]}
        rotation={[-0.45, 0, 0]}
      >
        <cylinderGeometry args={[0.036, 0.048, 0.105, 12]} />
        {M(body)}
      </mesh>

      {/* ── Head box ── */}
      <mesh position={[0, floorY + 0.192, bL * 0.68]}>
        <boxGeometry args={[0.100, 0.072, 0.120]} />
        {M(body)}
      </mesh>

      {/* snout / beak */}
      <mesh position={[0, floorY + 0.172, bL * 0.68 + 0.082]}>
        <boxGeometry args={[0.055, 0.044, 0.058]} />
        {M(belly, 0.9)}
      </mesh>

      {/* ── Frill (flat shield behind head) ── */}
      <mesh
        position={[0, floorY + 0.255, bL * 0.58]}
        rotation={[-0.22, 0, 0]}
      >
        <boxGeometry args={[0.185, 0.135, 0.016]} />
        {MM(frill)}
      </mesh>

      {/* frill rim — thin torus standing upright */}
      <mesh position={[0, floorY + 0.256, bL * 0.58]} rotation={[Math.PI / 2 - 0.22, 0, 0]}>
        <torusGeometry args={[0.088, 0.008, 6, 20, Math.PI]} />
        {M(skin)}
      </mesh>

      {/* frill bumps */}
      {([-0.060, 0, 0.060] as number[]).map((ox, i) => (
        <mesh key={`fb${i}`} position={[ox, floorY + 0.358, bL * 0.56]} rotation={[-0.22, 0, 0]}>
          <coneGeometry args={[0.012, 0.038, 5]} />
          {M(horn, 0.7)}
        </mesh>
      ))}

      {/* ── Horns ── */}
      {/* nose horn */}
      <mesh
        position={[0, floorY + 0.208, bL * 0.68 + 0.098]}
        rotation={[-0.45, 0, 0]}
      >
        <cylinderGeometry args={[0.007, 0.014, 0.065, 8]} />
        {M(horn, 0.6)}
      </mesh>

      {/* brow horns */}
      {([-0.034, 0.034] as number[]).map((ox, i) => (
        <mesh
          key={`bh${i}`}
          position={[ox, floorY + 0.248, bL * 0.65]}
          rotation={[-0.55, 0, 0]}
        >
          <cylinderGeometry args={[0.006, 0.012, 0.075, 8]} />
          {M(horn, 0.6)}
        </mesh>
      ))}

      {/* ── Eyes ── */}
      {([-0.036, 0.036] as number[]).map((ox, i) => (
        <mesh key={`ey${i}`} position={[ox, floorY + 0.202, bL * 0.68 + 0.048]}>
          <sphereGeometry args={[0.012, 8, 6]} />
          {M(eye, 0.2)}
        </mesh>
      ))}
    </group>
  )
}

export function Dinosaurs() {
  return (
    <group>
      {/* Larger dino — toward foot of bed, angled slightly */}
      <Triceratops scale={1.05} rotY={Math.PI * 0.10} posX={0.45} posZ={0.30} />
      {/* Smaller dino — head end side, facing opposite */}
      <Triceratops scale={0.70} rotY={-Math.PI * 0.80} posX={-0.42} posZ={-0.32} />
    </group>
  )
}
