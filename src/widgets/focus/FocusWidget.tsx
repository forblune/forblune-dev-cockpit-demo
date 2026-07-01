import { WidgetFrame } from '../../components/WidgetFrame'
import { formatDuration } from '../../lib/time'
import type { PomodoroPhase } from '../../types'
import styles from './FocusWidget.module.css'
import { usePomodoro } from './usePomodoro'

const PHASE_LABEL: Record<PomodoroPhase, string> = {
  idle: '대기',
  focus: '집중',
  break: '휴식',
}
const PHASE_COLOR: Record<PomodoroPhase, string> = {
  idle: 'var(--text-3)',
  focus: 'var(--accent)',
  break: 'var(--status-passing)',
}

export function FocusWidget() {
  const p = usePomodoro()

  return (
    <WidgetFrame
      title="Focus"
      headerExtra={
        <span className={styles.phase} style={{ color: PHASE_COLOR[p.phase] }}>
          {PHASE_LABEL[p.phase]}
        </span>
      }
    >
      <div className={styles.wrap}>
        <input
          className={styles.task}
          value={p.task}
          onChange={(e) => p.setTask(e.target.value)}
          placeholder="무엇에 집중하나요?"
          spellCheck={false}
        />
        <div
          className={styles.timer}
          style={{ color: p.phase === 'break' ? 'var(--status-passing)' : 'var(--text-1)' }}
        >
          {formatDuration(p.remainingMs)}
        </div>
        <div className={styles.controls}>
          {!p.running ? (
            p.paused ? (
              <button type="button" className={styles.primary} onClick={p.resume}>
                재개
              </button>
            ) : (
              <button
                type="button"
                className={styles.primary}
                onClick={() => p.start(p.phase === 'break' ? 'break' : 'focus')}
              >
                {p.phase === 'break' ? '휴식 시작' : '집중 시작'}
              </button>
            )
          ) : (
            <button type="button" className={styles.primary} onClick={p.pause}>
              일시정지
            </button>
          )}
          <button type="button" className={styles.ghost} onClick={p.skip}>
            {p.phase === 'focus' ? '휴식으로' : '집중으로'}
          </button>
          <button type="button" className={styles.ghost} onClick={p.reset}>
            리셋
          </button>
        </div>
      </div>
    </WidgetFrame>
  )
}
