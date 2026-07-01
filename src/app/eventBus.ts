import { useEffect, useRef } from 'react'

/**
 * Tiny typed pub/sub — the demo workspace data-plane seam.
 * MVP consumers: StatusBar (connectivity), widget-frame flash (ci-failed).
 * Future consumers (notifications, automations, voice) attach here without touching emitters.
 */
export type CockpitEvent =
  | { type: 'pomodoro:phase'; phase: 'idle' | 'focus' | 'break' }
  | { type: 'github:ci-failed'; repo: string; pr: number }
  | { type: 'connectivity'; online: boolean }

type Handler = (e: CockpitEvent) => void

const handlers = new Set<Handler>()

export const bus = {
  emit(e: CockpitEvent): void {
    for (const h of handlers) h(e)
  },
  on(h: Handler): () => void {
    handlers.add(h)
    return () => {
      handlers.delete(h)
    }
  },
}

/** Subscribe to the bus for a component's lifetime (handler may change between renders). */
export function useBusEvent(handler: Handler): void {
  const ref = useRef(handler)
  ref.current = handler
  useEffect(() => bus.on((e) => ref.current(e)), [])
}
