import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QueryClient } from '@tanstack/react-query'

/**
 * The load-bearing resilience layer for a tab that stays open for days:
 * per-widget polling, stale-while-revalidate, retry/backoff, refetch-on-reconnect,
 * and a persisted cache so an offline cold-start renders last-known data, not a blank.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // keep cached data ~24h so a cold/offline launch shows the last reading
      gcTime: 1000 * 60 * 60 * 24,
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
    },
  },
})

/** Persists the query cache to localStorage (paired with PersistQueryClientProvider). */
export const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'forblune.cockpit.query-cache',
})
