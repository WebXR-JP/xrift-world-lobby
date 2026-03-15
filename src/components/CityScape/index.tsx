import { useMemo } from 'react'
import { Color } from 'three'
import { COLORS } from '../../constants'

interface Building {
  x: number
  z: number
  w: number
  h: number
  d: number
  color: string
  hasLight: boolean
}

export const CityScape: React.FC = () => {
  const buildings = useMemo<Building[]>(() => {
    const result: Building[] = []
    for (let i = 0; i < 50; i++) {
      const a = (i / 50) * Math.PI * 2
      const dist = 55 + Math.random() * 45
      const h = 8 + Math.random() * 50
      const w = 2 + Math.random() * 7
      const c = new Color()
      c.setHSL(0.72, 0.1, 0.48 + Math.random() * 0.15)
      result.push({
        x: Math.cos(a) * dist,
        z: Math.sin(a) * dist,
        w,
        h,
        d: w * (0.4 + Math.random() * 0.6),
        color: `#${c.getHexString()}`,
        hasLight: Math.random() > 0.55,
      })
    }
    return result
  }, [])

  return (
    <group>
      {buildings.map((b, i) => (
        <group key={i}>
          <mesh position={[b.x, b.h / 2 - 10, b.z]}>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshStandardMaterial
              color={b.color}
              transparent
              opacity={0.4}
            />
          </mesh>
          {b.hasLight && (
            <mesh position={[b.x, b.h - 9.5, b.z]}>
              <sphereGeometry args={[0.15, 6, 6]} />
              <meshStandardMaterial
                color={COLORS.accent}
                emissive={COLORS.accent}
                emissiveIntensity={2}
              />
            </mesh>
          )}
        </group>
      ))}
    </group>
  )
}
