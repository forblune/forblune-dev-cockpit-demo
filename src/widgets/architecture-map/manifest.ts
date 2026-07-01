import type { WidgetManifest } from '../widget'
import { ArchitectureMapWidget } from './ArchitectureMapWidget'

export const architectureMapManifest: WidgetManifest = {
  id: 'architecture-map',
  title: 'System Map',
  area: 'architecture',
  component: ArchitectureMapWidget,
}
