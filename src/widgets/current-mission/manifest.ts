import type { WidgetManifest } from '../widget'
import { CurrentMissionWidget } from './CurrentMissionWidget'

export const currentMissionManifest: WidgetManifest = {
  id: 'current-mission',
  title: 'Current Mission',
  area: 'mission',
  component: CurrentMissionWidget,
}
