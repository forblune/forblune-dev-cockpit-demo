import type { WidgetManifest } from '../widget'
import { EnvChecklistWidget } from './EnvChecklistWidget'

export const envChecklistManifest: WidgetManifest = {
  id: 'env-checklist',
  title: 'Env Checklist',
  area: 'env',
  component: EnvChecklistWidget,
}
