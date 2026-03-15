import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, MeshStandardMaterial, DoubleSide } from 'three'
import { COLORS } from '../../constants'
import { GlassPanel } from '../GlassPanel'

export const SpawnArea: React.FC = () => {
  const ring1Ref = useRef<Mesh>(null)
  const ring2Ref = useRef<Mesh>(null)
  const ring3Ref = useRef<Mesh>(null)
  const dotRef = useRef<Mesh>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (ring1Ref.current) ring1Ref.current.rotation.z = t * 0.05
    if (ring2Ref.current) ring2Ref.current.rotation.z = -t * 0.08
    if (ring3Ref.current) ring3Ref.current.rotation.z = t * 0.03
    if (dotRef.current) {
      const mat = dotRef.current.material as MeshStandardMaterial
      mat.emissiveIntensity = 1.5 + Math.sin(t * 2) * 0.5
    }
  })

  return (
    <group>
      {/* 同心円リング1 */}
      <mesh ref={ring1Ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.54, 0]}>
        <ringGeometry args={[2.2, 2.5, 64]} />
        <meshStandardMaterial
          color={COLORS.accent}
          emissive={COLORS.accent}
          emissiveIntensity={1.5}
          transparent
          opacity={0.7}
          side={DoubleSide}
        />
      </mesh>

      {/* 同心円リング2 */}
      <mesh ref={ring2Ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.54, 0]}>
        <ringGeometry args={[1.1, 1.25, 64]} />
        <meshStandardMaterial
          color={COLORS.accent}
          emissive={COLORS.accent}
          emissiveIntensity={1.2}
          transparent
          opacity={0.6}
          side={DoubleSide}
        />
      </mesh>

      {/* 同心円リング3（外周） */}
      <mesh ref={ring3Ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.53, 0]}>
        <ringGeometry args={[3.5, 3.6, 64]} />
        <meshStandardMaterial
          color={COLORS.accent}
          emissive={COLORS.accent}
          emissiveIntensity={0.6}
          transparent
          opacity={0.3}
          side={DoubleSide}
        />
      </mesh>

      {/* 中央ドット */}
      <mesh ref={dotRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.55, 0]}>
        <circleGeometry args={[0.3, 32]} />
        <meshStandardMaterial
          color={COLORS.accent}
          emissive={COLORS.accent}
          emissiveIntensity={2}
        />
      </mesh>

      {/* 8方向の放射線 */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4
        return (
          <mesh
            key={i}
            rotation={[-Math.PI / 2, a, 0]}
            position={[0, 0.53, 0]}
          >
            <planeGeometry args={[5.2, 0.04]} />
            <meshStandardMaterial
              color={COLORS.accent}
              emissive={COLORS.accent}
              emissiveIntensity={0.6}
              transparent
              opacity={0.3}
              side={DoubleSide}
            />
          </mesh>
        )
      })}

      {/* チュートリアルパネル */}
      <GlassPanel width={2.6} height={1.8} position={[-3.5, 2.4, -3.5]} rotation={[0, 0.5, 0]} />
      <GlassPanel width={2.2} height={1.5} position={[3.5, 2.1, -2.5]} rotation={[0, -0.4, 0]} />
      <GlassPanel width={2.8} height={1.8} position={[-3, 2.6, 3]} rotation={[0, -0.3, 0]} />
      <GlassPanel width={2.0} height={1.4} position={[3.5, 2.3, 3]} rotation={[0, 0.3, 0]} />
    </group>
  )
}
