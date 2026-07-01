import type { WidgetManifest } from '../widget'
import { InfraBoardWidget } from './InfraBoardWidget'

export const infraBoardManifest: WidgetManifest = {
  id: 'infra-board',
  title: 'Infra Board',
  area: 'infra',
  component: InfraBoardWidget,
}
