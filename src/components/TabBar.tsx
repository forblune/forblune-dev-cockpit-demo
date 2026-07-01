import styles from './TabBar.module.css'

/**
 * Phase 2-1 — section tab bar skeleton. Renders 5 fixed tabs and reflects the active
 * selection only; it does NOT yet re-place widgets (content wiring lands in Phase 2-2).
 * Active tab is owned by App as local state — no store/persist involvement.
 */

export type TabId = 'overview' | 'workflow' | 'infra' | 'agents' | 'settings'

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'workflow', label: 'Workflow' },
  { id: 'infra', label: 'Infra' },
  { id: 'agents', label: 'Agents' },
  { id: 'settings', label: 'Settings' },
]

export function TabBar({ active, onSelect }: { active: TabId; onSelect: (id: TabId) => void }) {
  return (
    <nav className={styles.tabbar} aria-label="섹션 탭">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`${styles.tab} ${active === tab.id ? styles.active : ''}`}
          aria-current={active === tab.id ? 'page' : undefined}
          onClick={() => onSelect(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
