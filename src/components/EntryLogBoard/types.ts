export type LogType = 'join' | 'leave'

export interface LogEntry {
  id: string
  type: LogType
  userId: string
  displayName: string
  avatarUrl: string | null
  timestamp: string
}

export interface UserJoinedEvent {
  userId: string
  isGuest: boolean
}

export interface UserLeftEvent {
  userId: string
}

export interface Labels {
  join: string
  leave: string
}

export interface Colors {
  join: string
  leave: string
  background: string
  text: string
}

export interface EntryLogBoardProps {
  stateNamespace?: string
  /** 保持する最大ログ件数 */
  maxEntries?: number
  /** ボードに同時表示する行数（高さ固定の基準） */
  visibleRows?: number
  formatTimestamp?: (date: Date) => string
  displayNameFallback?: string
  labels?: Partial<Labels>
  colors?: Partial<Colors>
  position?: [number, number, number]
  rotation?: [number, number, number]
  pixelSize?: number
  width?: number
  onJoin?: (entry: LogEntry) => void
  onLeave?: (entry: LogEntry) => void
}
