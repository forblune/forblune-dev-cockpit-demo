import { useEffect, useState } from 'react'

export interface BatteryInfo {
  level: number // 0..1
  charging: boolean
}

// navigator.getBattery is non-standard and unavailable on iOS Safari; type it minimally.
interface BatteryManagerLike extends EventTarget {
  level: number
  charging: boolean
}
interface NavigatorBattery {
  getBattery?: () => Promise<BatteryManagerLike>
}

/** Battery level/charging, or null when the platform doesn't expose it (e.g. iPadOS Safari). */
export function useBattery(): BatteryInfo | null {
  const [info, setInfo] = useState<BatteryInfo | null>(null)

  useEffect(() => {
    const nav = navigator as Navigator & NavigatorBattery
    if (!nav.getBattery) return

    let battery: BatteryManagerLike | null = null
    let cancelled = false

    const update = () => {
      if (battery && !cancelled) {
        setInfo({ level: battery.level, charging: battery.charging })
      }
    }

    void nav.getBattery().then((b) => {
      if (cancelled) return
      battery = b
      update()
      b.addEventListener('levelchange', update)
      b.addEventListener('chargingchange', update)
    })

    return () => {
      cancelled = true
      battery?.removeEventListener('levelchange', update)
      battery?.removeEventListener('chargingchange', update)
    }
  }, [])

  return info
}
