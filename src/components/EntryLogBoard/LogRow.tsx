import { Container, Text } from '@react-three/uikit'

import { AvatarIcon } from './AvatarIcon'
import type { Colors, Labels, LogEntry } from './types'

export const ROW_HEIGHT = 44

export const LogRow = ({
  entry,
  labels,
  colors,
}: {
  entry: LogEntry
  labels: Labels
  colors: Colors
}) => {
  const labelColor = entry.type === 'join' ? colors.join : colors.leave
  const labelText = entry.type === 'join' ? labels.join : labels.leave

  return (
    <Container
      alignSelf="stretch"
      flexDirection="row"
      alignItems="center"
      height={ROW_HEIGHT}
      gap={10}
      paddingLeft={4}
      paddingRight={4}
    >
      <AvatarIcon avatarUrl={entry.avatarUrl} />
      <Text fontSize={12} color="#ffffffb3">
        {entry.timestamp}
      </Text>
      <Container flexGrow={1}>
        <Text fontSize={14} color={colors.text}>
          {entry.displayName}
        </Text>
      </Container>
      <Text fontSize={13} color={labelColor} fontWeight="bold">
        {labelText}
      </Text>
    </Container>
  )
}
