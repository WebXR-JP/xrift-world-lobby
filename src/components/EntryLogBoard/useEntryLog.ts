import { useEffect, useMemo, useRef } from 'react'
import {
  useUsers,
  useInstanceState,
  useInstanceEvent,
} from '@xrift/world-components'

import { DEFAULT_LOGS } from './constants'
import type { LogEntry, UserJoinedEvent, UserLeftEvent } from './types'
import { createLogEntry, enrichLogsWithCache, isWriterAmong, mergeLogs } from './utils'

export interface UseEntryLogOptions {
  stateNamespace: string
  maxEntries: number
  displayNameFallback: string
  formatTimestamp: (date: Date) => string
  onJoin?: (entry: LogEntry) => void
  onLeave?: (entry: LogEntry) => void
}

export function useEntryLog(options: UseEntryLogOptions): LogEntry[] {
  const { localUser, remoteUsers } = useUsers()
  const [logs, setLogs] = useInstanceState<LogEntry[]>(
    `${options.stateNamespace}-logs`,
    DEFAULT_LOGS,
  )

  const logsRef = useRef(logs)
  logsRef.current = logs

  const optionsRef = useRef(options)
  optionsRef.current = options

  const userCacheRef = useRef(
    new Map<string, { displayName: string; avatarUrl: string | null }>(),
  )
  if (localUser) {
    userCacheRef.current.set(localUser.id, {
      displayName: localUser.displayName,
      avatarUrl: localUser.avatarUrl,
    })
  }
  for (const user of remoteUsers) {
    userCacheRef.current.set(user.id, {
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    })
  }

  // 自分自身の入室ログ補完（最初のユーザーのみ）
  const selfJoinedRef = useRef(false)
  useEffect(() => {
    if (!localUser || selfJoinedRef.current) return
    selfJoinedRef.current = true
    const alreadyJoined = logsRef.current.some(
      (log) => log.type === 'join' && log.userId === localUser.id,
    )
    if (alreadyJoined) return
    if (remoteUsers.length > 0) return
    const opts = optionsRef.current
    const entry = createLogEntry(
      'join',
      localUser.id,
      localUser.displayName,
      localUser.avatarUrl,
      logsRef.current,
      opts.formatTimestamp,
    )
    setLogs((prev) => mergeLogs(prev, entry, opts.maxEntries))
    opts.onJoin?.(entry)
  }, [localUser, setLogs])

  // user-joined イベント
  useInstanceEvent<UserJoinedEvent>('user-joined', (data) => {
    if (!localUser) return
    const existingIds = [
      localUser.id,
      ...remoteUsers.filter((u) => u.id !== data.userId).map((u) => u.id),
    ]
    if (!isWriterAmong(existingIds, localUser.id)) return

    const opts = optionsRef.current
    const cached = userCacheRef.current.get(data.userId)
    const entry = createLogEntry(
      'join',
      data.userId,
      cached?.displayName ?? opts.displayNameFallback,
      cached?.avatarUrl ?? null,
      logsRef.current,
      opts.formatTimestamp,
    )
    setLogs((prev) => mergeLogs(prev, entry, opts.maxEntries))
    opts.onJoin?.(entry)
  })

  // user-left イベント
  useInstanceEvent<UserLeftEvent>('user-left', (data) => {
    if (!localUser) return
    const remainingIds = [
      localUser.id,
      ...remoteUsers.filter((u) => u.id !== data.userId).map((u) => u.id),
    ]
    if (!isWriterAmong(remainingIds, localUser.id)) return

    const opts = optionsRef.current
    const cached = userCacheRef.current.get(data.userId)
    const entry = createLogEntry(
      'leave',
      data.userId,
      cached?.displayName ?? opts.displayNameFallback,
      cached?.avatarUrl ?? null,
      logsRef.current,
      opts.formatTimestamp,
    )
    setLogs((prev) => mergeLogs(prev, entry, opts.maxEntries))
    opts.onLeave?.(entry)
  })

  // Unknown ログの永続修復（ライターのみ）
  useEffect(() => {
    if (!localUser) return
    const fallback = optionsRef.current.displayNameFallback
    const currentLogs = logsRef.current
    if (!currentLogs.some((log) => log.displayName === fallback)) return

    const allIds = [localUser.id, ...remoteUsers.map((u) => u.id)]
    if (!isWriterAmong(allIds, localUser.id)) return

    const fixedLogs = enrichLogsWithCache(
      currentLogs,
      fallback,
      userCacheRef.current,
    )
    if (fixedLogs !== currentLogs) {
      setLogs(fixedLogs)
    }
  }, [localUser, remoteUsers, setLogs])

  // Unknown ログをキャッシュで補完して返す
  const cacheSize = userCacheRef.current.size
  return useMemo(
    () =>
      enrichLogsWithCache(
        logs,
        options.displayNameFallback,
        userCacheRef.current,
      ),
    [logs, options.displayNameFallback, cacheSize],
  )
}
