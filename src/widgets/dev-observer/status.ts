import type { AgentKind, NextAction, SystemStatus } from '../../types'

export const STATUS_LABEL: Record<SystemStatus, string> = {
  healthy: '정상',
  running: '실행 중',
  attention: '확인 필요',
  blocked: '막힘',
  idle: '대기',
  unknown: '미확인',
}

export const STATUS_COLOR: Record<SystemStatus, string> = {
  healthy: 'var(--status-passing)',
  running: 'var(--status-running)',
  attention: 'var(--status-review)',
  blocked: 'var(--status-failing)',
  idle: 'var(--status-none)',
  unknown: 'var(--status-none)',
}

export const AGENT_LABEL: Record<AgentKind, string> = {
  codex: 'Codex',
  claude: 'Claude',
  human: 'You',
  system: 'System',
}

export const PRIORITY_LABEL: Record<NextAction['priority'], string> = {
  now: 'Now',
  soon: 'Soon',
  later: 'Later',
}

export function needsAttention(status: SystemStatus): boolean {
  return status === 'attention' || status === 'blocked'
}
