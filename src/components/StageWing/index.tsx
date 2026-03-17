import { useMemo, useState, useCallback } from 'react'
import { RigidBody } from '@react-three/rapier'
import { ScreenShareDisplay, LiveVideoPlayer, Interactable } from '@xrift/world-components'
import { Container, Text } from '@react-three/uikit'
import { BoxGeometry } from 'three'
import { COLORS } from '../../constants'

const SZ = -18

const SCREEN_WIDTH = 15
const SCREEN_HEIGHT = SCREEN_WIDTH * 9 / 16

type ScreenMode = 'screen-share' | 'live-video'

export const StageWing: React.FC = () => {
  const screenGeo = useMemo(() => new BoxGeometry(SCREEN_WIDTH, SCREEN_HEIGHT, 0.12), [])
  const [mode, setMode] = useState<ScreenMode>('screen-share')

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'screen-share' ? 'live-video' : 'screen-share'))
  }, [])

  return (
    <group>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0.9, SZ]} castShadow receiveShadow>
          <boxGeometry args={[10, 0.8, 8]} />
          <meshStandardMaterial color={COLORS.structure} roughness={0.2} />
        </mesh>
      </RigidBody>

      {/* ステージエッジアクセント */}
      <mesh position={[0, 1.32, SZ + 4]}>
        <boxGeometry args={[10, 0.06, 0.08]} />
        <meshStandardMaterial color={COLORS.accent} emissive={COLORS.accent} emissiveIntensity={1.5} />
      </mesh>
      {[-5, 5].map((x) => (
        <mesh key={x} position={[x, 0.9, SZ + 4]}>
          <boxGeometry args={[0.06, 0.85, 0.06]} />
          <meshStandardMaterial color={COLORS.accent} emissive={COLORS.accent} emissiveIntensity={0.8} />
        </mesh>
      ))}

      {/* メインスクリーン（客席向き） */}
      <group position={[0, 7.03, -21.84]}>
        {mode === 'screen-share' ? (
          <ScreenShareDisplay id="stage-screen" position={[0, 0, 0.1]} width={SCREEN_WIDTH} />
        ) : (
          <LiveVideoPlayer id="stage-screen" position={[0, 0, 0.1]} width={SCREEN_WIDTH} sync="global" />
        )}
        <lineSegments>
          <edgesGeometry args={[screenGeo]} />
          <lineBasicMaterial color={COLORS.accent} />
        </lineSegments>
      </group>

      {/* 返しモニター（登壇者向き） */}
      {mode === 'screen-share' ? (
        <ScreenShareDisplay id="stage-screen" position={[0, 2.5, -14.12]} width={2} rotation={[-2.83, 0, Math.PI]} />
      ) : (
        <LiveVideoPlayer id="stage-screen" position={[0, 2.5, -14.12]} width={2} rotation={[-2.83, 0, Math.PI]} sync="global" />
      )}

      {/* スクリーン切り替えパネル（返しモニター横） */}
      <Interactable
        id="stage-screen-mode-toggle"
        type="button"
        onInteract={toggleMode}
        interactionText={mode === 'screen-share' ? 'ライブ配信に切替' : '画面共有に切替'}
      >
        <group position={[1.6, 2.5, -14.12]} rotation={[-2.83, 0, Math.PI]}>
          <Container
            pixelSize={0.003}
            width={320}
            flexDirection="column"
            alignItems="center"
            gap={10}
            padding={16}
            backgroundColor="#1a1a2ecc"
            borderRadius={12}
            borderWidth={2}
            borderColor={mode === 'screen-share' ? COLORS.accent : '#ff6b8a'}
          >
            <Text fontSize={13} color="#ffffffaa">
              {'Screen Mode'}
            </Text>
            <Container
              alignSelf="stretch"
              paddingTop={10}
              paddingBottom={10}
              backgroundColor={mode === 'screen-share' ? COLORS.accent : '#ff6b8a'}
              borderRadius={8}
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize={18} color="white" fontWeight="bold">
                {mode === 'screen-share' ? 'Screen Share' : 'Live Video'}
              </Text>
            </Container>
            <Text fontSize={11} color="#ffffff66">
              {'Click to switch'}
            </Text>
          </Container>
        </group>
      </Interactable>

      {/* 階段 */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0.7, SZ + 4.5]} receiveShadow>
          <boxGeometry args={[6, 0.4, 1]} />
          <meshStandardMaterial color={COLORS.structureDark} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0.45, SZ + 5.3]} receiveShadow>
          <boxGeometry args={[6, 0.2, 1]} />
          <meshStandardMaterial color={COLORS.structure} />
        </mesh>
      </RigidBody>
    </group>
  )
}
