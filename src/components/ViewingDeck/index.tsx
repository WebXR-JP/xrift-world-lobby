import { RigidBody } from '@react-three/rapier'
import { COLORS } from '../../constants'
import { Bench } from '../Bench'

const DZ = 18

export const ViewingDeck: React.FC = () => {
  return (
    <group>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0.42, DZ]} receiveShadow>
          <boxGeometry args={[10, 0.35, 8]} />
          <meshStandardMaterial color={COLORS.structure} roughness={0.25} />
        </mesh>
      </RigidBody>

      {/* ゾーンボーダー */}
      {[
        { pos: [0, 0.62, DZ + 4.05] as [number, number, number], size: [10.2, 0.04, 0.04] as [number, number, number] },
        { pos: [0, 0.62, DZ - 4.05] as [number, number, number], size: [10.2, 0.04, 0.04] as [number, number, number] },
        { pos: [5.1, 0.62, DZ] as [number, number, number], size: [0.04, 0.04, 8.1] as [number, number, number] },
        { pos: [-5.1, 0.62, DZ] as [number, number, number], size: [0.04, 0.04, 8.1] as [number, number, number] },
      ].map((b, i) => (
        <mesh key={i} position={b.pos}>
          <boxGeometry args={b.size} />
          <meshStandardMaterial color={COLORS.accent} emissive={COLORS.accent} emissiveIntensity={1.2} />
        </mesh>
      ))}

      <Bench position={[-3.5, 0.42, DZ + 1.5]} rotation={[0, Math.PI, 0]} />
      <Bench position={[0, 0.42, DZ + 1.5]} rotation={[0, Math.PI, 0]} />
      <Bench position={[3.5, 0.42, DZ + 1.5]} rotation={[0, Math.PI, 0]} />
      <Bench position={[-3, 0.42, DZ - 1.5]} />
      <Bench position={[3, 0.42, DZ - 1.5]} />
    </group>
  )
}
