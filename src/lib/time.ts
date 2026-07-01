/** Relative time in Korean: "방금", "12초 전", "3분 전", "2시간 전", "1일 전". */
export function relativeTime(epochMs: number | null, now: number = Date.now()): string {
  if (epochMs == null) return '—'
  const diff = Math.max(0, now - epochMs)
  const s = Math.floor(diff / 1000)
  if (s < 5) return '방금'
  if (s < 60) return `${s}초 전`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}분 전`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}시간 전`
  const d = Math.floor(h / 24)
  return `${d}일 전`
}

/** mm:ss for a duration in ms (clamped at 0). */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
