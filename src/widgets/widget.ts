import type { ComponentType } from 'react'

/**
 * The one extensibility seam — the seed of demo workspace.
 * A widget is a glanceable readout; the cockpit knows nothing about it beyond this contract.
 * Adding a widget = a manifest entry in registry.ts, never a refactor.
 */

/** Live-data freshness — the single honesty mechanic for an always-on display. */
export type ReadingStatus = 'live' | 'stale' | 'offline'

/**
 * The uniform shape every data-backed widget hook resolves to.
 * `lastKnown` NEVER blanks once data has been seen, so a frozen tile can't read as fresh.
 */
export interface InstrumentReading<T> {
  status: ReadingStatus
  /** current best value (mirrors lastKnown) */
  data: T | null
  /** last successful value; survives errors / offline */
  lastKnown: T | null
  /** epoch ms of last success; null before the first success */
  updatedAt: number | null
  error?: string
}

export type WidgetId =
  | 'github-pulse'
  | 'focus'
  | 'clock'
  | 'calendar'
  | 'scratchpad'
  | 'runtime-map'
  | 'agent-workflows'
  | 'usage'
  | 'next-action'
  | 'workflow-pipeline'
  | 'infra-board'
  | 'voice-notes'
  | 'current-mission'
  | 'attention-radar'
  | 'env-checklist'
  | 'rpi'
  | 'architecture-map'

/** Named grid slots; the concrete layout lives in CockpitGrid's CSS template. */
export type GridArea =
  | 'pulse'
  | 'focus'
  | 'clock'
  | 'calendar'
  | 'scratchpad'
  | 'runtime'
  | 'workflows'
  | 'usage'
  | 'next'
  | 'pipeline'
  | 'infra'
  | 'voice'
  | 'mission'
  | 'attention'
  | 'env'
  | 'rpi'
  | 'architecture'

export const DEFAULT_WIDGET_IDS: WidgetId[] = [
  'architecture-map',
  'runtime-map',
  'workflow-pipeline',
  'infra-board',
  'rpi',
  'current-mission',
  'attention-radar',
  'env-checklist',
  'agent-workflows',
  'usage',
  'next-action',
]

export interface WidgetManifest {
  id: WidgetId
  title: string
  area: GridArea
  component: ComponentType
  /** A not-yet-active widget, rendered with a muted "coming in Phase N" affordance. */
  placeholder?: boolean
}
