import { useMemo } from 'react'
import { RigidBody } from '@react-three/rapier'
import { COLORS, PLATFORM } from '../../constants'

const { hubRadius: R, wingLength: WL, wingBaseHalf: WB, wingTipHalf: WT } = PLATFORM

const RAIL_CENTER_Y = 0.52 + 0.65
const RAIL_HEIGHT = 1.3
const RAIL_CAP_OFFSET = RAIL_HEIGHT / 2

interface RailProps {
  x1: number
  z1: number
  x2: number
  z2: number
}

const Rail: React.FC<RailProps> = ({ x1, z1, x2, z2 }) => {
  const { len, ang, cx, cz } = useMemo(() => {
    const dx = x2 - x1
    const dz = z2 - z1
    return {
      len: Math.sqrt(dx * dx + dz * dz),
      ang: -Math.atan2(dz, dx),
      cx: (x1 + x2) / 2,
      cz: (z1 + z2) / 2,
    }
  }, [x1, z1, x2, z2])

  return (
    <group position={[cx, RAIL_CENTER_Y, cz]} rotation={[0, ang, 0]}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh>
          <boxGeometry args={[len, RAIL_HEIGHT, 0.06]} />
          <meshPhysicalMaterial color={COLORS.glass} transparent opacity={0.2} roughness={0.05} side={2} />
        </mesh>
      </RigidBody>
      <mesh position={[0, RAIL_CAP_OFFSET, 0]}>
        <boxGeometry args={[len, 0.025, 0.07]} />
        <meshStandardMaterial color={COLORS.rail} emissive={COLORS.rail} emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

interface TipDecorProps {
  x: number
  z: number
}

const TipDecor: React.FC<TipDecorProps> = ({ x, z }) => (
  <group>
    <mesh position={[x, 2.27, z]}>
      <boxGeometry args={[0.3, 3.5, 0.3]} />
      <meshStandardMaterial color={COLORS.structureDark} roughness={0.2} />
    </mesh>
    <mesh position={[x, 4.1, z]}>
      <boxGeometry args={[0.4, 0.08, 0.4]} />
      <meshStandardMaterial color={COLORS.accent} emissive={COLORS.accent} emissiveIntensity={1.5} />
    </mesh>
    <mesh position={[x, 4.2, z]}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial color={COLORS.accent} emissive={COLORS.accent} emissiveIntensity={3} />
    </mesh>
  </group>
)

export const WingRailings: React.FC = () => {
  return (
    <group>
      {/* 北先端 */}
      <Rail x1={-WT} z1={-(R + WL)} x2={WT} z2={-(R + WL)} />
      {/* 東先端 */}
      <Rail x1={R + WL} z1={-WT} x2={R + WL} z2={WT} />
      {/* 西先端 */}
      <Rail x1={-(R + WL)} z1={-WT} x2={-(R + WL)} z2={WT} />
      {/* 南先端 */}
      <Rail x1={-WT} z1={R + WL} x2={WT} z2={R + WL} />

      {/* 北ウイング */}
      <Rail x1={-WB} z1={-R} x2={-WT} z2={-(R + WL)} />
      <Rail x1={WB} z1={-R} x2={WT} z2={-(R + WL)} />
      {/* 南ウイング */}
      <Rail x1={-WB} z1={R} x2={-WT} z2={R + WL} />
      <Rail x1={WB} z1={R} x2={WT} z2={R + WL} />
      {/* 東ウイング */}
      <Rail x1={R} z1={-WB} x2={R + WL} z2={-WT} />
      <Rail x1={R} z1={WB} x2={R + WL} z2={WT} />
      {/* 西ウイング */}
      <Rail x1={-R} z1={-WB} x2={-(R + WL)} z2={-WT} />
      <Rail x1={-R} z1={WB} x2={-(R + WL)} z2={WT} />

      {/* ハブコーナー */}
      <Rail x1={-WB} z1={-R} x2={-R} z2={-WB} />
      <Rail x1={WB} z1={-R} x2={R} z2={-WB} />
      <Rail x1={R} z1={WB} x2={WB} z2={R} />
      <Rail x1={-R} z1={WB} x2={-WB} z2={R} />

      {/* ウイング先端装飾 */}
      <TipDecor x={-4.5} z={-(R + WL)} />
      <TipDecor x={4.5} z={-(R + WL)} />
      <TipDecor x={R + WL} z={-4.5} />
      <TipDecor x={R + WL} z={4.5} />
      <TipDecor x={-(R + WL)} z={-4.5} />
      <TipDecor x={-(R + WL)} z={4.5} />
      <TipDecor x={-4.5} z={R + WL} />
      <TipDecor x={4.5} z={R + WL} />
    </group>
  )
}
