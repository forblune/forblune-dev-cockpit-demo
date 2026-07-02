import type { DevSnapshot, SystemStatus, UsageMeter } from '../../types'

const MINUTE = 60_000
const HOUR = 60 * MINUTE

export function buildDemoSnapshot(now = Date.now()): DevSnapshot {
  return {
    schemaVersion: 1,
    updatedAt: now - 2 * MINUTE,
    source: 'demo',
    summary:
      'Observer 연결 전 데모 상태입니다. Mac의 observer를 붙이면 실제 작업 흐름으로 교체됩니다.',
    usage: [
      {
        id: 'codex',
        label: 'Codex',
        usedPercent: 68,
        resetsAt: now + 5 * HOUR + 20 * MINUTE,
        limitLabel: 'daily window',
        status: 'running',
        source: 'demo',
        note: '실제 사용량은 observer 또는 수동 소스가 필요합니다.',
      },
      {
        id: 'claude',
        label: 'Claude Code',
        usedPercent: 41,
        resetsAt: now + 12 * HOUR,
        limitLabel: 'session window',
        status: 'healthy',
        source: 'demo',
        note: 'Claude usage adapter 대기 중',
      },
    ],
    workflows: [
      {
        id: 'codex-dev-cockpit',
        agent: 'codex',
        repo: 'forblune-dev-cockpit-demo',
        branch: 'main',
        goal: 'AI 개발 관제판으로 리디자인',
        status: 'running',
        progress: 62,
        currentStep: 'Runtime Map, Usage, Next Action 위젯 구성',
        lastEvent: '기존 PR/포모도로 중심 화면을 agent workflow 중심으로 교체 중',
        updatedAt: now - 90_000,
      },
      {
        id: 'claude-contract-review',
        agent: 'claude',
        repo: 'Demo Project',
        branch: 'feature/api-map',
        goal: 'Supabase API 계약과 Render 배포 경로 점검',
        status: 'attention',
        progress: 35,
        currentStep: '환경 변수와 DB 권한 확인 필요',
        lastEvent: 'DEMO_SERVICE_KEY가 Render 환경에 있는지 사람 확인 필요',
        updatedAt: now - 11 * MINUTE,
      },
    ],
    runtime: {
      nodes: [
        {
          id: 'codex',
          label: 'Codex',
          kind: 'agent',
          status: 'running',
          detail: 'UI implementation',
          x: 16,
          y: 28,
        },
        {
          id: 'claude',
          label: 'Claude',
          kind: 'agent',
          status: 'attention',
          detail: 'API contract review',
          x: 16,
          y: 72,
        },
        {
          id: 'repo',
          label: 'Repo',
          kind: 'repo',
          status: 'running',
          detail: 'forblune-dev-cockpit-demo',
          x: 44,
          y: 50,
        },
        {
          id: 'github',
          label: 'GitHub',
          kind: 'service',
          status: 'healthy',
          detail: 'source + CI',
          x: 70,
          y: 25,
        },
        {
          id: 'render',
          label: 'Render',
          kind: 'deploy',
          status: 'healthy',
          detail: 'web service',
          x: 88,
          y: 42,
        },
        {
          id: 'supabase',
          label: 'Supabase',
          kind: 'data',
          status: 'attention',
          detail: 'auth + db + storage',
          x: 75,
          y: 76,
        },
        {
          id: 'local',
          label: 'Local Dev',
          kind: 'local',
          status: 'running',
          detail: 'Vite on LAN',
          x: 44,
          y: 82,
        },
      ],
      edges: [
        { from: 'codex', to: 'repo', label: 'writes', status: 'running' },
        { from: 'claude', to: 'repo', label: 'reviews', status: 'attention' },
        { from: 'repo', to: 'github', label: 'push', status: 'healthy' },
        { from: 'github', to: 'render', label: 'deploy', status: 'healthy' },
        { from: 'render', to: 'supabase', label: 'env', status: 'attention' },
        { from: 'local', to: 'supabase', label: 'dev API', status: 'running' },
      ],
    },
    env: {
      checks: [
        {
          key: 'VITE_SUPABASE_URL',
          label: 'Supabase URL',
          status: 'healthy',
          source: 'file',
          scope: 'local',
          required: true,
          detail: '.env.local',
        },
        {
          key: 'DEMO_PUBLIC_CLIENT_KEY',
          label: 'Demo public client key',
          status: 'healthy',
          source: 'file',
          scope: 'local',
          required: true,
          detail: '.env.local',
        },
        {
          key: 'RENDER_ENV',
          label: 'Render env',
          status: 'unknown',
          source: 'unknown',
          scope: 'production',
          required: false,
          detail: 'Render API adapter not connected',
        },
      ],
    },
    infra: {
      services: [
        {
          id: 'local-dev',
          label: 'Local Dev',
          role: 'iPad preview source',
          status: 'running',
          signal: 'Vite on LAN',
          detail: 'forblune-dev-cockpit-demo',
          checks: [],
        },
        {
          id: 'github',
          label: 'GitHub',
          role: 'source + CI',
          status: 'healthy',
          signal: 'origin remote detected',
          detail: 'feature/api-map',
          checks: [],
        },
        {
          id: 'render',
          label: 'Render',
          role: 'deploy target',
          status: 'unknown',
          signal: 'render.yaml detected',
          detail: 'API adapter not connected',
          checks: ['RENDER_ENV'],
        },
        {
          id: 'supabase',
          label: 'Supabase',
          role: 'auth + db + storage',
          status: 'attention',
          signal: 'project hints detected',
          detail: 'required browser env missing',
          checks: ['VITE_SUPABASE_URL', 'DEMO_PUBLIC_CLIENT_KEY'],
        },
      ],
      edges: [
        { from: 'local', to: 'supabase', label: 'dev API', status: 'running' },
        { from: 'repo', to: 'github', label: 'push', status: 'healthy' },
        { from: 'github', to: 'render', label: 'deploy', status: 'unknown' },
        { from: 'render', to: 'supabase', label: 'env', status: 'attention' },
      ],
    },
    nextActions: [
      {
        id: 'observer',
        title: 'Mac observer를 연결해서 데모 상태를 실제 상태로 교체',
        reason: 'iPad Safari는 로컬 프로세스와 레포 상태를 직접 볼 수 없습니다.',
        target: 'npm run observer 후 설정에 LAN URL 입력',
        priority: 'now',
      },
      {
        id: 'usage-source',
        title: 'Codex / Claude 사용량 소스를 정하기',
        reason: '공식 사용량 API가 없는 도구는 observer adapter 또는 수동 입력이 필요합니다.',
        target: 'CODEX_USAGE_PERCENT, CLAUDE_USAGE_PERCENT 환경값부터 연결',
        priority: 'soon',
      },
      {
        id: 'infra-map',
        title: '주요 레포에 Supabase / Render 힌트 추가',
        reason:
          'render.yaml, supabase 디렉터리, package dependency로 인프라 노드를 자동 감지합니다.',
        target: '현재 개발 중인 레포부터 연결',
        priority: 'later',
      },
    ],
    edgeDevice: {
      status: 'healthy',
      reachable: true,
      health: 'OK',
      readinessPercent: 98,
      docker: 'running',
      cpuPercent: 23,
      ramPercent: 47,
      diskPercent: 61,
      lastBackup: '3시간 전 백업',
      lastBackupAt: now - 3 * HOUR,
      nextAction: '백업 로그 확인',
      detail: null,
    },
  }
}

export function normalizeStatus(status: string | undefined): SystemStatus {
  if (
    status === 'healthy' ||
    status === 'running' ||
    status === 'attention' ||
    status === 'blocked' ||
    status === 'idle' ||
    status === 'unknown'
  ) {
    return status
  }
  return 'unknown'
}

export function clampUsage(meter: UsageMeter): UsageMeter {
  if (meter.usedPercent === null) return meter
  return {
    ...meter,
    usedPercent: Math.min(100, Math.max(0, meter.usedPercent)),
  }
}

export async function fetchDevSnapshot(observerUrl: string): Promise<DevSnapshot> {
  const endpoint = snapshotEndpoint(observerUrl)
  const res = await fetch(endpoint, { cache: 'no-store' })
  if (!res.ok) throw new Error(`observer ${res.status}`)
  const snapshot = (await res.json()) as DevSnapshot
  return {
    ...snapshot,
    env: snapshot.env ?? { checks: [] },
    infra: snapshot.infra ?? { services: [], edges: [] },
    usage: snapshot.usage.map(clampUsage),
    edgeDevice: snapshot.edgeDevice ?? null,
  }
}

function snapshotEndpoint(observerUrl: string): string {
  const trimmed = observerUrl.trim().replace(/\/+$/, '')
  if (trimmed.endsWith('/snapshot')) return trimmed
  return `${trimmed}/snapshot`
}
