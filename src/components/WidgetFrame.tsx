import type { ReactNode } from 'react'
import { relativeTime } from '../lib/time'
import { useNow } from '../lib/useNow'
import type { ReadingStatus } from '../widgets/widget'
import { StatusDot } from './StatusDot'
import styles from './WidgetFrame.module.css'

const STATUS_COLOR: Record<ReadingStatus, string> = {
  live: 'var(--fresh-live)',
  stale: 'var(--fresh-stale)',
  offline: 'var(--fresh-offline)',
}
const STATUS_LABEL: Record<ReadingStatus, string> = {
  live: '실시간',
  stale: '지연됨',
  offline: '오프라인',
}

interface WidgetFrameProps {
  title: string
  /** one-line role hint under the title — what this widget is for (beginner-friendly) */
  caption?: string
  /** omit for static widgets (e.g. clock) → no freshness badge */
  status?: ReadingStatus
  updatedAt?: number | null
  placeholder?: boolean
  /** attention state — a red pulsing border for "something needs you" (e.g. CI failing) */
  alert?: boolean
  headerExtra?: ReactNode
  children: ReactNode
}

/**
 * The ONLY place freshness is rendered, so "honest data states" are structural,
 * not per-widget. Title + relative last-updated + live/stale/offline badge + staleness fade.
 * `alert` is the generic "needs attention" affordance; the widget decides when to raise it.
 */
export function WidgetFrame({
  title,
  caption,
  status,
  updatedAt,
  placeholder,
  alert,
  headerExtra,
  children,
}: WidgetFrameProps) {
  const now = useNow(15_000)
  const degraded = status === 'stale' || status === 'offline'
  const cls = [
    styles.frame,
    placeholder && styles.placeholder,
    degraded && styles.degraded,
    alert && styles.alert,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section className={cls}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <h2 className={styles.title}>{title}</h2>
          {caption && <p className={styles.caption}>{caption}</p>}
        </div>
        <div className={styles.meta}>
          {headerExtra}
          {placeholder && <span className={styles.chip}>Phase 1</span>}
          {status && !placeholder && (
            <span className={styles.status}>
              <StatusDot color={STATUS_COLOR[status]} pulse={status === 'live'} />
              <span className={styles.statusText}>
                {updatedAt
                  ? relativeTime(updatedAt, now)
                  : status === 'live'
                    ? '연결 중'
                    : STATUS_LABEL[status]}
              </span>
            </span>
          )}
        </div>
      </header>
      <div className={styles.body}>{children}</div>
    </section>
  )
}
