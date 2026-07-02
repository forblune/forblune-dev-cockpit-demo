import type { WidgetManifest } from '../widget'
import { EdgeDeviceWidget } from './EdgeDeviceWidget'

export const edgeDeviceManifest: WidgetManifest = {
  id: 'edge-device',
  title: 'Edge Device',
  area: 'edge-device',
  component: EdgeDeviceWidget,
}
