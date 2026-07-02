import { useBattery } from '../system/useBattery'
import { useOnline } from '../system/useOnline'
import { useDevSnapshot } from '../widgets/dev-observer/useDevSnapshot'
import styles from './StatusBar.module.css'
import { StatusDot } from './StatusDot'

interface Props {
  onOpenSettings: () => void
}

/** Thin always-visible strip: connectivity, battery (if exposed), and the settings entry. */
export function StatusBar({ onOpenSettings }: Props) {
  const online = useOnline()
  const battery = useBattery()
  const { reading, isDemo } = useDevSnapshot()
  const observerColor = isDemo
    ? 'var(--status-none)'
    : reading.status === 'live'
      ? 'var(--fresh-live)'
      : reading.status === 'stale'
        ? 'var(--fresh-stale)'
        : 'var(--fresh-offline)'

  return (
    <footer className={styles.bar}>
      <div className={styles.brand}>
        forblune <span className={styles.accent}>dev cockpit</span>
      </div>
      <div className={styles.spacer} />
      <div className={styles.item}>
        <StatusDot color={observerColor} pulse={!isDemo && reading.status === 'live'} />
        <span>
          {isDemo
            ? '관측기 데모'
            : reading.status === 'live'
              ? '관측기 연결됨'
              : reading.status === 'stale'
                ? '관측기 지연'
                : '관측기 끊김'}
        </span>
      </div>
      <div className={styles.item}>
        <StatusDot color={online ? 'var(--fresh-live)' : 'var(--fresh-offline)'} pulse={online} />
        <span>{online ? '온라인' : '오프라인'}</span>
      </div>
      {battery && (
        <div className={styles.item}>
          <span>{battery.charging ? '⚡' : '🔋'}</span>
          <span>{Math.round(battery.level * 100)}%</span>
        </div>
      )}
      <button type="button" className={styles.gear} onClick={onOpenSettings} aria-label="설정 열기">
        ⚙
      </button>
    </footer>
  )
}
