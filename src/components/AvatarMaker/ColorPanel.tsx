import { useMemo } from 'react'
import { Text } from '@react-three/drei'
import { PlaneGeometry } from 'three'
import { Interactable } from '@xrift/world-components'
import { PARTS, type AvatarColors, type PartId } from './parts'

interface Props {
  colors: AvatarColors
  onSelect: (part: PartId, hex: string) => void
}

export const PANEL_WIDTH = 4.0
const PADDING = 0.16
const TITLE_HEIGHT = 0.36
const ROW_LABEL_WIDTH = 0.42
const ROW_HEIGHT = 0.32
const SWATCH = 0.21
const SWATCH_GAP = 0.045
export const PANEL_HEIGHT = PADDING * 2 + TITLE_HEIGHT + ROW_HEIGHT * PARTS.length

const COLORS = {
  background: '#0a0a0f',
  border: '#9955ff',
  title: '#c084fc',
  label: '#ffffff',
  selected: '#ffffff',
}

/**
 * 部位ごとの色パレット。パネル中心が原点で、+Z を向く。
 * 各色見本は Interactable で、クリックするとその部位の色が変わる
 */
export const ColorPanel: React.FC<Props> = ({ colors, onSelect }) => {
  const top = PANEL_HEIGHT / 2
  const left = -PANEL_WIDTH / 2 + PADDING
  const panelGeo = useMemo(() => new PlaneGeometry(PANEL_WIDTH, PANEL_HEIGHT), [])

  return (
    <group>
      <mesh geometry={panelGeo}>
        <meshBasicMaterial color={COLORS.background} />
      </mesh>
      <lineSegments position={[0, 0, 0.002]}>
        <edgesGeometry args={[panelGeo]} />
        <lineBasicMaterial color={COLORS.border} />
      </lineSegments>

      <Text position={[0, top - PADDING - TITLE_HEIGHT / 2, 0.01]} fontSize={0.17} color={COLORS.title} anchorX="center" anchorY="middle">
        ポンコツキャラクリ
      </Text>

      {PARTS.map((part, row) => {
        const y = top - PADDING - TITLE_HEIGHT - ROW_HEIGHT * row - ROW_HEIGHT / 2
        return (
          <group key={part.id} position={[left, y, 0.01]}>
            <Text fontSize={0.13} color={COLORS.label} anchorX="left" anchorY="middle">
              {part.label}
            </Text>
            {part.palette.map((hex, i) => {
              const x = ROW_LABEL_WIDTH + i * (SWATCH + SWATCH_GAP) + SWATCH / 2
              const selected = colors[part.id] === hex
              return (
                <group key={hex} position={[x, 0, 0]}>
                  {selected && (
                    <mesh position={[0, 0, -0.002]}>
                      <planeGeometry args={[SWATCH + 0.05, SWATCH + 0.05]} />
                      <meshBasicMaterial color={COLORS.selected} />
                    </mesh>
                  )}
                  <Interactable
                    id={`avatar-maker-${part.id}-${i}`}
                    type="button"
                    onInteract={() => onSelect(part.id, hex)}
                    interactionText={`${part.label}の色を変える`}
                  >
                    <mesh>
                      <planeGeometry args={[SWATCH, SWATCH]} />
                      <meshBasicMaterial color={hex} />
                    </mesh>
                  </Interactable>
                </group>
              )
            })}
          </group>
        )
      })}
    </group>
  )
}
