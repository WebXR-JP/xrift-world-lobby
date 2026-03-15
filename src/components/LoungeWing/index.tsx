import { RigidBody } from '@react-three/rapier'
import { COLORS } from '../../constants'
import { Bench } from '../Bench'
import { FloatingOrb } from '../FloatingOrb'

interface LoungeAreaProps {
  xCenter: number
}

const LoungeArea: React.FC<LoungeAreaProps> = ({ xCenter }) => {
  const sign = xCenter > 0 ? 1 : -1

  return (
    <group>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[xCenter, -0.1, 0]} receiveShadow>
          <boxGeometry args={[8, 0.6, 9]} />
          <meshStandardMaterial color={COLORS.structure} roughness={0.5} />
        </mesh>
      </RigidBody>

      {/* ゾーンボーダーアクセント */}
      {[
        { pos: [xCenter, 0.52, 4.55] as [number, number, number], size: [8.2, 0.04, 0.04] as [number, number, number] },
        { pos: [xCenter, 0.52, -4.55] as [number, number, number], size: [8.2, 0.04, 0.04] as [number, number, number] },
        { pos: [xCenter + 4.1, 0.52, 0] as [number, number, number], size: [0.04, 0.04, 9.1] as [number, number, number] },
        { pos: [xCenter - 4.1, 0.52, 0] as [number, number, number], size: [0.04, 0.04, 9.1] as [number, number, number] },
      ].map((b, i) => (
        <mesh key={i} position={b.pos}>
          <boxGeometry args={b.size} />
          <meshStandardMaterial color={COLORS.accent} emissive={COLORS.accent} emissiveIntensity={1.2} />
        </mesh>
      ))}

      <Bench position={[xCenter - 1.8, -0.1, -2]} rotation={[0, sign * 0.4, 0]} />
      <Bench position={[xCenter + 1.8, -0.1, -2]} rotation={[0, -sign * 0.4, 0]} />
      <Bench position={[xCenter - 1.8, -0.1, 2]} rotation={[0, -sign * 0.3, 0]} />
      <Bench position={[xCenter + 1.8, -0.1, 2]} rotation={[0, sign * 0.3, 0]} />

      <RigidBody type="fixed" colliders="hull">
        <mesh position={[xCenter, 0.28, 0]} castShadow>
          <cylinderGeometry args={[0.8, 0.8, 0.35, 32]} />
          <meshStandardMaterial color={COLORS.structure} roughness={0.15} />
        </mesh>
      </RigidBody>
      <mesh position={[xCenter, 0.47, 0]}>
        <cylinderGeometry args={[0.82, 0.82, 0.03, 32]} />
        <meshStandardMaterial color={COLORS.accent} emissive={COLORS.accent} emissiveIntensity={0.8} transparent opacity={0.6} />
      </mesh>

      <FloatingOrb position={[xCenter - 1.2, 3.5, -1.5]} size={0.4} speed={0.7} />
      <FloatingOrb position={[xCenter + 1.5, 4.2, 1.5]} size={0.28} speed={0.5} />
      <FloatingOrb position={[xCenter - 1.5, 2.8, 2.5]} size={0.35} speed={0.9} />
      <FloatingOrb position={[xCenter + 0.5, 3.8, -0.5]} size={0.22} speed={0.6} />
    </group>
  )
}

export const LoungeWing: React.FC = () => {
  return (
    <group>
      <LoungeArea xCenter={18} />
      <LoungeArea xCenter={-18} />
    </group>
  )
}
