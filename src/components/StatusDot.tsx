import styles from './StatusDot.module.css'

interface StatusDotProps {
  color: string
  pulse?: boolean
  size?: number
}

/** A small color-coded dot. Color/meaning is decided by the caller. */
export function StatusDot({ color, pulse = false, size = 10 }: StatusDotProps) {
  return (
    <span
      className={pulse ? `${styles.dot} ${styles.pulse}` : styles.dot}
      style={{ background: color, width: size, height: size }}
    />
  )
}
