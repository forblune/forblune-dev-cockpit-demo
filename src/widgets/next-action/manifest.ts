import type { WidgetManifest } from '../widget'
import { NextActionWidget } from './NextActionWidget'

export const nextActionManifest: WidgetManifest = {
  id: 'next-action',
  title: 'Next Action',
  area: 'next',
  component: NextActionWidget,
}
