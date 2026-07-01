import { WidgetFrame } from '../../components/WidgetFrame'
import styles from './CalendarWidget.module.css'
import { useCalendarPeek } from './useCalendarPeek'

/**
 * MVP: renders the Phase-1 placeholder. The interface, grid slot, and data hook are
 * already wired — when Phase 1 implements the ICS fetch and an ICS URL is configured,
 * replace this body with the live next-event readout (data + reading.status badge).
 */
export function CalendarWidget() {
  const { configured } = useCalendarPeek()

  return (
    <WidgetFrame title="Calendar" placeholder>
      <div className={styles.wrap}>
        <div className={styles.icon}>📅</div>
        <div className={styles.headline}>다음 일정</div>
        <div className={styles.note}>
          {configured ? 'Phase 1에서 활성화됩니다' : 'Phase 1 · 공개 ICS 연동 예정'}
        </div>
      </div>
    </WidgetFrame>
  )
}
