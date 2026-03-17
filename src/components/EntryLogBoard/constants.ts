import type { Colors, Labels, LogEntry } from './types'

export const DEFAULT_STATE_NAMESPACE = 'entry-log'
export const DEFAULT_MAX_ENTRIES = 10
export const DEFAULT_DISPLAY_NAME_FALLBACK = 'Unknown'

export const DEFAULT_LABELS: Labels = {
  join: 'Joined',
  leave: 'Left',
}

export const DEFAULT_COLORS: Colors = {
  join: '#10b981',
  leave: '#c084fc',
  background: '#0a0a0f',
  text: '#ffffff',
}

export const DEFAULT_LOGS: LogEntry[] = []
