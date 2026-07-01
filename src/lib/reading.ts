import type { InstrumentReading } from '../widgets/widget'

/** The slice of a React Query result we need to derive freshness. */
export interface QueryLike<T> {
  data: T | undefined
  isError: boolean
  error: unknown
  dataUpdatedAt: number
}

/**
 * Collapse a React Query result + connectivity into the uniform InstrumentReading.
 * Honesty rule: never blank once data has been seen — show lastKnown and mark it stale/offline.
 * (When online with no data yet, status is 'live' = connecting; the widget body shows a loading
 * state because data is null.)
 */
export function toReading<T>(q: QueryLike<T>, online: boolean): InstrumentReading<T> {
  const lastKnown = q.data ?? null
  const updatedAt = q.dataUpdatedAt > 0 ? q.dataUpdatedAt : null
  const error = q.isError ? errorMessage(q.error) : undefined
  const degraded = q.isError || !online

  const status: InstrumentReading<T>['status'] = lastKnown
    ? degraded
      ? 'stale'
      : 'live'
    : degraded
      ? 'offline'
      : 'live'

  return { status, data: lastKnown, lastKnown, updatedAt, error }
}

function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message
  return String(e)
}
