import { useEffect, useState } from 'react'
import { WidgetFrame } from '../../components/WidgetFrame'
import styles from './ClockWidget.module.css'

const DATE_FMT = new Intl.DateTimeFormat('ko-KR', {
  month: 'long',
  day: 'numeric',
  weekday: 'long',
})

export function ClockWidget() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')

  return (
    <WidgetFrame title="Clock">
      <div className={styles.wrap}>
        <div className={styles.time}>
          <span>
            {hh}:{mm}
          </span>
          <span className={styles.sec}>{ss}</span>
        </div>
        <div className={styles.date}>{DATE_FMT.format(now)}</div>
      </div>
    </WidgetFrame>
  )
}
