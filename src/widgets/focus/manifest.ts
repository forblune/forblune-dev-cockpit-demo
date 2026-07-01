import type { WidgetManifest } from '../widget'
import { FocusWidget } from './FocusWidget'

export const focusManifest: WidgetManifest = {
  id: 'focus',
  title: 'Focus',
  area: 'focus',
  component: FocusWidget,
}
