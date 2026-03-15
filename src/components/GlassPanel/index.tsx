import { useMemo } from 'react'
import { PlaneGeometry } from 'three'
import { COLORS } from '../../constants'

interface GlassPanelProps {
  width?: number
  height?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  width = 2.6,
  height = 1.8,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) => {
  const edgesGeo = useMemo(
    () => new PlaneGeometry(width, height),
    [width, height],
  )

  return (
    <group position={position} rotation={rotation}>
      {/* ガラス面 */}
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshPhysicalMaterial
          color={COLORS.glass}
          transparent
          opacity={0.35}
          roughness={0.15}
          side={2}
        />
      </mesh>
      {/* エッジライン */}
      <lineSegments>
        <edgesGeometry args={[edgesGeo]} />
        <lineBasicMaterial color={COLORS.accent} />
      </lineSegments>
      {/* コーナードット */}
      {[
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ].map(([sx, sy], i) => (
        <mesh key={i} position={[sx * width * 0.45, sy * height * 0.45, 0.02]}>
          <circleGeometry args={[0.06, 12]} />
          <meshStandardMaterial
            color={COLORS.accent}
            emissive={COLORS.accent}
            emissiveIntensity={2}
          />
        </mesh>
      ))}
      {/* ステータスドット */}
      <mesh position={[-width / 2 + 0.35, height / 2 - 0.3, 0.02]}>
        <circleGeometry args={[0.1, 16]} />
        <meshStandardMaterial
          color={COLORS.accent}
          emissive={COLORS.accent}
          emissiveIntensity={2}
        />
      </mesh>
    </group>
  )
}
