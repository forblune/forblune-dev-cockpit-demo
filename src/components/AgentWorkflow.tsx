import type { DevSnapshot } from '../types'
import { useDevSnapshot } from '../widgets/dev-observer/useDevSnapshot'
import styles from './AgentWorkflow.module.css'
import { StatusDot } from './StatusDot'

/**
 * AI Dev Flow — a glanceable Idea→Spec→Build→Test→Deploy→Observe band.
 * States are derived from the EXISTING snapshot (read-only via useDevSnapshot):
 * a real signal where we have one (Build/Test/Deploy/Observe), else `pending`
 * (Idea/Spec have no source yet) — never faked. store/observer/types untouched.
 */

type StageState = 'done' | 'active' | 'pending' | 'blocked'

const STAGE_DEFS = [
  { key: 'idea', label: '아이디어' },
  { key: 'spec', label: '설계' },
  { key: 'build', label: '개발' },
  { key: 'test', label: '검증' },
  { key: 'deploy', label: '배포' },
  { key: 'observe', label: '관측' },
] as const

const STATE_COLOR: Record<StageState, string> = {
  done: 'var(--fresh-live)',
  active: 'var(--accent)',
  pending: 'var(--status-none)',
  blocked: 'var(--fresh-offline)',
}
const STATE_LABEL: Record<StageState, string> = {
  done: '완료',
  active: '진행중',
  pending: '대기',
  blocked: '막힘',
}
const STATE_CLASS: Record<StageState, string> = {
  done: styles.done,
  active: styles.active,
  pending: styles.pending,
  blocked: styles.blocked,
}

function deriveStages(
  snapshot: DevSnapshot | null,
  observing: boolean,
): Record<string, StageState> {
  const ci = snapshot?.infra.services.find((s) => s.id === 'github')?.status
  const deploy = snapshot?.infra.services.find((s) => s.id === 'render')?.status
  const building = snapshot?.workflows.some((w) => w.status === 'running') ?? false
  const test: StageState =
    ci === 'healthy'
      ? 'done'
      : ci === 'running'
        ? 'active'
        : ci === 'blocked'
          ? 'blocked'
          : 'pending'
  return {
    idea: 'pending',
    spec: 'pending',
    build: building ? 'active' : 'pending',
    test,
    deploy: deploy === 'healthy' ? 'done' : 'pending',
    observe: observing ? 'active' : 'pending',
  }
}

export function AgentWorkflow() {
  const { reading, isDemo } = useDevSnapshot()
  const states = deriveStages(reading.lastKnown, !isDemo && reading.status === 'live')

  return (
    <section className={styles.flow} aria-label="AI 개발 흐름">
      <span className={styles.eyebrow}>AI 개발 흐름</span>
      {isDemo && <span className={styles.demo}>demo</span>}
      <div className={styles.stages}>
        {STAGE_DEFS.map((stage, i) => {
          const st = states[stage.key]
          return (
            <div key={stage.key} className={styles.stageWrap}>
              <div className={`${styles.card} ${STATE_CLASS[st]}`}>
                <StatusDot color={STATE_COLOR[st]} pulse={st === 'active'} />
                <span className={styles.label}>{stage.label}</span>
                <span className={styles.state}>{STATE_LABEL[st]}</span>
              </div>
              {i < STAGE_DEFS.length - 1 && (
                <span
                  className={`${styles.arrow} ${st === 'done' ? styles.arrowDone : ''}`}
                  aria-hidden="true"
                >
                  →
                </span>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
