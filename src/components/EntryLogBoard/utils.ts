import type { LogEntry, LogType } from './types'

export const defaultFormatTimestamp = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

export const buildLogEntryId = (
  type: LogType,
  userId: string,
  existingLogs: LogEntry[],
): string => {
  const sameTypeCount = existingLogs.filter(
    (log) => log.type === type && log.userId === userId,
  ).length
  return `${type}-${userId}-${sameTypeCount}`
}

export const createLogEntry = (
  type: LogType,
  userId: string,
  displayName: string,
  avatarUrl: string | null,
  existingLogs: LogEntry[],
  formatTimestamp: (date: Date) => string,
): LogEntry => ({
  id: buildLogEntryId(type, userId, existingLogs),
  type,
  userId,
  displayName,
  avatarUrl,
  timestamp: formatTimestamp(new Date()),
})

export const isWriterAmong = (
  candidateIds: (string | undefined)[],
  targetId: string | undefined,
): boolean => {
  if (!targetId) return false
  const sorted = candidateIds.filter((id): id is string => id != null).sort()
  return sorted.length > 0 && sorted[0] === targetId
}

export const enrichLogsWithCache = (
  logs: LogEntry[],
  fallbackName: string,
  cache: Map<string, { displayName: string; avatarUrl: string | null }>,
): LogEntry[] => {
  let needsEnrich = false
  for (const log of logs) {
    if (log.displayName === fallbackName && cache.has(log.userId)) {
      needsEnrich = true
      break
    }
  }
  if (!needsEnrich) return logs
  return logs.map((log) => {
    if (log.displayName !== fallbackName) return log
    const cached = cache.get(log.userId)
    if (!cached) return log
    return { ...log, displayName: cached.displayName, avatarUrl: cached.avatarUrl }
  })
}

export const mergeLogs = (
  existingLogs: LogEntry[],
  newEntry: LogEntry,
  maxEntries: number,
): LogEntry[] => {
  if (existingLogs.some((log) => log.id === newEntry.id)) return existingLogs
  return [...existingLogs, newEntry].slice(-maxEntries)
}
