import { SpawnPoint, Portal } from '@xrift/world-components'
import { useThree } from '@react-three/fiber'
import { FogExp2 } from 'three'
import { useEffect } from 'react'
import { Platform } from './components/Platform'
import { GradientSky } from './components/GradientSky'
import { StageWing } from './components/StageWing'
import { CityScape } from './components/CityScape'
import { WingRailings } from './components/WingRailings'
import { COLORS } from './constants'

export interface WorldProps {
  position?: [number, number, number]
  scale?: number
}

function SceneFog() {
  const scene = useThree((s) => s.scene)
  useEffect(() => {
    scene.fog = new FogExp2(COLORS.fog, 0.003)
    return () => { scene.fog = null }
  }, [scene])
  return null
}

export const World: React.FC<WorldProps> = ({ position = [0, 0, 0], scale = 1 }) => {
  return (
    <group position={position} scale={scale}>
      <GradientSky />
      <SceneFog />

      <group position={[0, 0.5, 24.44]}>
        <SpawnPoint />
      </group>

      {/* 照明 */}
      <ambientLight intensity={0.5} color={COLORS.accent} />
      <directionalLight
        position={[15, 35, 20]}
        intensity={1.5}
        color="#ffffff"
      />
      <hemisphereLight args={[COLORS.skyMid, COLORS.skyBottom, 0.4]} />

      <Platform />
      <StageWing />
      <WingRailings />
      <CityScape />

      {/* 東側ポータル */}
      <Portal instanceId="e1f2ba87-fb50-406e-9527-2334cf75cd4c" position={[26, 0.5, 0]} rotation={[0, -Math.PI / 2, 0]} />

      {/* 遠景の地面 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -12, 0]}>
        <planeGeometry args={[4000, 4000]} />
        <meshBasicMaterial color={COLORS.groundFar} />
      </mesh>
    </group>
  )
}
