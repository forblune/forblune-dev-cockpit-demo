import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useCockpit } from '../../app/store'
import type { DevSnapshot } from '../../types'
import type { InstrumentReading } from '../widget'
import { buildDemoSnapshot, fetchDevSnapshot } from './devSnapshot'

export function useDevSnapshot(): {
  reading: InstrumentReading<DevSnapshot>
  observerUrl: string | null
  isDemo: boolean
} {
  const observerUrl = useCockpit((s) => s.observerUrl)
  const inferredObserverUrl = useMemo(() => inferObserverUrl(), [])
  const effectiveObserverUrl = observerUrl ?? inferredObserverUrl
  const demo = useMemo(() => buildDemoSnapshot(), [])
  const query = useQuery({
    queryKey: ['dev-snapshot', effectiveObserverUrl],
    queryFn: () => fetchDevSnapshot(effectiveObserverUrl ?? ''),
    enabled: Boolean(effectiveObserverUrl),
    refetchInterval: 8_000,
    retry: 1,
    staleTime: 6_000,
  })

  if (!effectiveObserverUrl || (!query.data && (query.isPending || query.isError))) {
    return {
      observerUrl: effectiveObserverUrl,
      isDemo: true,
      reading: {
        status: 'stale',
        data: demo,
        lastKnown: demo,
        updatedAt: demo.updatedAt,
      },
    }
  }

  const data = query.data ?? null
  const error = query.error instanceof Error ? query.error.message : undefined
  const status = data ? (query.isError ? 'stale' : 'live') : query.isError ? 'offline' : 'stale'

  return {
    observerUrl: effectiveObserverUrl,
    isDemo: false,
    reading: {
      status,
      data,
      lastKnown: data,
      updatedAt: data?.updatedAt ?? null,
      error,
    },
  }
}

// Public demo: no local endpoint is guessed by default. Connect a real observer
// explicitly via the Settings sheet (Demo data endpoint).
function inferObserverUrl(): string | null {
  return null
}
