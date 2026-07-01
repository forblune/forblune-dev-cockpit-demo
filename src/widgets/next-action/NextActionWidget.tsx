import { WidgetFrame } from '../../components/WidgetFrame'
import type { NextAction } from '../../types'
import { PRIORITY_LABEL } from '../dev-observer/status'
import { useDevSnapshot } from '../dev-observer/useDevSnapshot'
import styles from './NextActionWidget.module.css'

export function NextActionWidget() {
  const { reading, isDemo } = useDevSnapshot()
  const snapshot = reading.lastKnown
  const actions = snapshot?.nextActions ?? []
  const primary = actions[0] ?? null
  const extraCount = Math.max(actions.length - 1, 0)
  const alert = primary?.priority === 'now'

  return (
    <WidgetFrame
      title="다음 할 일"
      status={isDemo ? undefined : reading.status}
      updatedAt={reading.updatedAt}
      alert={!isDemo && alert}
    >
      {primary ? (
        <ActionSummary action={primary} extraCount={extraCount} />
      ) : (
        <div className={styles.empty}>지금 즉시 개입할 항목이 없습니다</div>
      )}
    </WidgetFrame>
  )
}

/** Overview shows one decisive action; full reason stays as hover context for now. */
function ActionSummary({ action, extraCount }: { action: NextAction; extraCount: number }) {
  return (
    <article className={`${styles.summary} ${styles[action.priority]}`}>
      <div className={styles.topLine}>
        <span className={styles.priority}>{PRIORITY_LABEL[action.priority]}</span>
        {extraCount > 0 && <span className={styles.more}>+{extraCount} more</span>}
      </div>
      <strong className={styles.title} title={action.reason}>
        {action.title}
      </strong>
      <span className={styles.target} title={action.target}>
        {action.target}
      </span>
    </article>
  )
}
