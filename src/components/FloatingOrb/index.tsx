import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'
import { COLORS } from '../../constants'

interface FloatingOrbProps {
  position?: [number, number, number]
  size?: number
  speed?: number
}

export const FloatingOrb: React.FC<FloatingOrbProps> = ({
  position = [0, 3, 0],
  size = 0.3,
  speed = 0.5,
}) => {
  const meshRef = useRef<Mesh>(null)
  const offset = useRef(Math.random() * Math.PI * 2)

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime
    meshRef.current.position.y = position[1] + Math.sin(t * speed + offset.current) * 0.5
    meshRef.current.rotation.y = t * 0.3 * speed
    meshRef.current.rotation.x = t * 0.2 * speed
  })

  return (
    <mesh ref={meshRef} position={position}>
      <icosahedronGeometry args={[size, 2]} />
      <meshPhysicalMaterial
        color={COLORS.glass}
        transparent
        opacity={0.5}
        roughness={0}
        emissive={COLORS.accent}
        emissiveIntensity={0.4}
      />
    </mesh>
  )
}
