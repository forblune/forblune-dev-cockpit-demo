/** Cross-cutting types shared by the store, lib, and widgets. */

export interface RepoRef {
  owner: string
  name: string
}

/** "owner/name" — the canonical string form used in query keys and GraphQL filters. */
export function repoSlug(r: RepoRef): string {
  return `${r.owner}/${r.name}`
}

export function parseRepoSlug(slug: string): RepoRef | null {
  const [owner, name, ...rest] = slug.trim().split('/')
  if (!owner || !name || rest.length > 0) return null
  return { owner, name }
}

export interface QuickLink {
  id: string
  emoji: string
  label: string
  url: string
}

export type ThemeName = 'dark' | 'contrast'

export type PomodoroPhase = 'idle' | 'focus' | 'break'

export type SystemStatus = 'healthy' | 'running' | 'attention' | 'blocked' | 'idle' | 'unknown'

export type AgentKind = 'codex' | 'claude' | 'human' | 'system'

export type UsageSource = 'observer' | 'manual' | 'unavailable' | 'demo'

export interface UsageMeter {
  id: 'codex' | 'claude'
  label: string
  usedPercent: number | null
  resetsAt: number | null
  limitLabel: string
  status: SystemStatus
  source: UsageSource
  note?: string
}

export interface AgentWorkflow {
  id: string
  agent: AgentKind
  repo: string
  branch?: string
  goal: string
  status: SystemStatus
  progress: number | null
  currentStep: string
  lastEvent: string
  updatedAt: number
}

export interface RuntimeNode {
  id: string
  label: string
  kind: 'agent' | 'repo' | 'service' | 'deploy' | 'data' | 'local'
  status: SystemStatus
  detail: string
  x: number
  y: number
}

export interface RuntimeEdge {
  from: string
  to: string
  label: string
  status: SystemStatus
}

export interface NextAction {
  id: string
  title: string
  reason: string
  target: string
  priority: 'now' | 'soon' | 'later'
}

export interface VoiceNote {
  id: string
  text: string
  createdAt: number
}

export interface EnvCheck {
  key: string
  label: string
  status: SystemStatus
  source: 'file' | 'process' | 'missing' | 'unknown'
  scope: 'local' | 'production'
  required: boolean
  detail: string
}

export type InfraServiceId = 'local-dev' | 'github' | 'render' | 'supabase'

export interface InfraService {
  id: InfraServiceId
  label: string
  role: string
  status: SystemStatus
  signal: string
  detail: string
  checks: string[]
}

/**
 * Edge Device demo snapshot. All fields are nullable so partial or unavailable
 * demo data degrades honestly instead of faking values.
 */
export interface RpiStatus {
  status: SystemStatus
  reachable: boolean
  health: string | null
  readinessPercent: number | null
  docker: string | null
  cpuPercent: number | null
  ramPercent: number | null
  diskPercent: number | null
  lastBackup: string | null
  lastBackupAt: number | null
  nextAction: string | null
  detail: string | null
}

export interface DevSnapshot {
  schemaVersion: 1
  updatedAt: number
  source: UsageSource
  summary: string
  usage: UsageMeter[]
  workflows: AgentWorkflow[]
  runtime: {
    nodes: RuntimeNode[]
    edges: RuntimeEdge[]
  }
  env: {
    checks: EnvCheck[]
  }
  infra: {
    services: InfraService[]
    edges: RuntimeEdge[]
  }
  nextActions: NextAction[]
  /** Edge Device server status; null when DEMO_EDGE_URL is unset or unreachable. */
  rpi?: RpiStatus | null
}

/**
 * Demo Server (Edge Device) summary from the `/demo/status` API.
 * Fetched client-side from the settings-configured endpoint (InstrumentReading pattern).
 * All fields nullable / defaulted so a partial or failing response degrades honestly.
 * Note: `blockers` (e.g. missing `git` in the container) are warnings, never fatal.
 */
export interface DemoServerSummary {
  project: string | null
  role: string | null
  phase: string | null
  progress: number | null
  health: string | null
  readiness: number | null
  docker: string | null
  system: { cpu: number | null; ram: number | null; disk: number | null }
  blockers: string[]
  nextActions: string[]
}
