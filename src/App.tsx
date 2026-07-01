import { useState } from 'react'
import styles from './App.module.css'
import { CockpitGrid } from './components/CockpitGrid'
import { SettingsSheet } from './components/SettingsSheet'
import { StatusBar } from './components/StatusBar'
import { StatusSpine } from './components/StatusSpine'
import { TabBar, type TabId } from './components/TabBar'
import { SystemLifecycle } from './system/SystemLifecycle'

// Phase 1 — top status bar simplified to 4 signals (StatusSpine).
// Phase 2-2b — activeTab and settings drawer are local UI state only (no store/persist).
export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [settingsOpen, setSettingsOpen] = useState(false)

  const openSettings = () => setSettingsOpen(true)
  const closeSettings = () => setSettingsOpen(false)

  const selectTab = (id: TabId) => {
    if (id === 'settings') {
      openSettings()
      return
    }
    setActiveTab(id)
  }

  return (
    <div className={styles.cockpit}>
      <SystemLifecycle />
      <StatusSpine />
      <TabBar active={activeTab} onSelect={selectTab} />
      <CockpitGrid activeTab={activeTab} />
      <StatusBar onOpenSettings={openSettings} />
      <SettingsSheet open={settingsOpen} onClose={closeSettings} />
    </div>
  )
}
