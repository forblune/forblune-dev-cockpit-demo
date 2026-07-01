import type { WidgetManifest } from '../widget'
import { RpiWidget } from './RpiWidget'

export const rpiManifest: WidgetManifest = {
  id: 'rpi',
  title: 'Edge Device',
  area: 'rpi',
  component: RpiWidget,
}
