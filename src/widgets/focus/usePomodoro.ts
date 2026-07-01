import { useCallback, useEffect, useState } from 'react'
import { bus } from '../../app/eventBus'
import { useCockpit } from '../../app/store'
import type { PomodoroPhase } from '../../types'

export interface PomodoroView {
  phase: PomodoroPhase
  remainingMs: number
  running: boolean
  paused: boolean
  task: string
  start: (phase?: 'focus' | 'break') => void
  pause: () => void
  resume: () => void
  reset: () => void
  skip: () => void
  setTask: (t: string) => void
}

/**
 * Drift-free pomodoro: remaining time is derived from an absolute `endsAt` epoch,
 * never tick-counted, so it stays correct across multi-day uptime and tab throttling.
 * Runtime state is persisted, so it survives a reload / silent refresh.
 */
export function usePomodoro(): PomodoroView {
  const timer = useCockpit((s) => s.timer)
  const setTimer = useCockpit((s) => s.setTimer)
  const pomodoro = useCockpit((s) => s.pomodoro)
  const [, force] = useState(0)

  const durationMs = useCallback(
    (phase: 'focus' | 'break') =>
      (phase === 'focus' ? pomodoro.focusMin : pomodoro.breakMin) * 60_000,
    [pomodoro.focusMin, pomodoro.breakMin],
  )

  // Single interval that both ticks the display and completes the phase at endsAt.
  useEffect(() => {
    if (timer.endsAt === null) return
    const tick = () => {
      if (timer.endsAt !== null && Date.now() >= timer.endsAt) {
        const next: PomodoroPhase = timer.phase === 'focus' ? 'break' : 'idle'
        setTimer({ phase: next, endsAt: null, pausedRemainingMs: null })
        bus.emit({ type: 'pomodoro:phase', phase: next })
      } else {
        force((n) => (n + 1) % 1_000_000)
      }
    }
    const id = setInterval(tick, 250)
    return () => clearInterval(id)
  }, [timer.endsAt, timer.phase, setTimer])

  const running = timer.endsAt !== null
  const paused = !running && timer.pausedRemainingMs !== null
  const remainingMs =
    timer.endsAt !== null
      ? Math.max(0, timer.endsAt - Date.now())
      : (timer.pausedRemainingMs ?? durationMs(timer.phase === 'break' ? 'break' : 'focus'))

  const start = useCallback(
    (phase: 'focus' | 'break' = 'focus') => {
      setTimer({ phase, endsAt: Date.now() + durationMs(phase), pausedRemainingMs: null })
      bus.emit({ type: 'pomodoro:phase', phase })
    },
    [durationMs, setTimer],
  )

  const pause = useCallback(() => {
    if (timer.endsAt === null) return
    setTimer({ endsAt: null, pausedRemainingMs: Math.max(0, timer.endsAt - Date.now()) })
  }, [timer.endsAt, setTimer])

  const resume = useCallback(() => {
    if (timer.pausedRemainingMs === null) return
    setTimer({ endsAt: Date.now() + timer.pausedRemainingMs, pausedRemainingMs: null })
  }, [timer.pausedRemainingMs, setTimer])

  const reset = useCallback(() => {
    setTimer({ phase: 'idle', endsAt: null, pausedRemainingMs: null })
    bus.emit({ type: 'pomodoro:phase', phase: 'idle' })
  }, [setTimer])

  const skip = useCallback(() => {
    start(timer.phase === 'focus' ? 'break' : 'focus')
  }, [timer.phase, start])

  const setTask = useCallback((t: string) => setTimer({ task: t }), [setTimer])

  return {
    phase: timer.phase,
    remainingMs,
    running,
    paused,
    task: timer.task,
    start,
    pause,
    resume,
    reset,
    skip,
    setTask,
  }
}
