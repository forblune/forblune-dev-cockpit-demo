import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { bus } from '../app/eventBus'
import { useCockpit } from '../app/store'
import { useBattery } from './useBattery'
import { useVisibility } from './useVisibility'
import { useWakeLock } from './useWakeLock'

const LOW_BATTERY = 0.2
const DIM_LOW_POWER = '0.7'
const DIM_FULL = '1'

/**
 * Headless component owning the always-on display lifecycle:
 * wake lock, refetch-on-return, connectivity broadcast, battery-aware dimming, theme.
 * (Background polling is paused for free by React Query's refetchIntervalInBackground=false.)
 */
export function SystemLifecycle() {
  const visibility = useVisibility()
  const battery = useBattery()
  const theme = useCockpit((s) => s.theme)
  const qc = useQueryClient()

  // keep the screen lit while the cockpit is foreground
  useWakeLock(visibility === 'visible')

  // refetch active queries when the tab comes back to the foreground
  useEffect(() => {
    if (visibility === 'visible') void qc.refetchQueries({ type: 'active' })
  }, [visibility, qc])

  // connectivity → bus
  useEffect(() => {
    const on = () => bus.emit({ type: 'connectivity', online: true })
    const off = () => bus.emit({ type: 'connectivity', online: false })
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  // battery-aware low-power dimming
  useEffect(() => {
    const lowPower = battery != null && !battery.charging && battery.level <= LOW_BATTERY
    document.documentElement.style.setProperty('--dim', lowPower ? DIM_LOW_POWER : DIM_FULL)
  }, [battery])

  // apply theme
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return null
}
