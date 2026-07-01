import { WidgetFrame } from '../../components/WidgetFrame'
import { useNow } from '../../lib/useNow'
import type { UsageMeter } from '../../types'
import { STATUS_COLOR, STATUS_LABEL, needsAttention } from '../dev-observer/status'
import { useDevSnapshot } from '../dev-observer/useDevSnapshot'
import styles from './UsageWidget.module.css'

export function UsageWidget() {
  const { reading, isDemo } = useDevSnapshot()
  const snapshot = reading.lastKnown
  const usage = snapshot?.usage ?? []
  const alert = usage.some((meter) => {
    const highUsage = meter.usedPercent !== null && meter.usedPercent >= 85
    return highUsage || needsAttention(meter.status)
  })

  return (
    <WidgetFrame
      title="사용량"
      caption="AI 도구 한도와 리셋 시각"
      status={isDemo ? undefined : reading.status}
      updatedAt={reading.updatedAt}
      alert={!isDemo && alert}
      headerExtra={isDemo ? <span className={styles.demo}>Demo</span> : undefined}
    >
      <div className={styles.list}>
        {usage.map((meter) => (
          <UsageRow key={meter.id} meter={meter} />
        ))}
      </div>
    </WidgetFrame>
  )
}

function UsageRow({ meter }: { meter: UsageMeter }) {
  const now = useNow(30_000)
  const value = meter.usedPercent
  const reset = formatReset(meter.resetsAt, now)

  return (
    <section className={styles.row}>
      <div className={styles.top}>
        <div>
          <div className={styles.label}>{meter.label}</div>
          <div className={styles.limit}>{meter.limitLabel}</div>
        </div>
        <div className={styles.readout}>
          {value === null ? '없음' : `${Math.round(value)}%`}
          <span>{STATUS_LABEL[meter.status]}</span>
        </div>
      </div>
      <div className={styles.meter} aria-label={`${meter.label} 사용량`}>
        <div
          className={styles.fill}
          style={{
            width: value === null ? '100%' : `${value}%`,
            background: value === null ? 'var(--surface-3)' : STATUS_COLOR[meter.status],
          }}
        />
      </div>
      <div className={styles.bottom}>
        <span>{reset}</span>
        <span>{sourceLabel(meter.source)}</span>
      </div>
      {meter.note && <div className={styles.note}>{meter.note}</div>}
    </section>
  )
}

function formatReset(resetsAt: number | null, now: number): string {
  if (!resetsAt) return '리셋 정보 없음'
  const diff = resetsAt - now
  if (diff <= 0) return '리셋 도래'
  const hours = Math.floor(diff / 3_600_000)
  const minutes = Math.max(0, Math.round((diff % 3_600_000) / 60_000))
  if (hours <= 0) return `${minutes}분 후 리셋`
  return `${hours}시간 ${minutes}분 후 리셋`
}

function sourceLabel(source: UsageMeter['source']): string {
  if (source === 'observer') return '관측기'
  if (source === 'manual') return '수동'
  if (source === 'demo') return '데모'
  return '소스 없음'
}
