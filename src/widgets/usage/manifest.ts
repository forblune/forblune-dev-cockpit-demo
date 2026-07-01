import type { WidgetManifest } from '../widget'
import { UsageWidget } from './UsageWidget'

export const usageManifest: WidgetManifest = {
  id: 'usage',
  title: 'Usage',
  area: 'usage',
  component: UsageWidget,
}
