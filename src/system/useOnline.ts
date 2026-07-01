import { useSyncExternalStore } from 'react'

/** Reactive online/offline state (connectivity events are also broadcast on the bus). */
export function useOnline(): boolean {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener('online', cb)
      window.addEventListener('offline', cb)
      return () => {
        window.removeEventListener('online', cb)
        window.removeEventListener('offline', cb)
      }
    },
    () => navigator.onLine,
    () => true,
  )
}
