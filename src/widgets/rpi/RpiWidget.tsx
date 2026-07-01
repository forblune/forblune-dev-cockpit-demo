import { WidgetFrame } from '../../components/WidgetFrame'
import { STATUS_COLOR, STATUS_LABEL, needsAttention } from '../dev-observer/status'
import { useDevSnapshot } from '../dev-observer/useDevSnapshot'
import styles from './RpiWidget.module.css'

export function RpiWidget() {
  const { reading, isDemo } = useDevSnapshot()
  const rpi = reading.lastKnown?.rpi ?? null
  const alert = !isDemo && rpi != null && needsAttention(rpi.status)

  return (
    <WidgetFrame
      title="Edge Device · Demo Server"
      caption="서버 헬스·준비도·백업"
      status={isDemo ? undefined : reading.status}
      updatedAt={reading.updatedAt}
      alert={alert}
      headerExtra={isDemo ? <span className={styles.demo}>Demo</span> : undefined}
    >
      {rpi == null ? (
        <div className={styles.empty}>
          <strong>Edge Device 미연결</strong>
          <span>
            Demo data source에 <code>DEMO_EDGE_URL</code>을 설정하면 표시됩니다.
          </span>
        </div>
      ) : !rpi.reachable ? (
        <div className={styles.empty}>
          <strong>연결 안 됨</strong>
          <span>{rpi.detail ?? 'rpi API에 도달하지 못했습니다.'}</span>
        </div>
      ) : (
        <div className={styles.body}>
          <div className={styles.headline}>
            <div className={styles.readiness}>
              <span className={styles.num}>
                {rpi.readinessPercent != null ? `${Math.round(rpi.readinessPercent)}%` : '—'}
              </span>
              <span className={styles.numLabel}>준비도</span>
            </div>
            <span className={styles.health} style={{ color: STATUS_COLOR[rpi.status] }}>
              <span className={styles.dot} style={{ background: STATUS_COLOR[rpi.status] }} />
              {rpi.health ?? STATUS_LABEL[rpi.status]}
            </span>
          </div>

          <div className={styles.row}>
            <span className={styles.k}>Docker</span>
            <span className={styles.v}>{rpi.docker ?? '—'}</span>
          </div>

          <div className={styles.metrics}>
            <Gauge label="CPU" percent={rpi.cpuPercent} />
            <Gauge label="RAM" percent={rpi.ramPercent} />
            <Gauge label="Disk" percent={rpi.diskPercent} />
          </div>

          <div className={styles.rows}>
            <div className={styles.row}>
              <span className={styles.k}>백업</span>
              <span className={styles.v}>{rpi.lastBackup ?? '정보 없음'}</span>
            </div>
            {rpi.nextAction && (
              <div className={styles.row}>
                <span className={styles.k}>다음</span>
                <span className={styles.v}>{rpi.nextAction}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </WidgetFrame>
  )
}

function Gauge({ label, percent }: { label: string; percent: number | null }) {
  const color =
    percent == null
      ? 'var(--surface-3)'
      : percent >= 90
        ? 'var(--fresh-offline)'
        : percent >= 75
          ? 'var(--fresh-stale)'
          : 'var(--fresh-live)'
  return (
    <div className={styles.gauge}>
      <div className={styles.gaugeTop}>
        <span>{label}</span>
        <span>{percent == null ? '—' : `${Math.round(percent)}%`}</span>
      </div>
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{
            width: percent == null ? '0%' : `${Math.min(100, percent)}%`,
            background: color,
          }}
        />
      </div>
    </div>
  )
}
