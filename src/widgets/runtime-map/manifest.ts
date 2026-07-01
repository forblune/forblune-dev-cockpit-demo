import type { WidgetManifest } from '../widget'
import { RuntimeMapWidget } from './RuntimeMapWidget'

export const runtimeMapManifest: WidgetManifest = {
  id: 'runtime-map',
  title: 'Runtime Map',
  area: 'runtime',
  component: RuntimeMapWidget,
}
