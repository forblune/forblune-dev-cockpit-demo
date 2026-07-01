import type { WidgetManifest } from '../widget'
import { ClockWidget } from './ClockWidget'

export const clockManifest: WidgetManifest = {
  id: 'clock',
  title: 'Clock',
  area: 'clock',
  component: ClockWidget,
}
