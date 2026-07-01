import { WidgetFrame } from '../../components/WidgetFrame'
import { AGENT_LABEL, STATUS_COLOR, STATUS_LABEL } from '../dev-observer/status'
import { useDevSnapshot } from '../dev-observer/useDevSnapshot'
import styles from './CurrentMissionWidget.module.css'

export function CurrentMissionWidget() {
  const { reading, isDemo } = useDevSnapshot()
  const snapshot = reading.lastKnown
  const workflow = snapshot?.workflows[0] ?? null
  const repoContext = workflow
    ? [workflow.repo, workflow.branch].filter(Boolean).join(' · ')
    : 'active repo 없음'

  return (
    <WidgetFrame
      title="지금 미션"
      status={isDemo ? undefined : reading.status}
      updatedAt={reading.updatedAt}
    >
      <div className={styles.wrap}>
        <section className={styles.hero}>
          <div className={styles.kicker}>
            <span
              className={styles.statusDot}
              style={{
                background: workflow ? STATUS_COLOR[workflow.status] : 'var(--status-none)',
              }}
            />
            {workflow ? AGENT_LABEL[workflow.agent] : '활성 에이전트 없음'}
          </div>
          <h3 title={workflow?.goal}>{workflow?.goal ?? '다음 개발 목표를 정할 차례'}</h3>
          <div className={styles.statusLine}>
            <strong>{workflow ? STATUS_LABEL[workflow.status] : '대기'}</strong>
            <span title={repoContext}>{repoContext}</span>
          </div>
        </section>
      </div>
    </WidgetFrame>
  )
}
