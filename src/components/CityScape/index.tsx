import { useEffect, useMemo, useRef } from 'react'
import { Matrix4, Object3D, InstancedMesh as ThreeInstancedMesh } from 'three'
import { COLORS } from '../../constants'

// 近距離50 + 中距離100 + 遠距離150 + 超遠距離200 = 500棟
const RINGS = [
  { count: 50, minDist: 55, maxDist: 100, minH: 8, maxH: 50, minW: 2, maxW: 7 },
  { count: 100, minDist: 150, maxDist: 350, minH: 15, maxH: 80, minW: 4, maxW: 12 },
  { count: 150, minDist: 400, maxDist: 700, minH: 20, maxH: 120, minW: 6, maxW: 18 },
  { count: 200, minDist: 800, maxDist: 1500, minH: 30, maxH: 200, minW: 8, maxW: 25 },
]

// シード付き擬似乱数（位置固定用）
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return s / 2147483647
  }
}

export const CityScape: React.FC = () => {
  const meshRef = useRef<ThreeInstancedMesh>(null)

  const buildings = useMemo(() => {
    const rand = seededRandom(12345)
    const dummy = new Object3D()
    const matrices: Matrix4[] = []

    for (const ring of RINGS) {
      for (let i = 0; i < ring.count; i++) {
        const a = (i / ring.count) * Math.PI * 2 + rand() * 0.1
        const dist = ring.minDist + rand() * (ring.maxDist - ring.minDist)
        const h = ring.minH + rand() * (ring.maxH - ring.minH)
        const w = ring.minW + rand() * (ring.maxW - ring.minW)
        const d = w * (0.4 + rand() * 0.6)

        dummy.position.set(Math.cos(a) * dist, h / 2 - 20, Math.sin(a) * dist)
        dummy.scale.set(w, h, d)
        dummy.updateMatrix()
        matrices.push(dummy.matrix.clone())
      }
    }

    return matrices
  }, [])

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

    for (let i = 0; i < buildings.length; i++) {
      mesh.setMatrixAt(i, buildings[i])
    }
    mesh.instanceMatrix.needsUpdate = true
  }, [buildings])

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, buildings.length]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color={COLORS.groundFar} />
    </instancedMesh>
  )
}
