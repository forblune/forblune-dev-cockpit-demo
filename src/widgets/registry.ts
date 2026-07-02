import { agentWorkflowsManifest } from './agent-workflows/manifest'
import { architectureMapManifest } from './architecture-map/manifest'
import { attentionRadarManifest } from './attention-radar/manifest'
import { currentMissionManifest } from './current-mission/manifest'
import { edgeDeviceManifest } from './edge-device/manifest'
import { envChecklistManifest } from './env-checklist/manifest'
import { infraBoardManifest } from './infra-board/manifest'
import { nextActionManifest } from './next-action/manifest'
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
  edgeDeviceManifest,
  voiceNotesManifest,
]

export interface WidgetPage {
  id: 'overview' | 'workflow' | 'infra' | 'agents'
  label: string
  /** One-line framing shown at the top of the page — what this tab answers. */
  blurb: string
  widgetIds: WidgetId[]
}

/**
 * Pages map 1:1 to the TabBar content tabs (Settings is a drawer, not a page).
 * `runtime-map` and `voice-notes` are parked (no page) for now.
 */
export const WIDGET_PAGES: WidgetPage[] = [
  {
    id: 'overview',
    label: 'Overview',
    blurb: '지금 미션 · 다음 행동 · 확인할 곳 — 오늘 뭘 해야 할지 한눈에 보여줘요.',
    widgetIds: ['current-mission', 'next-action', 'attention-radar'],
  },
  {
    id: 'workflow',
    label: 'Workflow',
    blurb: '아이디어 → 설계 → 구현 → 테스트 → 배포 → 관찰. 지금 어디까지 왔는지 보여줘요.',
    widgetIds: ['architecture-map', 'workflow-pipeline'],
  },
  {
    id: 'infra',
    label: 'Infra',
    blurb: '내 서비스와 배포 파이프라인이 지금 건강한지 확인해요.',
    widgetIds: ['infra-board', 'edge-device', 'env-checklist'],
  },
  {
    id: 'agents',
    label: 'Agents',
    blurb: '지금 어떤 AI 에이전트가 무엇을 하고 있는지 보여줘요.',
    widgetIds: ['agent-workflows', 'usage'],
  },
]
