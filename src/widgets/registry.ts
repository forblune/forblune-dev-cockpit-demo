import { agentWorkflowsManifest } from './agent-workflows/manifest'
import { architectureMapManifest } from './architecture-map/manifest'
import { attentionRadarManifest } from './attention-radar/manifest'
import { currentMissionManifest } from './current-mission/manifest'
import { envChecklistManifest } from './env-checklist/manifest'
import { infraBoardManifest } from './infra-board/manifest'
import { nextActionManifest } from './next-action/manifest'
import { rpiManifest } from './rpi/manifest'
import { runtimeMapManifest } from './runtime-map/manifest'
import { usageManifest } from './usage/manifest'
import { voiceNotesManifest } from './voice-notes/manifest'
import type { WidgetId, WidgetManifest } from './widget'
import { workflowPipelineManifest } from './workflow-pipeline/manifest'

/**
 * The single place widgets are listed — the demo workspace seed.
 * Adding a widget = a manifest entry here plus a slot in CockpitGrid's CSS template.
 * (Deferred to later iterations: quick-launch.)
 */
export const WIDGETS: WidgetManifest[] = [
  architectureMapManifest,
  runtimeMapManifest,
  currentMissionManifest,
  attentionRadarManifest,
  envChecklistManifest,
  agentWorkflowsManifest,
  usageManifest,
  nextActionManifest,
  workflowPipelineManifest,
  infraBoardManifest,
  rpiManifest,
  voiceNotesManifest,
]

export interface WidgetPage {
  id: 'overview' | 'workflow' | 'infra' | 'agents'
  label: string
  widgetIds: WidgetId[]
}

/**
 * Phase 2-2a — pages map 1:1 to the TabBar content tabs (Settings is a drawer, not a
 * page). `runtime-map` and `voice-notes` are parked (no page) this step; the
 * AgentWorkflow band + Settings-tab drawer wiring land in Phase 2-2b.
 */
export const WIDGET_PAGES: WidgetPage[] = [
  {
    id: 'overview',
    label: 'Overview',
    widgetIds: ['current-mission', 'next-action', 'attention-radar'],
  },
  {
    id: 'workflow',
    label: 'Workflow',
    widgetIds: ['architecture-map', 'workflow-pipeline'],
  },
  {
    id: 'infra',
    label: 'Infra',
    widgetIds: ['infra-board', 'rpi', 'env-checklist'],
  },
  {
    id: 'agents',
    label: 'Agents',
    widgetIds: ['agent-workflows', 'usage'],
  },
]
