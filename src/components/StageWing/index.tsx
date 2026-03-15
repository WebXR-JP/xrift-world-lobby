import { useMemo } from 'react'
import { RigidBody } from '@react-three/rapier'
import { ScreenShareDisplay } from '@xrift/world-components'
import { BoxGeometry } from 'three'
import { COLORS } from '../../constants'

const SZ = -18

export const StageWing: React.FC = () => {
  const screenGeo = useMemo(() => new BoxGeometry(15, 8.4375, 0.12), [])

  return (
    <group>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0.9, SZ]} castShadow receiveShadow>
          <boxGeometry args={[10, 0.8, 8]} />
          <meshStandardMaterial color={COLORS.structure} roughness={0.2} />
        </mesh>
      </RigidBody>

      {/* ステージエッジアクセント */}
      <mesh position={[0, 1.32, SZ + 4]}>
        <boxGeometry args={[10, 0.06, 0.08]} />
        <meshStandardMaterial color={COLORS.accent} emissive={COLORS.accent} emissiveIntensity={1.5} />
      </mesh>
      {[-5, 5].map((x) => (
        <mesh key={x} position={[x, 0.9, SZ + 4]}>
          <boxGeometry args={[0.06, 0.85, 0.06]} />
          <meshStandardMaterial color={COLORS.accent} emissive={COLORS.accent} emissiveIntensity={0.8} />
        </mesh>
      ))}

      {/* スクリーン（中央） */}
      <group position={[0, 7.03, -21.84]}>
        <ScreenShareDisplay id="stage-screen" position={[0, 0, 0.1]} width={15} />
        <lineSegments>
          <edgesGeometry args={[screenGeo]} />
          <lineBasicMaterial color={COLORS.accent} />
        </lineSegments>
        <mesh position={[0, 4.22, 0]}>
          <boxGeometry args={[15, 0.06, 0.18]} />
          <meshStandardMaterial color={COLORS.accent} emissive={COLORS.accent} emissiveIntensity={1.5} />
        </mesh>
        <mesh position={[0, -4.22, 0]}>
          <boxGeometry args={[15, 0.04, 0.18]} />
          <meshStandardMaterial color={COLORS.accent} emissive={COLORS.accent} emissiveIntensity={0.8} />
        </mesh>
      </group>
      {/* スクリーン（左） */}
      <group position={[-14.58, 7.03, -17.98]} rotation={[0, Math.PI / 6, 0]}>
        <ScreenShareDisplay id="stage-screen" position={[0, 0, 0.1]} width={15} />
        <lineSegments>
          <edgesGeometry args={[screenGeo]} />
          <lineBasicMaterial color={COLORS.accent} />
        </lineSegments>
        <mesh position={[0, 4.22, 0]}>
          <boxGeometry args={[15, 0.06, 0.18]} />
          <meshStandardMaterial color={COLORS.accent} emissive={COLORS.accent} emissiveIntensity={1.5} />
        </mesh>
        <mesh position={[0, -4.22, 0]}>
          <boxGeometry args={[15, 0.04, 0.18]} />
          <meshStandardMaterial color={COLORS.accent} emissive={COLORS.accent} emissiveIntensity={0.8} />
        </mesh>
      </group>
      {/* スクリーン（右） */}
      <group position={[14.61, 7.03, -18.09]} rotation={[0, -Math.PI / 6, 0]}>
        <ScreenShareDisplay id="stage-screen" position={[0, 0, 0.1]} width={15} />
        <lineSegments>
          <edgesGeometry args={[screenGeo]} />
          <lineBasicMaterial color={COLORS.accent} />
        </lineSegments>
        <mesh position={[0, 4.22, 0]}>
          <boxGeometry args={[15, 0.06, 0.18]} />
          <meshStandardMaterial color={COLORS.accent} emissive={COLORS.accent} emissiveIntensity={1.5} />
        </mesh>
        <mesh position={[0, -4.22, 0]}>
          <boxGeometry args={[15, 0.04, 0.18]} />
          <meshStandardMaterial color={COLORS.accent} emissive={COLORS.accent} emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* 階段 */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0.7, SZ + 4.5]} receiveShadow>
          <boxGeometry args={[6, 0.4, 1]} />
          <meshStandardMaterial color={COLORS.structureDark} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0.45, SZ + 5.3]} receiveShadow>
          <boxGeometry args={[6, 0.2, 1]} />
          <meshStandardMaterial color={COLORS.structure} />
        </mesh>
      </RigidBody>
    </group>
  )
}
