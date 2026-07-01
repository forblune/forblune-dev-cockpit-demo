import { WidgetFrame } from '../../components/WidgetFrame'
import { relativeTime } from '../../lib/time'
import { useNow } from '../../lib/useNow'
import type { AgentWorkflow } from '../../types'
import { AGENT_LABEL, STATUS_COLOR, STATUS_LABEL, needsAttention } from '../dev-observer/status'
import { useDevSnapshot } from '../dev-observer/useDevSnapshot'
import styles from './AgentWorkflowsWidget.module.css'

export function AgentWorkflowsWidget() {
  const { reading, isDemo } = useDevSnapshot()
  const snapshot = reading.lastKnown
  const workflows = snapshot?.workflows ?? []
  const alert = workflows.some((workflow) => needsAttention(workflow.status))

  return (
    <WidgetFrame
      title="AI 에이전트 작업"
      caption="지금 누가 무엇을 하나"
      status={isDemo ? undefined : reading.status}
      updatedAt={reading.updatedAt}
      alert={!isDemo && alert}
      headerExtra={isDemo ? <span className={styles.demo}>Demo</span> : undefined}
    >
      {workflows.length === 0 ? (
        <div className={styles.empty}>실행 중인 Codex / Claude 작업이 없습니다</div>
      ) : (
        <div className={styles.list}>
          {workflows.map((workflow) => (
            <WorkflowRow key={workflow.id} workflow={workflow} />
          ))}
        </div>
      )}
    </WidgetFrame>
  )
}

/**
 * Compact row — status + agent + goal on one line, repo/branch/time muted below.
 * Verbose detail (currentStep, lastEvent, progress) is dropped from the glance;
 * currentStep stays as a hover title and a tap→detail sheet is a later step.
 */
function WorkflowRow({ workflow }: { workflow: AgentWorkflow }) {
  const now = useNow(15_000)
  return (
    <article className={styles.row}>
      <div className={styles.head}>
        <span className={styles.dot} style={{ background: STATUS_COLOR[workflow.status] }} />
        <span className={styles.agent}>{AGENT_LABEL[workflow.agent]}</span>
        <span className={styles.goal} title={workflow.currentStep || workflow.goal}>
          {workflow.goal}
        </span>
        <span className={styles.status}>{STATUS_LABEL[workflow.status]}</span>
      </div>
      <div className={styles.meta}>
        <span>{workflow.repo}</span>
        {workflow.branch && <span>{workflow.branch}</span>}
        <span>{relativeTime(workflow.updatedAt, now)}</span>
      </div>
    </article>
  )
}
