import { useEffect, useState } from 'react'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { VRMLoaderPlugin, VRMUtils, type VRM } from '@pixiv/three-vrm'
import type { Material, Mesh } from 'three'
import type { AvatarColors } from './parts'
import { shadeOf } from './color'

interface Props {
  url: string
  colors: AvatarColors
  /** 45° 単位の回転ステップ数 */
  rotation: number
  position?: [number, number, number]
  onStatusChange?: (status: PreviewStatus) => void
}

export type PreviewStatus = 'loading' | 'ready' | 'error'

// VRM 1.0 は +Z を正面として作られる。ブースは +X を正面にするので 90° 回す
const BASE_ROTATION_Y = Math.PI / 2

const isMToon = (m: Material): m is Material & { color: { set: (c: string) => void }; shadeColorFactor: { set: (c: string) => void } } =>
  (m as { isMToonMaterial?: boolean }).isMToonMaterial === true

/** ベース VRM を three-vrm で表示し、共有ステートの色と向きを反映するプレビュー */
export const Preview: React.FC<Props> = ({ url, colors, rotation, position = [0, 0, 0], onStatusChange }) => {
  const [vrm, setVrm] = useState<VRM | null>(null)
  const [status, setStatus] = useState<PreviewStatus>('loading')

  useEffect(() => {
    let disposed = false
    let loaded: VRM | null = null
    const loader = new GLTFLoader()
    loader.register((parser) => new VRMLoaderPlugin(parser))
    loader
      .loadAsync(url)
      .then((gltf) => {
        const result = gltf.userData.vrm as VRM
        if (disposed) {
          VRMUtils.deepDispose(result.scene)
          return
        }
        VRMUtils.removeUnnecessaryVertices(result.scene)
        VRMUtils.combineSkeletons(result.scene)
        loaded = result
        setVrm(result)
        setStatus('ready')
      })
      .catch((e) => {
        console.error('AvatarMaker: VRM の読み込みに失敗', e)
        if (!disposed) setStatus('error')
      })
    return () => {
      disposed = true
      if (loaded) VRMUtils.deepDispose(loaded.scene)
    }
  }, [url])

  useEffect(() => {
    onStatusChange?.(status)
  }, [status, onStatusChange])

  // MToon はシェーダーの uniform（alphaTest など）を update() で同期するので毎フレーム呼ぶ
  useFrame((_, delta) => {
    vrm?.update(delta)
  })

  // 色の反映。Color.set は sRGB の 16 進数をリニアに変換してくれる
  useEffect(() => {
    if (!vrm) return
    vrm.scene.traverse((obj) => {
      const mesh = obj as Mesh
      if (!mesh.isMesh) return
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const material of materials) {
        const hex = colors[material.name as keyof AvatarColors]
        if (!hex || !isMToon(material)) continue
        material.color.set(hex)
        material.shadeColorFactor.set(shadeOf(hex))
      }
    })
  }, [vrm, colors])

  return (
    <group position={position} rotation={[0, BASE_ROTATION_Y + rotation * (Math.PI / 4), 0]}>
      {vrm && <primitive object={vrm.scene} />}
      {status !== 'ready' && (
        <Text position={[0, 0.8, 0]} fontSize={0.12} color={status === 'error' ? '#ff6b8a' : '#ffffff'} anchorX="center" anchorY="middle">
          {status === 'error' ? '読み込みに失敗しました' : '読み込み中...'}
        </Text>
      )}
    </group>
  )
}
