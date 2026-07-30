import { useMemo } from 'react'
import * as THREE from 'three'

export function Boombox({ onClick, isOn }: { onClick?: () => void; isOn?: boolean }) {
  const BW = 1.10, BH = 0.50, BD = 0.28

  const grilleTex = useMemo(() => {
    const S = 256; const c = document.createElement('canvas'); c.width = S; c.height = S
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#0d0d10'; ctx.fillRect(0, 0, S, S)
    ctx.strokeStyle = 'rgba(80,80,92,0.75)'; ctx.lineWidth = 1.4
    for (let r = 10; r < S * 0.47; r += 12) { ctx.beginPath(); ctx.arc(S/2, S/2, r, 0, Math.PI*2); ctx.stroke() }
    ctx.fillStyle = 'rgba(55,55,65,0.95)'
    for (let y = 8; y < S; y += 13) for (let x = 8; x < S; x += 13)
      if (Math.sqrt((x-S/2)**2+(y-S/2)**2) < S*0.45) { ctx.beginPath(); ctx.arc(x,y,1.7,0,Math.PI*2); ctx.fill() }
    const g = ctx.createRadialGradient(S*0.28,S*0.28,0,S*0.28,S*0.28,S*0.52)
    g.addColorStop(0,'rgba(255,255,255,0.08)'); g.addColorStop(1,'rgba(0,0,0,0)')
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(S/2,S/2,S*0.46,0,Math.PI*2); ctx.fill()
    return new THREE.CanvasTexture(c)
  }, [])

  const freqTex = useMemo(() => {
    const W=256,H=64; const c=document.createElement('canvas'); c.width=W; c.height=H
    const ctx=c.getContext('2d')!
    ctx.fillStyle='#080a08'; ctx.fillRect(0,0,W,H)
    ctx.strokeStyle='#b89018'; ctx.lineWidth=1.5
    for(let i=0;i<=20;i++){const x=12+(i/20)*(W-24),h=i%5===0?14:8;ctx.beginPath();ctx.moveTo(x,H-6-h);ctx.lineTo(x,H-6);ctx.stroke()}
    ctx.strokeStyle='#e03818'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(W*0.56,4); ctx.lineTo(W*0.56,H-6); ctx.stroke()
    ctx.fillStyle='#b89018'; ctx.font='9px monospace'
    ;['88','92','96','100','104','108'].forEach((l,i)=>ctx.fillText(l,12+i*(W-24)/5-6,14))
    return new THREE.CanvasTexture(c)
  }, [])

  const cassetteTex = useMemo(() => {
    const W=192,H=96; const c=document.createElement('canvas'); c.width=W; c.height=H
    const ctx=c.getContext('2d')!
    ctx.fillStyle='#18181c'; ctx.fillRect(0,0,W,H)
    ctx.fillStyle='#282830'; ctx.fillRect(16,12,W-32,H-24)
    ctx.strokeStyle='#3a3a44'; ctx.lineWidth=1.5; ctx.strokeRect(16,12,W-32,H-24)
    ;[W*0.3,W*0.7].forEach(cx=>{ctx.strokeStyle='#555';ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,H/2,20,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#777';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(cx,H/2,10,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#444';ctx.beginPath();ctx.arc(cx,H/2,5,0,Math.PI*2);ctx.fill()})
    ctx.strokeStyle='#7a5228'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(W*0.3+20,H/2); ctx.quadraticCurveTo(W/2,H/2+10,W*0.7-20,H/2); ctx.stroke()
    return new THREE.CanvasTexture(c)
  }, [])

  const SILVER = { color:'#b8b8bc', roughness:0.40, metalness:0.60 }
  const DARK   = { color:'#161618', roughness:0.65, metalness:0.20 }
  const BLACK  = { color:'#0c0c0e', roughness:0.70, metalness:0.20 }
  const CHROME = { color:'#d0d0d8', roughness:0.22, metalness:0.90 }
  const ACCENT = { color:'#c89818', roughness:0.48, metalness:0.45 }

  const SPK_R   = 0.180
  const SPK_X   = BW/2 - SPK_R - 0.024
  const TOR_R   = 0.016
  const FRONT   = BD / 2
  const Z_PLATE = FRONT - 0.004
  const Z_GRILLE= FRONT + 0.006
  const Z_TORUS = FRONT + TOR_R
  const Z_CAP   = FRONT + 0.026
  const Z_BOLT  = FRONT + 0.038
  const FACE_Z: [number, number, number] = [Math.PI / 2, 0, 0]

  const Speaker = ({ x }: { x: number }) => (
    <group position={[x, BH / 2, 0]}>
      <mesh position={[0, 0, Z_PLATE]} rotation={FACE_Z} castShadow>
        <cylinderGeometry args={[SPK_R + TOR_R + 0.008, SPK_R + TOR_R + 0.008, 0.018, 56]} />
        <meshStandardMaterial {...DARK} />
      </mesh>
      <mesh position={[0, 0, Z_GRILLE]} rotation={FACE_Z}>
        <cylinderGeometry args={[SPK_R, SPK_R, 0.008, 56]} />
        <meshStandardMaterial map={grilleTex} roughness={0.88} metalness={0} />
      </mesh>
      <mesh position={[0, 0, Z_TORUS]}>
        <torusGeometry args={[SPK_R, TOR_R, 20, 72]} />
        <meshStandardMaterial {...CHROME} />
      </mesh>
      <mesh position={[0, 0, Z_CAP]} rotation={FACE_Z}>
        <cylinderGeometry args={[0.030, 0.042, 0.020, 32]} />
        <meshStandardMaterial color="#aaaab0" roughness={0.36} metalness={0.65} />
      </mesh>
      <mesh position={[0, 0, Z_BOLT]}>
        <sphereGeometry args={[0.010, 14, 14]} />
        <meshStandardMaterial color="#cccccc" roughness={0.25} metalness={0.88} />
      </mesh>
      <mesh position={[0, SPK_R * 0.58, FRONT + 0.004]} rotation={FACE_Z}>
        <cylinderGeometry args={[0.026, 0.026, 0.012, 24]} />
        <meshStandardMaterial {...DARK} />
      </mesh>
      <mesh position={[0, SPK_R * 0.58, FRONT + 0.013]} rotation={FACE_Z}>
        <cylinderGeometry args={[0.015, 0.015, 0.006, 20]} />
        <meshStandardMaterial {...CHROME} />
      </mesh>
    </group>
  )

  return (
    <group>
      <mesh position={[0, BH/2, 0]} castShadow receiveShadow onClick={(e) => { e.stopPropagation(); onClick?.() }} onPointerOver={onClick ? () => { document.body.style.cursor = 'pointer' } : undefined} onPointerOut={onClick ? () => { document.body.style.cursor = 'auto' } : undefined}>
        <boxGeometry args={[BW, BH, BD]} /><meshStandardMaterial {...SILVER} />
      </mesh>

      <group position={[BW/2 - 0.06, BH, -BD/2 + 0.04]}>
        <mesh position={[0, 0.012, 0]} castShadow>
          <cylinderGeometry args={[0.016, 0.020, 0.024, 14]} />
          <meshStandardMaterial {...DARK} />
        </mesh>
        <mesh position={[0, 0.024 + 0.22, 0]} castShadow>
          <cylinderGeometry args={[0.007, 0.010, 0.44, 10]} />
          <meshStandardMaterial color="#888892" roughness={0.35} metalness={0.75} />
        </mesh>
        <mesh position={[0, 0.024 + 0.44, 0]} castShadow>
          <sphereGeometry args={[0.011, 10, 10]} />
          <meshStandardMaterial color="#9a9aa2" roughness={0.30} metalness={0.80} />
        </mesh>
      </group>

      <mesh position={[0, BH - 0.055, FRONT + 0.003]}>
        <planeGeometry args={[BW - 0.04, 0.09]} /><meshStandardMaterial {...DARK} />
      </mesh>
      {Array.from({length:14},(_,i)=>{
        const h=0.018+Math.sin(i*1.1+1.4)*0.014+Math.cos(i*2.3)*0.008
        return <mesh key={i} position={[-0.34+i*0.052, BH-0.055, FRONT+0.005]}><planeGeometry args={[0.010,h]}/><meshStandardMaterial color={i<4?'#e84020':i<9?'#d4a020':'#40b020'} roughness={0.3} metalness={0.1}/></mesh>
      })}
      {(['#e84020','#e84020','#d4a020']).map((col,i)=>(
        <mesh key={i} position={[-0.38+i*0.016, BH-0.038, FRONT+0.005]}>
          <circleGeometry args={[0.004,8]}/><meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.8} roughness={0.2}/>
        </mesh>
      ))}
      <mesh position={[0.42, BH-0.038, FRONT+0.005]}>
        <circleGeometry args={[0.005,10]}/><meshStandardMaterial color={isOn?'#40e060':'#1a3a20'} emissive={isOn?'#40e060':'#000000'} emissiveIntensity={isOn?1.2:0} roughness={0.2}/>
      </mesh>

      <mesh position={[0, BH-0.010, FRONT+0.003]}>
        <planeGeometry args={[BW-0.04, 0.008]}/><meshStandardMaterial color="#c8a020" roughness={0.4} metalness={0.5}/>
      </mesh>

      <mesh position={[0, BH/2, FRONT - 0.003]}>
        <boxGeometry args={[(SPK_X - SPK_R - TOR_R - 0.015) * 2, BH - 0.14, 0.016]}/>
        <meshStandardMaterial {...DARK}/>
      </mesh>

      <mesh position={[0, BH-0.145, FRONT+0.009]}>
        <planeGeometry args={[0.28, 0.062]}/><meshStandardMaterial map={freqTex} roughness={0.8}/>
      </mesh>

      <mesh position={[0, BH/2+0.005, FRONT+0.011]}>
        <planeGeometry args={[0.26, 0.105]}/><meshStandardMaterial map={cassetteTex} roughness={0.85}/>
      </mesh>

      {([-0.075,-0.038,0,0.038,0.075]).map((bx,i)=>(
        <mesh key={i} position={[bx, BH/2-0.068, FRONT+0.008]} castShadow>
          <boxGeometry args={[0.026,0.018,0.010]}/><meshStandardMaterial color="#2e2e36" roughness={0.5} metalness={0.3}/>
        </mesh>
      ))}

      <mesh position={[0, 0.076, FRONT+0.007]}>
        <planeGeometry args={[0.26, 0.060]}/><meshStandardMaterial color="#16161a" roughness={0.8}/>
      </mesh>
      {Array.from({length:5},(_,i)=>{
        const sx=-0.08+i*0.04, ky=0.062+Math.sin(i*1.3+0.5)*0.014
        return (
          <group key={i} position={[sx, 0.076, FRONT+0.009]}>
            <mesh><planeGeometry args={[0.005,0.044]}/><meshStandardMaterial color="#28282e" roughness={0.6} metalness={0.2}/></mesh>
            <mesh position={[0, ky-0.076, 0.003]}><boxGeometry args={[0.014,0.010,0.006]}/><meshStandardMaterial color="#c4c4c8" roughness={0.4} metalness={0.5}/></mesh>
          </group>
        )
      })}

      {([0.090,0.136]).map((kx,i)=>(
        <group key={i} position={[kx, BH/2+0.040, FRONT+0.014]}>
          <mesh rotation={FACE_Z}><cylinderGeometry args={[0.018,0.018,0.016,20]}/><meshStandardMaterial color="#888" roughness={0.4} metalness={0.6}/></mesh>
          <mesh position={[0,0,0.011]} rotation={FACE_Z}><cylinderGeometry args={[0.008,0.008,0.008,12]}/><meshStandardMaterial {...ACCENT}/></mesh>
        </group>
      ))}

      <Speaker x={-SPK_X} />
      <Speaker x={ SPK_X} />

      {([-BW/2+0.06, BW/2-0.06]).map((fx,i)=>(
        <mesh key={i} position={[fx,-0.010,0]} castShadow>
          <boxGeometry args={[0.06,0.020,BD*0.7]}/><meshStandardMaterial {...BLACK}/>
        </mesh>
      ))}
    </group>
  )
}
