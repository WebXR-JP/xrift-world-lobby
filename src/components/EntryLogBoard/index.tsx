import { useMemo } from 'react'
import { Container, Text } from '@react-three/uikit'

import {
  DEFAULT_STATE_NAMESPACE,
  DEFAULT_MAX_ENTRIES,
  DEFAULT_DISPLAY_NAME_FALLBACK,
  DEFAULT_LABELS,
  DEFAULT_COLORS,
} from './constants'
import { LogRow, ROW_HEIGHT } from './LogRow'
import type { EntryLogBoardProps } from './types'
import { useEntryLog } from './useEntryLog'
import { defaultFormatTimestamp } from './utils'

export type { EntryLogBoardProps } from './types'

const TITLE_HEIGHT = 48
const SEPARATOR_HEIGHT = 1
const PADDING = 24
const GAP = 10

export const EntryLogBoard = ({
  stateNamespace = DEFAULT_STATE_NAMESPACE,
  maxEntries = DEFAULT_MAX_ENTRIES,
  visibleRows = 8,
  formatTimestamp = defaultFormatTimestamp,
  displayNameFallback = DEFAULT_DISPLAY_NAME_FALLBACK,
  labels: labelsOverride,
  colors: colorsOverride,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  pixelSize = 0.005,
  width = 420,
  onJoin,
  onLeave,
}: EntryLogBoardProps) => {
  const labels = useMemo(
    () => ({ ...DEFAULT_LABELS, ...labelsOverride }),
    [labelsOverride],
  )
  const colors = useMemo(
    () => ({ ...DEFAULT_COLORS, ...colorsOverride }),
    [colorsOverride],
  )

  const logs = useEntryLog({
    stateNamespace,
    maxEntries,
    displayNameFallback,
    formatTimestamp,
    onJoin,
    onLeave,
  })

  const reversedLogs = useMemo(() => [...logs].reverse(), [logs])

  // padding*2 + title + gap + separator + gap + rows
  const boardHeight =
    PADDING * 2 + TITLE_HEIGHT + GAP + SEPARATOR_HEIGHT + GAP + ROW_HEIGHT * visibleRows

  return (
    <group position={position} rotation={rotation}>
      <Container
        pixelSize={pixelSize}
        width={width}
        height={boardHeight}
        flexDirection="column"
        padding={PADDING}
        gap={GAP}
        backgroundColor={colors.background}
        borderRadius={16}
        borderWidth={1}
        borderColor="#ffffff1a"
      >
        {/* Title */}
        <Container height={TITLE_HEIGHT} alignItems="center" justifyContent="center">
          <Text fontSize={18} color="#c084fc" fontWeight="bold">
            {'Entry Log'}
          </Text>
        </Container>

        <Container alignSelf="stretch" height={SEPARATOR_HEIGHT} backgroundColor="#ffffff1a" />

        {/* Log rows */}
        <Container flexGrow={1} flexDirection="column" overflow="hidden">
          {reversedLogs.length === 0 ? (
            <Container flexGrow={1} alignItems="center" justifyContent="center">
              <Text fontSize={14} color="#ffffffb3">
                {'No entries yet'}
              </Text>
            </Container>
          ) : (
            reversedLogs.slice(0, visibleRows).map((entry) => (
              <LogRow
                key={entry.id}
                entry={entry}
                labels={labels}
                colors={colors}
              />
            ))
          )}
        </Container>
      </Container>
    </group>
  )
}
