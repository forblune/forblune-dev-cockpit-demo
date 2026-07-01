import type { WidgetManifest } from '../widget'
import { AttentionRadarWidget } from './AttentionRadarWidget'

export const attentionRadarManifest: WidgetManifest = {
  id: 'attention-radar',
  title: 'Attention Radar',
  area: 'attention',
  component: AttentionRadarWidget,
}
