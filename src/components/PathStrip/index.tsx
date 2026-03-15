import { COLORS } from '../../constants'

interface StripProps {
  angle: number
  length: number
}

const Strip: React.FC<StripProps> = ({ angle, length }) => {
  const dashCount = Math.floor(length / 2.5)

  return (
    <group rotation={[0, angle, 0]}>
      <mesh position={[0, 0.52, -(length / 2 + 2)]}>
        <boxGeometry args={[0.3, 0.04, length]} />
        <meshStandardMaterial color={COLORS.accent} emissive={COLORS.accent} emissiveIntensity={0.8} transparent opacity={0.4} />
      </mesh>
      {Array.from({ length: dashCount }, (_, i) => (
        <mesh key={i} position={[0, 0.53, -(i * 2.5 + 3)]}>
          <boxGeometry args={[0.15, 0.04, 0.6]} />
          <meshStandardMaterial color={COLORS.accent} emissive={COLORS.accent} emissiveIntensity={1.5} transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export const PathStrip: React.FC = () => {
  return (
    <group>
      <Strip angle={0} length={14} />
      <Strip angle={Math.PI} length={14} />
      <Strip angle={Math.PI / 2} length={14} />
      <Strip angle={-Math.PI / 2} length={14} />
    </group>
  )
}
