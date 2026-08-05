import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { BirthdayCake, Envelope } from './DeskItems'
import { Boombox } from './Boombox'
const DESK_W=2.8,DESK_D=1.7,DESK_H=1.377,TOP_T=0.045,LEG_T=0.06
const LEG_H=DESK_H-TOP_T,TOP_Y=LEG_H+TOP_T/2,DESK_SURFACE=LEG_H+TOP_T
const APRON_H=0.10,APRON_Y=LEG_H-APRON_H/2
const PED_W=0.75,PED_D=DESK_D-2*LEG_T,PED_H=LEG_H
const PED_X=DESK_W/2-LEG_T-PED_W/2
const DR_W=PED_W-0.04,DR_H=0.17,DR_DEPTHS=[PED_H*0.82,PED_H*0.50,PED_H*0.18]
const GRP_X=4.5,GRP_Z=DESK_D/2+0.06
const BB_X=0.82,BB_Y=DESK_SURFACE+0.010,BB_Z=0.10,BB_ROT=-0.55,BB_SCALE=1/1.2
function SpringCoil({count,spacing,tubeR,ringR,color,axis='y'}:{count:number;spacing:number;tubeR:number;ringR:number;color:string;axis?:'x'|'y'|'z'}){const rot:[number,number,number]=axis==='z'?[Math.PI/2,0,0]:axis==='x'?[0,0,Math.PI/2]:[0,0,0];return(<>{Array.from({length:count},(_,i)=>{const o=(i-(count-1)/2)*spacing;const p:[number,number,number]=axis==='y'?[0,o,0]:axis==='z'?[0,0,o]:[o,0,0];return <mesh key={i} position={p} rotation={rot}><torusGeometry args={[ringR,tubeR,6,18]}/><meshStandardMaterial color={color} roughness={0.3} metalness={0.7}/></mesh>})}</>)}
function woodTex(){const c=document.createElement('canvas');c.width=512;c.height=512;const ctx=c.getContext('2d')!;ctx.fillStyle='#b8854a';ctx.fillRect(0,0,512,512);for(let row=0;row<8;row++){const y=row*64,s=0.92+Math.random()*0.12;ctx.fillStyle=`rgb(${Math.min(255,Math.floor(184*s))},${Math.min(255,Math.floor(133*s))},${Math.min(255,Math.floor(74*s))})`;ctx.fillRect(0,y,512,64);ctx.strokeStyle='rgba(110,70,30,0.22)';ctx.lineWidth=1;for(let i=0;i<9;i++){const yl=y+Math.random()*64;ctx.beginPath();ctx.moveTo(0,yl);ctx.bezierCurveTo(150,yl+(Math.random()-.5)*10,360,yl+(Math.random()-.5)*10,512,yl+(Math.random()-.5)*6);ctx.stroke()};ctx.strokeStyle='rgba(90,55,20,0.4)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(512,y);ctx.stroke()};const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,1);return t}
const METAL={color:'#2a2a32',roughness:0.30,metalness:0.85}
const BRASS={color:'#c9a86a',roughness:0.35,metalness:0.65}
const SY=-2.356,ST=1.05
const _od=new THREE.Vector3(0,0,-1).applyEuler(new THREE.Euler(ST,SY,0,'XYZ'))
const _so=new THREE.Vector3(0,0.54,0.62)
const lightPos:[number,number,number]=[_so.x+_od.x*0.30,_so.y+_od.y*0.30,_so.z+_od.z*0.30]
export function WritingDesk({lampOn,onLampClick,envelopeOpen,onToggleEnvelope,radioOn,onRadioClick}:{lampOn:boolean;onLampClick:()=>void;envelopeOpen:boolean;onToggleEnvelope:()=>void;radioOn:boolean;onRadioClick:()=>void}){
  const wt=useMemo(()=>woodTex(),[]),W=<meshStandardMaterial map={wt} roughness={0.58} metalness={0.05}/>
  const lL=useRef<THREE.PointLight>(null),lS=useRef<THREE.MeshStandardMaterial>(null),lI=useRef(0),lT=useRef(0)
  useEffect(()=>{lT.current=lampOn?1:0},[lampOn])
  useFrame((_,delta)=>{const d=lT.current-lI.current;if(Math.abs(d)>0.001)lI.current+=d*Math.min(delta*4,1);else lI.current=lT.current;const t=lI.current;if(lL.current)lL.current.intensity=t*2.4;if(lS.current){lS.current.emissive.setRGB(0.85*t,0.52*t,0.18*t);lS.current.emissiveIntensity=t*0.7}})
  const lx=DESK_W/2-LEG_T/2,lz=DESK_D/2-LEG_T/2
  const Arm=({from,to,r=0.018}:{from:THREE.Vector3Like;to:THREE.Vector3Like;r?:number})=>{const a=new THREE.Vector3(from.x,from.y,from.z),b=new THREE.Vector3(to.x,to.y,to.z);const m=a.clone().add(b).multiplyScalar(0.5),d=b.clone().sub(a);const L=d.length();d.normalize();const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d);return <mesh position={[m.x,m.y,m.z]} quaternion={q} castShadow><cylinderGeometry args={[r,r,L,14]}/><meshStandardMaterial {...METAL}/></mesh>}
  const Collar=({position,radius,tube}:{position:[number,number,number];radius:number;tube:number})=><mesh position={position} rotation={[0,0,Math.PI/2]}><torusGeometry args={[radius,tube,8,24]}/><meshStandardMaterial {...BRASS}/></mesh>
  return(<group position={[GRP_X,0.002,GRP_Z]}>
    <mesh position={[0,TOP_Y,0]} castShadow receiveShadow><boxGeometry args={[DESK_W,TOP_T,DESK_D]}/>{W}</mesh>
    {([[-lx,-lz],[-lx,lz],[lx,-lz],[lx,lz]] as [number,number][]).map(([x,z],i)=>(<mesh key={i} position={[x,LEG_H/2,z]} castShadow><boxGeometry args={[LEG_T,LEG_H,LEG_T]}/>{W}</mesh>))}
    <mesh position={[0,APRON_Y,DESK_D/2-LEG_T/2]} castShadow><boxGeometry args={[DESK_W-2*LEG_T,APRON_H,LEG_T]}/>{W}</mesh>
    <mesh position={[0,APRON_Y,-DESK_D/2+LEG_T/2]} castShadow><boxGeometry args={[DESK_W-2*LEG_T,APRON_H,LEG_T]}/>{W}</mesh>
    <mesh position={[PED_X,PED_H/2,-DESK_D/2+LEG_T+0.02]} castShadow><boxGeometry args={[PED_W,PED_H,0.022]}/>{W}</mesh>
    <mesh position={[DESK_W/2-LEG_T-PED_W-0.011,PED_H/2,0]} castShadow><boxGeometry args={[0.022,PED_H,PED_D]}/>{W}</mesh>
    <mesh position={[PED_X,0.011,0]} castShadow><boxGeometry args={[PED_W,0.022,PED_D]}/>{W}</mesh>
    <mesh position={[PED_X,LEG_H-0.011,0]} castShadow><boxGeometry args={[PED_W,0.022,PED_D]}/>{W}</mesh>
    <mesh position={[PED_X,PED_H/2,DESK_D/2-LEG_T-0.011]} castShadow><boxGeometry args={[PED_W,PED_H,0.022]}/>{W}</mesh>
    <mesh position={[DESK_W/2-LEG_T/2-0.011,PED_H/2,0]} castShadow><boxGeometry args={[0.022,PED_H,PED_D]}/>{W}</mesh>
    {DR_DEPTHS.map((dy,i)=>(<group key={i} position={[PED_X,dy,DESK_D/2-LEG_T/2+0.001]}><mesh castShadow><boxGeometry args={[DR_W,DR_H-0.012,0.022]}/>{W}</mesh><mesh position={[0,0,0.022]} castShadow><sphereGeometry args={[0.026,12,12]}/><meshStandardMaterial {...BRASS}/></mesh></group>))}
    {/* Lamp */}
    <group position={[-DESK_W/2+0.42,TOP_Y,-DESK_D/2+0.38]}>
      <mesh position={[0,0.014,0]} castShadow><cylinderGeometry args={[0.095,0.115,0.028,24]}/><meshStandardMaterial {...METAL}/></mesh>
      <mesh position={[0,0.028,0]} rotation={[0,0,Math.PI/2]}><torusGeometry args={[0.105,0.007,8,24]}/><meshStandardMaterial {...BRASS}/></mesh>
      <mesh position={[0,0.048,0]} castShadow><cylinderGeometry args={[0.026,0.032,0.040,16]}/><meshStandardMaterial {...METAL}/></mesh>
      <Arm from={{x:0,y:0.068,z:0}} to={{x:0,y:0.44,z:0}} r={0.018}/>
      <group position={[0,0.25,0]}><SpringCoil count={8} spacing={0.022} tubeR={0.006} ringR={0.024} color="#3a3a44"/></group>
      <mesh position={[0,0.44,0]} castShadow><sphereGeometry args={[0.028,20,20]}/><meshStandardMaterial {...METAL}/></mesh>
      <Collar position={[0,0.44,0]} radius={0.032} tube={0.006}/>
      <Arm from={{x:0,y:0.44,z:0}} to={{x:0,y:0.62,z:0.30}} r={0.016}/>
      <group position={[0,0.53,0.15]} rotation={[Math.atan2(0.30,0.18),0,0]}><SpringCoil count={7} spacing={0.023} tubeR={0.005} ringR={0.022} color="#3a3a44" axis="y"/></group>
      <mesh position={[0,0.62,0.30]} castShadow><sphereGeometry args={[0.026,20,20]}/><meshStandardMaterial {...METAL}/></mesh>
      <Collar position={[0,0.62,0.30]} radius={0.030} tube={0.006}/>
      <Arm from={{x:0,y:0.62,z:0.30}} to={{x:0,y:0.54,z:0.50}} r={0.015}/>
      <mesh position={[0,0.54,0.50]} castShadow><sphereGeometry args={[0.022,18,18]}/><meshStandardMaterial {...METAL}/></mesh>
      <Collar position={[0,0.54,0.50]} radius={0.026} tube={0.005}/>
      <Arm from={{x:0,y:0.54,z:0.50}} to={{x:0,y:0.54,z:0.57}} r={0.014}/>
      <group position={[0,0.54,0.62]} rotation={[ST,SY,0]}>
        <mesh rotation={[Math.PI/2,0,0]} onClick={(e)=>{e.stopPropagation();onLampClick()}} onPointerOver={()=>{document.body.style.cursor='pointer'}} onPointerOut={()=>{document.body.style.cursor='auto'}}><cylinderGeometry args={[0.16,0.16,0.26,12,1,false]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/></mesh>
        <mesh rotation={[Math.PI/2,0,0]} onClick={(e)=>{e.stopPropagation();onLampClick()}} onPointerOver={()=>{document.body.style.cursor='pointer'}} onPointerOut={()=>{document.body.style.cursor='auto'}}><cylinderGeometry args={[0.055,0.145,0.185,24,1,false]}/><meshStandardMaterial color="#d4b87a" roughness={0.55} metalness={0.25} side={THREE.FrontSide}/></mesh>
        <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.055,0.145,0.185,24,1,false]}/><meshStandardMaterial ref={lS} color="#d4b87a" roughness={0.55} metalness={0.25} emissive="#000000" emissiveIntensity={0} side={THREE.BackSide}/></mesh>
        <mesh position={[0,0,0.06]}><sphereGeometry args={[0.028,12,12]}/><meshStandardMaterial color="#ffe8a0" emissive="#ffcc44" emissiveIntensity={lampOn?1.4:0} roughness={0.2}/></mesh>
      </group>
      <pointLight ref={lL} position={lightPos} color="#ffb24c" intensity={0} distance={8} decay={2}/>
    </group>
    {/* Boombox — scaled to 1/1.2 so it reads smaller on the desk */}
    <group position={[BB_X,BB_Y,BB_Z]} rotation={[0,BB_ROT,0]} scale={BB_SCALE}><Boombox onClick={onRadioClick} isOn={radioOn}/></group>
    <BirthdayCake/>
    <Envelope open={envelopeOpen} onToggle={onToggleEnvelope}/>
    {/* Chair */}
    <group position={[-DESK_W/2+0.85,0,DESK_D/2+0.10]}>
      <mesh position={[0,0.62,0]} castShadow receiveShadow><boxGeometry args={[0.88,0.07,0.84]}/>{W}</mesh>
      {([[-0.36,-0.34],[-0.36,0.34],[0.36,-0.34],[0.36,0.34]] as [number,number][]).map(([x,z],i)=>(<mesh key={i} position={[x,0.31,z]} castShadow><boxGeometry args={[0.076,0.62,0.076]}/>{W}</mesh>))}
      <mesh position={[0,0.18,-0.34]} castShadow><boxGeometry args={[0.70,0.04,0.04]}/>{W}</mesh>
      <mesh position={[0,0.18,0.34]} castShadow><boxGeometry args={[0.70,0.04,0.04]}/>{W}</mesh>
      <mesh position={[-0.36,0.18,0]} castShadow><boxGeometry args={[0.04,0.04,0.60]}/>{W}</mesh>
      <mesh position={[0.36,0.18,0]} castShadow><boxGeometry args={[0.04,0.04,0.60]}/>{W}</mesh>
      <group position={[0,0.655,0.38]}>
        <mesh position={[-0.39,0.375,0]} castShadow><boxGeometry args={[0.06,0.75,0.055]}/>{W}</mesh>
        <mesh position={[0.39,0.375,0]} castShadow><boxGeometry args={[0.06,0.75,0.055]}/>{W}</mesh>
        <mesh position={[0,0.75,0]} castShadow><boxGeometry args={[0.72,0.06,0.055]}/>{W}</mesh>
        <mesh position={[0,0.44,0]} castShadow><boxGeometry args={[0.72,0.04,0.055]}/>{W}</mesh>
        <mesh position={[0,0.03,0]} castShadow><boxGeometry args={[0.72,0.04,0.055]}/>{W}</mesh>
        {[-0.24,-0.16,-0.08,0,0.08,0.16,0.24].map((x,i)=>(<mesh key={i} position={[x,0.235,0]} castShadow><boxGeometry args={[0.028,0.37,0.04]}/>{W}</mesh>))}
        {[-0.24,-0.16,-0.08,0,0.08,0.16,0.24].map((x,i)=>(<mesh key={`u${i}`} position={[x,0.59,0]} castShadow><boxGeometry args={[0.028,0.26,0.04]}/>{W}</mesh>))}
        <mesh position={[0,0.59,0]} castShadow><cylinderGeometry args={[0.05,0.05,0.04,20]}/><meshStandardMaterial color="#9a6830" roughness={0.7} metalness={0.1}/></mesh>
        <mesh position={[-0.39,0.79,0]} castShadow><sphereGeometry args={[0.022,16,16]}/><meshStandardMaterial color="#9a6830" roughness={0.6} metalness={0.15}/></mesh>
        <mesh position={[0.39,0.79,0]} castShadow><sphereGeometry args={[0.022,16,16]}/><meshStandardMaterial color="#9a6830" roughness={0.6} metalness={0.15}/></mesh>
      </group>
    </group>
  </group>)
}
