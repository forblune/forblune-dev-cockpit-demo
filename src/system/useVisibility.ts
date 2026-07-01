import { useSyncExternalStore } from 'react'

/** Reactive document visibility — drives polling pause/resume and wake-lock re-acquire. */
export function useVisibility(): DocumentVisibilityState {
  return useSyncExternalStore(
    (cb) => {
      document.addEventListener('visibilitychange', cb)
      return () => document.removeEventListener('visibilitychange', cb)
    },
    () => document.visibilityState,
    () => 'visible',
  )
}
