import { useMemo } from 'react'
import { RigidBody } from '@react-three/rapier'
import { ScreenShareDisplay } from '@xrift/world-components'
import { BoxGeometry } from 'three'
import { COLORS } from '../../constants'

const SZ = -18

const SCREEN_WIDTH = 15
const SCREEN_HEIGHT = SCREEN_WIDTH * 9 / 16

export const StageWing: React.FC = () => {
  const screenGeo = useMemo(() => new BoxGeometry(SCREEN_WIDTH, SCREEN_HEIGHT, 0.12), [])

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

      {/* メインスクリーン（客席向き） */}
      <group position={[0, 7.03, -21.84]}>
        <ScreenShareDisplay id="stage-screen" position={[0, 0, 0.1]} width={SCREEN_WIDTH} />
        <lineSegments>
          <edgesGeometry args={[screenGeo]} />
          <lineBasicMaterial color={COLORS.accent} />
        </lineSegments>
      </group>

      {/* 返しモニター（登壇者向き） */}
      <ScreenShareDisplay id="stage-screen" position={[0, 3.24, -14.12]} width={3} rotation={[-2.83, 0, Math.PI]} />

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
