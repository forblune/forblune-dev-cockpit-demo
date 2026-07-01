import { useEffect } from 'react'

// Minimal local typing so we don't depend on lib.dom Wake Lock declarations.
interface WakeLockSentinelLike {
  release: () => Promise<void>
}
interface WakeLockLike {
  request: (type: 'screen') => Promise<WakeLockSentinelLike>
}

/**
 * Keep the screen lit while enabled. Re-acquires on visibility change, since iOS
 * releases the lock whenever the tab is backgrounded. Non-fatal if unsupported.
 */
export function useWakeLock(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return
    const wakeLock = (navigator as Navigator & { wakeLock?: WakeLockLike }).wakeLock
    if (!wakeLock) return

    let sentinel: WakeLockSentinelLike | null = null
    let cancelled = false

    const request = async () => {
      try {
        sentinel = await wakeLock.request('screen')
      } catch {
        // rejected (not a secure context, low battery, etc.) — ignore
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible' && !cancelled) void request()
    }

    void request()
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibility)
      void sentinel?.release().catch(() => {})
    }
  }, [enabled])
}
