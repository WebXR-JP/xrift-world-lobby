import { SpawnPoint } from '@xrift/world-components'
import { Platform } from './components/Platform'
import { GradientSky } from './components/GradientSky'
import { StageWing } from './components/StageWing'
import { ViewingDeck } from './components/ViewingDeck'
import { CityScape } from './components/CityScape'
import { WingRailings } from './components/WingRailings'
import { COLORS } from './constants'

export interface WorldProps {
  position?: [number, number, number]
  scale?: number
}

export const World: React.FC<WorldProps> = ({ position = [0, 0, 0], scale = 1 }) => {
  return (
    <group position={position} scale={scale}>
      <GradientSky />
      <fogExp2 attach="fog" args={[COLORS.fog, 0.005]} />

      <group position={[0, 0.5, 0]}>
        <SpawnPoint />
      </group>

      {/* 照明 */}
      <ambientLight intensity={0.5} color={COLORS.accent} />
      <directionalLight
        position={[15, 35, 20]}
        intensity={1.5}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={70}
        shadow-camera-left={-35}
        shadow-camera-right={35}
        shadow-camera-top={35}
        shadow-camera-bottom={-35}
        shadow-bias={-0.001}
      />
      <directionalLight
        position={[-15, 20, -10]}
        intensity={0.35}
        color={COLORS.accent}
      />
      <hemisphereLight args={[COLORS.skyMid, COLORS.skyBottom, 0.4]} />

      <Platform />

      {/* 中央スポーンエリア */}


      {/* 接続パス */}


      <StageWing />

      {/* ③ ラウンジ（東西ウイング） */}


      <ViewingDeck />
      <WingRailings />
      <CityScape />

      {/* 遠景の地面 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -12, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color={COLORS.groundFar} transparent opacity={0.6} />
      </mesh>
    </group>
  )
}
