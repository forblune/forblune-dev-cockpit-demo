import type { DevSnapshot, NextAction, SystemStatus } from '../types'
import { useDevSnapshot } from '../widgets/dev-observer/useDevSnapshot'
import { StatusDot } from './StatusDot'
import styles from './StatusSpine.module.css'

/**
 * Top status bar — the dashboard's anchor. Phase 1 IA: only 4 glanceable signals
 * (현재 상태 · 확인 필요 개수 · 서버 상태 · 다음 행동) so the current state reads in
 * ~3s on an always-on iPad. Mission / pipeline / current-step move to their tabs
 * in a later phase. Display-only, derived from the EXISTING snapshot — no new data
 * path, no store/widget-contract change.
 */

const PRIO: Record<NextAction['priority'], { label: string; cls: string }> = {
  now: { label: 'Now', cls: styles.pNow },
  soon: { label: 'Soon', cls: styles.pSoon },
  later: { label: 'Later', cls: styles.pLater },
}

function isAttention(s: SystemStatus): boolean {
  return s === 'attention' || s === 'blocked'
}

/** Everything that needs a human (nodes + services + required env), deduped. */
function deriveAttention(data: DevSnapshot): string[] {
  const labels = [
    ...data.runtime.nodes.filter((n) => isAttention(n.status)).map((n) => n.label),
    ...data.infra.services.filter((s) => isAttention(s.status)).map((s) => s.label),
    ...data.env.checks.filter((c) => c.required && c.status !== 'healthy').map((c) => c.label),
  ]
  return [...new Set(labels)]
}

export function StatusSpine() {
  const { reading, isDemo } = useDevSnapshot()
  const data = reading.data
  if (!data) return <div className={styles.spine} aria-label="상태 요약" />

  const attention = deriveAttention(data)
  const attentionCount = attention.length
  const healthy = attentionCount === 0
  const observing = !isDemo && reading.status === 'live'

  const serverIssues = data.infra.services.filter((s) => isAttention(s.status)).length
  const serverOk = serverIssues === 0

  const next = data.nextActions[0]

  return (
    <header className={styles.spine} aria-label="상태 요약">
      {/* 1 · 현재 상태 */}
      <span className={`${styles.chip} ${healthy ? '' : styles.warn}`}>
        <StatusDot
          color={healthy ? 'var(--fresh-live)' : 'var(--fresh-offline)'}
          pulse={healthy && observing}
        />
        <span className={styles.strong}>{healthy ? '정상' : '주의'}</span>
      </span>

      {/* 2 · 확인 필요 개수 */}
      <span
        className={`${styles.chip} ${attentionCount > 0 ? styles.warn : ''}`}
        title={attention.join(', ')}
      >
        <span className={styles.label}>확인 필요</span>
        <span className={attentionCount > 0 ? styles.strong : styles.muted}>{attentionCount}</span>
      </span>

      {/* 3 · 서버 상태 */}
      <span className={`${styles.chip} ${serverOk ? '' : styles.warn}`}>
        <StatusDot color={serverOk ? 'var(--fresh-live)' : 'var(--fresh-stale)'} />
        <span className={styles.label}>서버</span>
        <span className={styles.strong}>{serverOk ? '정상' : `주의 ${serverIssues}`}</span>
      </span>

      {/* 4 · 다음 행동 */}
      {next ? (
        <span className={styles.chip}>
          <span className={`${styles.prio} ${PRIO[next.priority].cls}`}>
            {PRIO[next.priority].label}
          </span>
          <span className={styles.value} title={next.title}>
            {next.title}
          </span>
        </span>
      ) : (
        <span className={styles.chip}>
          <span className={styles.label}>다음 행동</span>
          <span className={styles.muted}>없음</span>
        </span>
      )}

      {isDemo && <span className={styles.demo}>demo</span>}
    </header>
  )
}
