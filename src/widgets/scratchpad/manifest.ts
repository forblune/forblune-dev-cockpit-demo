import type { WidgetManifest } from '../widget'
import { ScratchpadWidget } from './ScratchpadWidget'

export const scratchpadManifest: WidgetManifest = {
  id: 'scratchpad',
  title: 'Scratchpad',
  area: 'scratchpad',
  component: ScratchpadWidget,
}
