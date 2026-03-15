import { useMemo } from 'react'
import { Color } from 'three'

interface Building {
  x: number
  z: number
  w: number
  h: number
  d: number
  color: string
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
      })
    }
    return result
  }, [])

  return (
    <group>
      {buildings.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2 - 10, b.z]}>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshStandardMaterial
            color={b.color}
            transparent
            opacity={0.4}
          />
        </mesh>
      ))}
    </group>
  )
}
