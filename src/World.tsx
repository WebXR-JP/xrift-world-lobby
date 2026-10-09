import { SpawnPoint, Portal } from '@xrift/world-components'
import { useThree } from '@react-three/fiber'
import { FogExp2 } from 'three'
import { useEffect } from 'react'
import { Platform } from './components/Platform'
import { GradientSky } from './components/GradientSky'
import { StageWing } from './components/StageWing'
import { CityScape } from './components/CityScape'
import { WingRailings } from './components/WingRailings'
import { EntryLogBoard } from './components/EntryLogBoard'
import { TutorialPanel } from './components/TutorialPanel'
import { TUTORIAL_PANELS } from './components/TutorialPanel/content'
import { COLORS, PLATFORM } from './constants'

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

// 南ウイング西側の手すり（(-WB, R) → (-WT, R + WL)）に沿って、スポーン側から順に並べる
const TUTORIAL_PANEL_PLACEMENTS = (() => {
  const { hubRadius: R, wingLength: WL, wingBaseHalf: WB, wingTipHalf: WT } = PLATFORM
  const slope = (WB - WT) / WL
  const angle = Math.atan(slope)
  const railX = (z: number) => -WB + (z - R) * slope
  const INSET = 0.35 // 手すりからの距離
  const SPACING = 2.7 // 手すりに沿ったパネル間隔
  const START_Z = 23.4
  return [0, 1, 2].map((i) => {
    const z = START_Z - i * SPACING * Math.cos(angle)
    return {
      position: [railX(z) + INSET, 4.2, z] as [number, number, number],
      rotation: [0, Math.PI / 2 + angle, 0] as [number, number, number],
    }
  })
})()

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

      {/* 入退室ログボード（スポーンエリア付近） */}
      <EntryLogBoard position={[4.95988839116469, 2.5, 21.6779343638971]} rotation={[3.141592653589793, -1.413716694115408, 3.141592653589793]} />

      {/* 操作説明パネル（スポーン付近の通路西側に並べる） */}
      {TUTORIAL_PANELS.map((panel, i) => (
        <TutorialPanel
          key={panel.title}
          title={panel.title}
          sections={panel.sections}
          {...TUTORIAL_PANEL_PLACEMENTS[i]}
        />
      ))}

      {/* 東側ポータル */}
      <Portal instanceId="9def5e48-ed0d-4f7e-ba42-7b02ada2a176" position={[26, 0.5, 0]} rotation={[0, -Math.PI / 2, 0]} />
      <Portal instanceId="7ee2dd84-3c4e-47f0-8d5d-dfeb711eafb9" position={[26, 0.5, -3]} rotation={[0, -Math.PI / 2, 0]} />
      <Portal instanceId="0772dea4-b017-4f1c-8afe-9bd0c36c037d" position={[26, 0.5, 3]} rotation={[0, -Math.PI / 2, 0]} />

      {/* 遠景の地面 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -12, 0]}>
        <planeGeometry args={[4000, 4000]} />
        <meshBasicMaterial color={COLORS.groundFar} />
      </mesh>
    </group>
  )
}
