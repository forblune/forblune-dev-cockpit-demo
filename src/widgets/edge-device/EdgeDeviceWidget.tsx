import { WidgetFrame } from '../../components/WidgetFrame'
import { STATUS_COLOR, STATUS_LABEL, needsAttention } from '../dev-observer/status'
import { useDevSnapshot } from '../dev-observer/useDevSnapshot'
import styles from './EdgeDeviceWidget.module.css'

export function EdgeDeviceWidget() {
  const { reading, isDemo } = useDevSnapshot()
  const edgeDevice = reading.lastKnown?.edgeDevice ?? null
  const alert = !isDemo && edgeDevice != null && needsAttention(edgeDevice.status)

  return (
    <WidgetFrame
      title="Edge Device · Demo Server"
      caption="서버 헬스·준비도·백업"
      status={isDemo ? undefined : reading.status}
      updatedAt={reading.updatedAt}
      alert={alert}
      headerExtra={isDemo ? <span className={styles.demo}>Demo</span> : undefined}
    >
      {edgeDevice == null ? (
        <div className={styles.empty}>
          <strong>Edge Device 미연결</strong>
          <span>
            Demo data source에 <code>DEMO_EDGE_URL</code>을 설정하면 표시됩니다.
          </span>
        </div>
      ) : !edgeDevice.reachable ? (
        <div className={styles.empty}>
          <strong>연결 안 됨</strong>
          <span>{edgeDevice.detail ?? 'Edge Device API에 도달하지 못했습니다.'}</span>
        </div>
      ) : (
        <div className={styles.body}>
          <div className={styles.headline}>
            <div className={styles.readiness}>
              <span className={styles.num}>
                {edgeDevice.readinessPercent != null
                  ? `${Math.round(edgeDevice.readinessPercent)}%`
                  : '—'}
              </span>
              <span className={styles.numLabel}>준비도</span>
            </div>
            <span className={styles.health} style={{ color: STATUS_COLOR[edgeDevice.status] }}>
              <span
                className={styles.dot}
                style={{ background: STATUS_COLOR[edgeDevice.status] }}
              />
              {edgeDevice.health ?? STATUS_LABEL[edgeDevice.status]}
            </span>
          </div>

          <div className={styles.row}>
            <span className={styles.k}>Docker</span>
            <span className={styles.v}>{edgeDevice.docker ?? '—'}</span>
          </div>

          <div className={styles.metrics}>
            <Gauge label="CPU" percent={edgeDevice.cpuPercent} />
            <Gauge label="RAM" percent={edgeDevice.ramPercent} />
            <Gauge label="Disk" percent={edgeDevice.diskPercent} />
          </div>

          <div className={styles.rows}>
            <div className={styles.row}>
              <span className={styles.k}>백업</span>
              <span className={styles.v}>{edgeDevice.lastBackup ?? '정보 없음'}</span>
            </div>
            {edgeDevice.nextAction && (
              <div className={styles.row}>
                <span className={styles.k}>다음</span>
                <span className={styles.v}>{edgeDevice.nextAction}</span>
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
