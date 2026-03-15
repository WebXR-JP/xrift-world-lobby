import { RigidBody } from '@react-three/rapier'
import { COLORS } from '../../constants'

interface BenchProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
}

export const Bench: React.FC<BenchProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) => {
  return (
    <group position={position} rotation={rotation}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0.38, 0]} castShadow>
          <boxGeometry args={[2, 0.1, 0.6]} />
          <meshStandardMaterial color={COLORS.structure} roughness={0.2} />
        </mesh>
      </RigidBody>
      {[-0.8, 0.8].map((x) => (
        <mesh key={x} position={[x, 0.18, 0]}>
          <boxGeometry args={[0.08, 0.36, 0.5]} />
          <meshStandardMaterial color={COLORS.structureDark} />
        </mesh>
      ))}
      <mesh position={[0, 0.44, 0.29]}>
        <boxGeometry args={[2, 0.025, 0.025]} />
        <meshStandardMaterial
          color={COLORS.accent}
          emissive={COLORS.accent}
          emissiveIntensity={1.5}
        />
      </mesh>
    </group>
  )
}
