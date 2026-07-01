import { type ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'
import styles from './Sheet.module.css'

interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  /** which edge the panel slides in from (default: right) */
  side?: 'right' | 'bottom'
  children: ReactNode
}

/** A slide-over panel (right edge by default, or bottom). The deliberate surface for text entry. */
export function Sheet({ open, onClose, title, side = 'right', children }: SheetProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const overlayCls =
    side === 'bottom' ? `${styles.overlay} ${styles.overlayBottom}` : styles.overlay
  const panelCls = side === 'bottom' ? `${styles.panel} ${styles.panelBottom}` : styles.panel

  return createPortal(
    <div
      className={overlayCls}
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
      role="presentation"
    >
      <div
        className={panelCls}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </header>
        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    document.body,
  )
}
