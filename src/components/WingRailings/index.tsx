import { useEffect, useMemo, useRef } from 'react'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import {
  Object3D,
  InstancedMesh as ThreeInstancedMesh,
} from 'three'
import { COLORS, PLATFORM } from '../../constants'

const { hubRadius: R, wingLength: WL, wingBaseHalf: WB, wingTipHalf: WT } = PLATFORM

const RAIL_CENTER_Y = 0.52 + 0.65
const RAIL_HEIGHT = 1.3
const RAIL_CAP_OFFSET = RAIL_HEIGHT / 2

interface RailDef {
  x1: number; z1: number; x2: number; z2: number
}

const RAILS: RailDef[] = [
  // 先端
  { x1: -WT, z1: -(R + WL), x2: WT, z2: -(R + WL) },
  { x1: R + WL, z1: -WT, x2: R + WL, z2: WT },
  { x1: -(R + WL), z1: -WT, x2: -(R + WL), z2: WT },
  { x1: -WT, z1: R + WL, x2: WT, z2: R + WL },
  // 北ウイング
  { x1: -WB, z1: -R, x2: -WT, z2: -(R + WL) },
  { x1: WB, z1: -R, x2: WT, z2: -(R + WL) },
  // 南ウイング
  { x1: -WB, z1: R, x2: -WT, z2: R + WL },
  { x1: WB, z1: R, x2: WT, z2: R + WL },
  // 東ウイング
  { x1: R, z1: -WB, x2: R + WL, z2: -WT },
  { x1: R, z1: WB, x2: R + WL, z2: WT },
  // 西ウイング
  { x1: -R, z1: -WB, x2: -(R + WL), z2: -WT },
  { x1: -R, z1: WB, x2: -(R + WL), z2: WT },
  // ハブコーナー
  { x1: -WB, z1: -R, x2: -R, z2: -WB },
  { x1: WB, z1: -R, x2: R, z2: -WB },
  { x1: R, z1: WB, x2: WB, z2: R },
  { x1: -R, z1: WB, x2: -WB, z2: R },
]

interface TipDecorDef {
  x: number; z: number
}

const TIP_DECORS: TipDecorDef[] = [
  { x: -4.5, z: -(R + WL) },
  { x: 4.5, z: -(R + WL) },
  { x: R + WL, z: -4.5 },
  { x: R + WL, z: 4.5 },
  { x: -(R + WL), z: -4.5 },
  { x: -(R + WL), z: 4.5 },
  { x: -4.5, z: R + WL },
  { x: 4.5, z: R + WL },
]

function computeRail(r: RailDef) {
  const dx = r.x2 - r.x1
  const dz = r.z2 - r.z1
  return {
    len: Math.sqrt(dx * dx + dz * dz),
    ang: -Math.atan2(dz, dx),
    cx: (r.x1 + r.x2) / 2,
    cz: (r.z1 + r.z2) / 2,
  }
}

export const WingRailings: React.FC = () => {
  const capRef = useRef<ThreeInstancedMesh>(null)
  const pillarRef = useRef<ThreeInstancedMesh>(null)
  const plateRef = useRef<ThreeInstancedMesh>(null)
  const sphereRef = useRef<ThreeInstancedMesh>(null)

  const railData = useMemo(() => RAILS.map(computeRail), [])

  useEffect(() => {
    const dummy = new Object3D()

    // レールキャップ
    if (capRef.current) {
      for (let i = 0; i < railData.length; i++) {
        const { len, ang, cx, cz } = railData[i]
        dummy.position.set(cx, RAIL_CENTER_Y + RAIL_CAP_OFFSET, cz)
        dummy.rotation.set(0, ang, 0)
        dummy.scale.set(len, 0.025, 0.07)
        dummy.updateMatrix()
        capRef.current.setMatrixAt(i, dummy.matrix)
      }
      capRef.current.instanceMatrix.needsUpdate = true
    }

    // 装飾ピラー
    if (pillarRef.current) {
      for (let i = 0; i < TIP_DECORS.length; i++) {
        const { x, z } = TIP_DECORS[i]
        dummy.position.set(x, 2.27, z)
        dummy.rotation.set(0, 0, 0)
        dummy.scale.set(0.3, 3.5, 0.3)
        dummy.updateMatrix()
        pillarRef.current.setMatrixAt(i, dummy.matrix)
      }
      pillarRef.current.instanceMatrix.needsUpdate = true
    }

    // 装飾プレート
    if (plateRef.current) {
      for (let i = 0; i < TIP_DECORS.length; i++) {
        const { x, z } = TIP_DECORS[i]
        dummy.position.set(x, 4.1, z)
        dummy.rotation.set(0, 0, 0)
        dummy.scale.set(0.4, 0.08, 0.4)
        dummy.updateMatrix()
        plateRef.current.setMatrixAt(i, dummy.matrix)
      }
      plateRef.current.instanceMatrix.needsUpdate = true
    }

    // 装飾スフィア
    if (sphereRef.current) {
      for (let i = 0; i < TIP_DECORS.length; i++) {
        const { x, z } = TIP_DECORS[i]
        dummy.position.set(x, 4.2, z)
        dummy.rotation.set(0, 0, 0)
        dummy.scale.set(1, 1, 1)
        dummy.updateMatrix()
        sphereRef.current.setMatrixAt(i, dummy.matrix)
      }
      sphereRef.current.instanceMatrix.needsUpdate = true
    }
  }, [railData])

  return (
    <group>
      {/* ガラスパネル（個別メッシュ：透明ソート対応） */}
      {railData.map((r, i) => (
        <mesh key={i} position={[r.cx, RAIL_CENTER_Y, r.cz]} rotation={[0, r.ang, 0]}>
          <boxGeometry args={[r.len, RAIL_HEIGHT, 0.06]} />
          <meshPhysicalMaterial color={COLORS.glass} transparent opacity={0.2} roughness={0.05} side={2} depthWrite={false} />
        </mesh>
      ))}

      {/* レールキャップ（インスタンシング） */}
      <instancedMesh ref={capRef} args={[undefined, undefined, RAILS.length]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={COLORS.rail} emissive={COLORS.rail} emissiveIntensity={0.3} />
      </instancedMesh>

      {/* 物理コライダー（個別） */}
      {railData.map((r, i) => (
        <RigidBody key={i} type="fixed" position={[r.cx, RAIL_CENTER_Y, r.cz]} rotation={[0, r.ang, 0]}>
          <CuboidCollider args={[r.len / 2, RAIL_HEIGHT / 2, 0.03]} />
        </RigidBody>
      ))}

      {/* 装飾ピラー（インスタンシング） */}
      <instancedMesh ref={pillarRef} args={[undefined, undefined, TIP_DECORS.length]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={COLORS.structureDark} roughness={0.2} />
      </instancedMesh>

      {/* 装飾プレート（インスタンシング） */}
      <instancedMesh ref={plateRef} args={[undefined, undefined, TIP_DECORS.length]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={COLORS.accent} emissive={COLORS.accent} emissiveIntensity={1.5} />
      </instancedMesh>

      {/* 装飾スフィア（インスタンシング） */}
      <instancedMesh ref={sphereRef} args={[undefined, undefined, TIP_DECORS.length]} frustumCulled={false}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color={COLORS.accent} emissive={COLORS.accent} emissiveIntensity={3} />
      </instancedMesh>
    </group>
  )
}
