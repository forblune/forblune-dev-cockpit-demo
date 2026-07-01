import { WidgetFrame } from '../../components/WidgetFrame'
import type { DevSnapshot, SystemStatus } from '../../types'
import { PRIORITY_LABEL, STATUS_COLOR, STATUS_LABEL, needsAttention } from '../dev-observer/status'
import { useDevSnapshot } from '../dev-observer/useDevSnapshot'
import styles from './AttentionRadarWidget.module.css'

interface RadarItem {
  id: string
  title: string
  detail: string
  status: SystemStatus
  group: string
}

export function AttentionRadarWidget() {
  const { reading, isDemo } = useDevSnapshot()
  const snapshot = reading.lastKnown
  const items = snapshot ? buildRadarItems(snapshot) : []
  const primary = items[0] ?? null
  const extraCount = Math.max(items.length - 1, 0)
  const urgent = items.some((item) => needsAttention(item.status))

  return (
    <WidgetFrame
      title="확인할 곳"
      status={isDemo ? undefined : reading.status}
      updatedAt={reading.updatedAt}
      alert={!isDemo && urgent}
    >
      {primary ? (
        <article className={styles.summary}>
          <div className={styles.count}>
            <strong>{items.length}</strong>
            <span>확인 필요</span>
          </div>
          <div className={styles.item}>
            <span className={styles.dot} style={{ background: STATUS_COLOR[primary.status] }} />
            <div className={styles.copy}>
              <div className={styles.top}>
                <strong title={primary.detail}>{primary.title}</strong>
                <span>{primary.group}</span>
              </div>
              <div className={styles.meta}>
                <span>{STATUS_LABEL[primary.status]}</span>
                {extraCount > 0 && <span>+{extraCount} more</span>}
              </div>
            </div>
          </div>
        </article>
      ) : (
        <div className={styles.clear}>
          <strong>막힌 항목 없음</strong>
          <span>지금은 관찰만 하면 됩니다.</span>
        </div>
      )}
    </WidgetFrame>
  )
}

function buildRadarItems(snapshot: DevSnapshot): RadarItem[] {
  const items: RadarItem[] = []

  for (const check of snapshot.env?.checks ?? []) {
    if (check.required && check.source === 'missing') {
      items.push({
        id: `env-${check.key}`,
        title: check.label,
        detail: `${check.key} 값이 없습니다.`,
        status: 'attention',
        group: '환경',
      })
    }
  }

  for (const node of snapshot.runtime.nodes) {
    if (node.status === 'attention' || node.status === 'blocked') {
      items.push({
        id: `node-${node.id}`,
        title: node.label,
        detail: node.detail,
        status: node.status,
        group: node.kind,
      })
    }
  }

  for (const action of snapshot.nextActions) {
    if (action.priority === 'now') {
      items.push({
        id: `action-${action.id}`,
        title: action.title,
        detail: action.reason,
        status: 'attention',
        group: PRIORITY_LABEL[action.priority],
      })
    }
  }

  for (const meter of snapshot.usage) {
    if (meter.usedPercent !== null && meter.usedPercent >= 85) {
      items.push({
        id: `usage-${meter.id}`,
        title: `${meter.label} 사용량 높음`,
        detail: `${Math.round(meter.usedPercent)}% 사용 중`,
        status: meter.usedPercent >= 95 ? 'blocked' : 'attention',
        group: '사용량',
      })
    }
  }

  return items
}
