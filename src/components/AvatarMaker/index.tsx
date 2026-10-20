import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Text } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { PlaneGeometry } from 'three'
import { Interactable, useXRift } from '@xrift/world-components'
import { ColorPanel, PANEL_HEIGHT } from './ColorPanel'
import { Preview, type PreviewStatus } from './Preview'
import { useAvatarMaker } from './useAvatarMaker'
import { exportVrm } from './exportVrm'
import { avatarFilename, downloadBlob } from './download'
import { PARTS } from './parts'
import { shadeOf } from './color'

interface Props {
  position?: [number, number, number]
  rotation?: [number, number, number]
}

const BASE_VRM = 'avatar-base.vrm'
const PANEL_BOTTOM_Y = 0.85
const BUTTON_ROW_Y = 0.55
const BUTTON_HEIGHT = 0.26
const BUTTON_GAP = 0.08
const MESSAGE_DURATION_MS = 4000

const BUTTON_COLORS = {
  background: '#1a1a2e',
  border: '#9955ff',
  text: '#ffffff',
  disabled: '#555566',
}

interface ButtonProps {
  id: string
  label: string
  width: number
  position: [number, number, number]
  enabled?: boolean
  onInteract: () => void
}

const Button: React.FC<ButtonProps> = ({ id, label, width, position, enabled = true, onInteract }) => {
  const geo = useMemo(() => new PlaneGeometry(width, BUTTON_HEIGHT), [width])
  return (
    <group position={position}>
      <Interactable id={id} type="button" onInteract={onInteract} interactionText={label} enabled={enabled}>
        <mesh geometry={geo}>
          <meshBasicMaterial color={BUTTON_COLORS.background} />
        </mesh>
      </Interactable>
      <lineSegments position={[0, 0, 0.002]}>
        <edgesGeometry args={[geo]} />
        <lineBasicMaterial color={enabled ? BUTTON_COLORS.border : BUTTON_COLORS.disabled} />
      </lineSegments>
      <Text
        position={[0, 0, 0.01]}
        fontSize={0.11}
        color={enabled ? BUTTON_COLORS.text : BUTTON_COLORS.disabled}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  )
}

/**
 * キャラクリブース。原点は床の高さ、+X 方向が正面（利用者が立つ側）。
 * 色パレットのパネルを背面に、プレビュー台をその手前に置く
 */
export const AvatarMaker: React.FC<Props> = ({ position = [0, 0, 0], rotation = [0, 0, 0] }) => {
  const { baseUrl } = useXRift()
  const { state, setColor, rotate, reset } = useAvatarMaker()
  const gl = useThree((s) => s.gl)
  const [previewStatus, setPreviewStatus] = useState<PreviewStatus>('loading')
  const [message, setMessage] = useState<string | null>(null)
  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [busy, setBusy] = useState(false)

  const showMessage = useCallback((text: string) => {
    setMessage(text)
    if (messageTimer.current) clearTimeout(messageTimer.current)
    messageTimer.current = setTimeout(() => setMessage(null), MESSAGE_DURATION_MS)
  }, [])

  useEffect(
    () => () => {
      if (messageTimer.current) clearTimeout(messageTimer.current)
    },
    [],
  )

  const handleDownload = useCallback(async () => {
    if (busy || previewStatus !== 'ready') return
    if (gl.xr.isPresenting) {
      showMessage('VR を終了してからダウンロードしてください')
      return
    }
    setBusy(true)
    try {
      const colors = Object.fromEntries(
        PARTS.map((p) => [p.id, { base: state.colors[p.id], shade: shadeOf(state.colors[p.id]) }]),
      )
      const blob = await exportVrm(`${baseUrl}${BASE_VRM}`, colors)
      downloadBlob(blob, avatarFilename())
      showMessage('ダウンロードを開始しました')
    } catch (e) {
      console.error('AvatarMaker: VRM の書き出しに失敗', e)
      showMessage('ダウンロードに失敗しました')
    } finally {
      setBusy(false)
    }
  }, [busy, previewStatus, gl, state.colors, baseUrl, showMessage])

  const canDownload = previewStatus === 'ready' && !busy

  // ボタンは左から順に詰めて並べ、全体を中央に寄せる
  const buttonDefs = [
    { id: 'avatar-maker-rotate-left', label: '◀ 回す', width: 0.75, enabled: true, onInteract: () => rotate(-1) },
    { id: 'avatar-maker-rotate-right', label: '回す ▶', width: 0.75, enabled: true, onInteract: () => rotate(1) },
    { id: 'avatar-maker-reset', label: 'リセット', width: 0.85, enabled: true, onInteract: reset },
    {
      id: 'avatar-maker-download',
      label: busy ? '書き出し中...' : 'VRM をダウンロード',
      width: 1.4,
      enabled: canDownload,
      onInteract: handleDownload,
    },
  ]
  const totalWidth = buttonDefs.reduce((w, b) => w + b.width, 0) + BUTTON_GAP * (buttonDefs.length - 1)
  let cursor = -totalWidth / 2
  const buttonLayout = buttonDefs.map((b) => {
    const x = cursor + b.width / 2
    cursor += b.width + BUTTON_GAP
    return { ...b, x }
  })

  return (
    <group position={position} rotation={rotation}>
      {/* 背面のパネル（+X を向く） */}
      <group position={[0, PANEL_BOTTOM_Y + PANEL_HEIGHT / 2, -0.6]} rotation={[0, Math.PI / 2, 0]}>
        <ColorPanel colors={state.colors} onSelect={setColor} />
      </group>

      {/* 操作ボタン（パネルの下） */}
      <group position={[0, BUTTON_ROW_Y, -0.6]} rotation={[0, Math.PI / 2, 0]}>
        {buttonLayout.map((b) => (
          <Button
            key={b.id}
            id={b.id}
            label={b.label}
            width={b.width}
            position={[b.x, 0, 0]}
            enabled={b.enabled}
            onInteract={b.onInteract}
          />
        ))}
        {message && (
          <Text position={[0, -0.28, 0.01]} fontSize={0.11} color="#ffd23f" anchorX="center" anchorY="middle">
            {message}
          </Text>
        )}
      </group>

      {/* プレビュー台 */}
      <group position={[2.4, 0, 2.4]}>
        <mesh position={[0, 0.075, 0]}>
          <cylinderGeometry args={[0.6, 0.65, 0.15, 48]} />
          <meshStandardMaterial color="#c4c0cc" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.151, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.52, 0.56, 48]} />
          <meshBasicMaterial color="#9955ff" />
        </mesh>
        <Preview
          url={`${baseUrl}${BASE_VRM}`}
          colors={state.colors}
          rotation={state.rotation}
          position={[0, 0.15, 0]}
          onStatusChange={setPreviewStatus}
        />
      </group>
    </group>
  )
}
