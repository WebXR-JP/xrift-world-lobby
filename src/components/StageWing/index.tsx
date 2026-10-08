import { Suspense, useMemo } from 'react'
import { RigidBody } from '@react-three/rapier'
import { useTexture } from '@react-three/drei'
import { ScreenShareDisplay, useScreenShareContext, useXRift } from '@xrift/world-components'
import { BoxGeometry, SRGBColorSpace } from 'three'
import { COLORS } from '../../constants'

const SZ = -18

const SCREEN_WIDTH = 15
const SCREEN_HEIGHT = SCREEN_WIDTH * 9 / 16

/** 画面共有していない間だけスクリーンに表示するプレースホルダー */
const ScreenPlaceholder: React.FC = () => {
  const { baseUrl } = useXRift()
  const { videoElement } = useScreenShareContext()
  const texture = useTexture(`${baseUrl}screen-placeholder.jpg`)
  texture.colorSpace = SRGBColorSpace

  // ScreenShareDisplay 標準の案内テキスト(z=0.11)はロゴと重なるため画像で覆い隠す。クリック判定は奪わない
  return (
    <group position={[0, 0, 0.13]} visible={!videoElement}>
      <mesh raycast={() => null}>
        <planeGeometry args={[SCREEN_WIDTH, SCREEN_HEIGHT]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  )
}

export const StageWing: React.FC = () => {
  const screenGeo = useMemo(() => new BoxGeometry(SCREEN_WIDTH, SCREEN_HEIGHT, 0.12), [])

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
        <ScreenShareDisplay id="stage-screen" position={[0, 0, 0.1]} width={SCREEN_WIDTH} />
        <Suspense fallback={null}>
          <ScreenPlaceholder />
        </Suspense>
        <lineSegments>
          <edgesGeometry args={[screenGeo]} />
          <lineBasicMaterial color={COLORS.accent} />
        </lineSegments>
      </group>

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
