import { useMemo } from 'react'
import { Text } from '@react-three/drei'
import { Shape, ShapeGeometry } from 'three'

export interface TutorialSection {
  heading?: string
  rows: [key: string, description: string][]
}

export interface TutorialPanelProps {
  title: string
  sections: TutorialSection[]
  position?: [number, number, number]
  rotation?: [number, number, number]
}

const WIDTH = 2.5
const PADDING = 0.16
const TITLE_SIZE = 0.16
const TITLE_HEIGHT = 0.36
const HEADING_SIZE = 0.1
const HEADING_HEIGHT = 0.24
const ROW_SIZE = 0.095
const ROW_HEIGHT = 0.19
const SECTION_GAP = 0.1
const KEY_COLUMN = 0.85
const RADIUS = 0.08

const COLORS = {
  background: '#0a0a0f',
  border: '#9955ff',
  title: '#c084fc',
  heading: '#ffffff',
  key: '#c084fc',
  text: '#ffffff',
}

const createRoundedRect = (width: number, height: number, radius: number) => {
  const x = -width / 2
  const y = -height / 2
  const shape = new Shape()
  shape.moveTo(x + radius, y)
  shape.lineTo(x + width - radius, y)
  shape.quadraticCurveTo(x + width, y, x + width, y + radius)
  shape.lineTo(x + width, y + height - radius)
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  shape.lineTo(x + radius, y + height)
  shape.quadraticCurveTo(x, y + height, x, y + height - radius)
  shape.lineTo(x, y + radius)
  shape.quadraticCurveTo(x, y, x + radius, y)
  return new ShapeGeometry(shape, 6)
}

/** 操作説明用の掲示パネル。パネル上辺の中央が position になり、高さは内容に合わせて伸びる */
export const TutorialPanel: React.FC<TutorialPanelProps> = ({
  title,
  sections,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) => {
  // 各行の y 座標（パネル上端からのオフセット）を先に計算し、高さを内容に合わせる
  const { items, height } = useMemo(() => {
    const items: { type: 'heading' | 'row'; y: number; key?: string; text: string }[] = []
    let cursor = PADDING + TITLE_HEIGHT
    sections.forEach((section, i) => {
      if (i > 0) cursor += SECTION_GAP
      if (section.heading) {
        items.push({ type: 'heading', y: cursor + HEADING_HEIGHT / 2, text: section.heading })
        cursor += HEADING_HEIGHT
      }
      section.rows.forEach(([key, text]) => {
        items.push({ type: 'row', y: cursor + ROW_HEIGHT / 2, key, text })
        cursor += ROW_HEIGHT
      })
    })
    return { items, height: cursor + PADDING }
  }, [sections])

  const geometry = useMemo(() => createRoundedRect(WIDTH, height, RADIUS), [height])
  const top = height / 2
  const left = -WIDTH / 2 + PADDING

  return (
    <group position={position} rotation={rotation}>
      <group position={[0, -height / 2, 0]}>
        <mesh geometry={geometry}>
          <meshBasicMaterial color={COLORS.background} />
        </mesh>
        <lineSegments position={[0, 0, 0.002]}>
          <edgesGeometry args={[geometry]} />
          <lineBasicMaterial color={COLORS.border} />
        </lineSegments>

        <Text
          position={[0, top - PADDING - TITLE_HEIGHT / 2, 0.01]}
          fontSize={TITLE_SIZE}
          color={COLORS.title}
          anchorX="center"
          anchorY="middle"
        >
          {title}
        </Text>
        <mesh position={[0, top - PADDING - TITLE_HEIGHT + 0.02, 0.005]}>
          <planeGeometry args={[WIDTH - PADDING * 2, 0.006]} />
          <meshBasicMaterial color={COLORS.border} transparent opacity={0.5} />
        </mesh>

        {items.map((item, i) =>
          item.type === 'heading' ? (
            <Text
              key={i}
              position={[left, top - item.y, 0.01]}
              fontSize={HEADING_SIZE}
              color={COLORS.heading}
              anchorX="left"
              anchorY="middle"
            >
              {item.text}
            </Text>
          ) : (
            <group key={i} position={[left, top - item.y, 0.01]}>
              <Text fontSize={ROW_SIZE} color={COLORS.key} anchorX="left" anchorY="middle">
                {item.key}
              </Text>
              <Text
                position={[KEY_COLUMN, 0, 0]}
                fontSize={ROW_SIZE}
                color={COLORS.text}
                fillOpacity={0.85}
                anchorX="left"
                anchorY="middle"
              >
                {item.text}
              </Text>
            </group>
          ),
        )}
      </group>
    </group>
  )
}
