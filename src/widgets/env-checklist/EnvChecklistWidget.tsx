import { WidgetFrame } from '../../components/WidgetFrame'
import type { EnvCheck } from '../../types'
import { STATUS_COLOR, STATUS_LABEL } from '../dev-observer/status'
import { useDevSnapshot } from '../dev-observer/useDevSnapshot'
import styles from './EnvChecklistWidget.module.css'

export function EnvChecklistWidget() {
  const { reading, isDemo } = useDevSnapshot()
  const checks = reading.lastKnown?.env?.checks ?? []
  const missingRequired = checks.some((check) => check.required && check.source === 'missing')

  return (
    <WidgetFrame
      title="환경 설정"
      caption="필요한 키가 있는지 점검"
      status={isDemo ? undefined : reading.status}
      updatedAt={reading.updatedAt}
      alert={!isDemo && missingRequired}
      headerExtra={isDemo ? <span className={styles.demo}>Demo</span> : undefined}
    >
      {checks.length === 0 ? (
        <div className={styles.empty}>감지된 env 요구사항이 없습니다</div>
      ) : (
        <div className={styles.list}>
          {checks.map((check) => (
            <EnvRow key={`${check.scope}-${check.key}`} check={check} />
          ))}
        </div>
      )}
    </WidgetFrame>
  )
}

function EnvRow({ check }: { check: EnvCheck }) {
  return (
    <article className={styles.row}>
      <span className={styles.dot} style={{ background: STATUS_COLOR[check.status] }} />
      <div className={styles.copy}>
        <div className={styles.top}>
          <strong>{check.label}</strong>
          <span>{check.required ? '필수' : '선택'}</span>
        </div>
        <code>{check.key}</code>
        <p>{check.detail}</p>
      </div>
      <div className={styles.meta}>
        <span>{STATUS_LABEL[check.status]}</span>
        <small>
          {check.source === 'file'
            ? '파일'
            : check.source === 'process'
              ? '프로세스'
              : check.source === 'missing'
                ? '없음'
                : '미확인'}
        </small>
      </div>
    </article>
  )
}
