import { Fragment, useState } from 'react'
import { WidgetFrame } from '../../components/WidgetFrame'
import type { DemoServerSummary } from '../../types'
import type { ReadingStatus } from '../widget'
import styles from './ArchitectureMapWidget.module.css'
import { type SummaryFailure, useServerSummary } from './useServerSummary'

/**
 * System Map — how the pieces connect: Mac → GitHub → Codex → FastAPI → Docker →
 * Edge Device → Dashboard. The Edge Device/Docker/FastAPI nodes are wired to Demo Server's
 * `/demo/status` (settings-configured, InstrumentReading); the rest stay honest
 * placeholders. Connection failures are classified (mixed-content / network /
 * invalid-response / not-configured); blockers (e.g. missing git) are warnings.
 */

type ArchStatus = 'healthy' | 'warning' | 'offline' | 'unknown'

interface ArchNode {
  id: string
  icon: string
  name: string
  role: string
  description: string
  /** Where future tools (Ollama / n8n / Grafana / Home Assistant) attach here. */
  extend?: string
}

const NODES: ArchNode[] = [
  {
    id: 'mac',
    icon: '💻',
    name: 'Mac',
    role: '내 개발 머신 · observer',
    description:
      '코드를 짜는 곳. observer가 여기서 로컬 상태(프로세스·레포·사용량)를 모아 대시보드로 보냅니다. 모든 흐름의 출발점이에요.',
  },
  {
    id: 'github',
    icon: '🐙',
    name: 'GitHub',
    role: '코드 저장 · CI',
    description:
      'push한 코드를 저장하고 자동 검사(CI: lint·test·build)를 돌립니다. 협업과 배포의 중심.',
  },
  {
    id: 'codex',
    icon: '🤖',
    name: 'Codex Server',
    role: 'AI 백엔드 구현',
    description: 'Codex가 레포 맥락과 변경을 받아 백엔드 코드를 만들고 다듬습니다.',
    extend: 'Ollama(로컬 LLM)를 여기 옆에 붙여 모델을 바꿀 수 있어요.',
  },
  {
    id: 'fastapi',
    icon: '⚡',
    name: 'FastAPI',
    role: '백엔드 API',
    description:
      '데모 백엔드 서비스 상태가 여기 표시됩니다. 이 노드가 정상이면 /demo/status가 응답 중이라는 뜻이에요.',
    extend: 'n8n(자동화)·Grafana(메트릭)를 API 옆에 연결할 수 있어요.',
  },
  {
    id: 'docker',
    icon: '🐳',
    name: 'Docker',
    role: '컨테이너 런타임',
    description: 'FastAPI 앱을 컨테이너로 패키징해 어디서나 똑같이 실행합니다.',
  },
  {
    id: 'edge-device',
    icon: '🍓',
    name: 'Edge Device',
    role: '배포 대상 서버 (Demo Server)',
    description: '데모 워크로드가 Edge Device에서 실행되며, 그 상태를 대시보드로 보고합니다.',
    extend: '추가 데모 서비스를 Edge Device 위에 얹을 수 있어요.',
  },
  {
    id: 'dashboard',
    icon: '📊',
    name: 'Dashboard',
    role: '이 관제 화면',
    description:
      'Edge Device가 내보내는 헬스·준비도·시스템 스냅샷을 받아 표시합니다 — 지금 보고 있는 화면이에요.',
    extend: 'Grafana 대시보드를 옆에 띄워 메트릭을 더 깊게 볼 수 있어요.',
  },
]

/** Flow label between NODES[i] and NODES[i+1]. */
const FLOWS = [
  'git push / pull',
  'repo context / changes',
  'backend implementation',
  'container runtime',
  'deploy / runtime',
  'health / readiness / snapshot',
]

const STATUS_META: Record<ArchStatus, { label: string; color: string }> = {
  healthy: { label: '정상', color: 'var(--fresh-live)' },
  warning: { label: '주의', color: 'var(--fresh-stale)' },
  offline: { label: '오프라인', color: 'var(--fresh-offline)' },
  unknown: { label: '관측 안 됨', color: 'var(--status-none)' },
}

/** Short node-note + long explanation for each failure cause. */
const FAILURE_NOTE: Record<NonNullable<SummaryFailure>, string> = {
  'not-configured': 'adapter not connected',
  'mixed-content': 'mixed-content blocked',
  network: 'network error',
  'invalid-response': 'invalid response',
}

const FAILURE_LABEL: Record<NonNullable<SummaryFailure>, string> = {
  'not-configured':
    '설정(⚙)에서 Demo Server summary endpoint를 입력하면 켜져요. (adapter not connected)',
  'mixed-content':
    'mixed-content 차단 — HTTPS 코크핏에서는 HTTP endpoint를 못 불러와요. 코크핏을 HTTP(LAN)로 열거나, endpoint를 HTTPS로 노출하거나, observer 경유로 받아야 합니다.',
  network:
    'network error — endpoint에 도달하지 못했어요. 주소·포트·방화벽, iPad와 Edge Device가 같은 네트워크인지 확인하세요.',
  'invalid-response':
    'invalid response — /demo/status 응답을 해석하지 못했어요. 주소가 맞는지, JSON을 반환하는지 확인하세요.',
}

interface NodeState {
  status: ArchStatus
  note: string
}

/**
 * Edge Device / Docker / FastAPI derive from the Demo Server summary; the rest stay honest
 * placeholders. A reachable `/demo/status` proves FastAPI is up. Blockers → warning.
 * When there's no data, the failure cause becomes the node note.
 */
function deriveStates(
  summary: DemoServerSummary | null,
  status: ReadingStatus,
  failure: SummaryFailure,
): Record<string, NodeState> {
  const stale = status === 'stale'
  const failStatus: ArchStatus = !failure || failure === 'not-configured' ? 'unknown' : 'offline'
  const failNote = failure ? FAILURE_NOTE[failure] : '연결 중…'

  let fastapi: NodeState
  let docker: NodeState
  let edgeDevice: NodeState

  if (summary) {
    fastapi = {
      status: stale ? 'warning' : 'healthy',
      note: stale ? '/demo/status 지연(stale)' : '/demo/status 응답',
    }
    docker = summary.docker
      ? {
          status: /healthy|run|up|active/i.test(summary.docker)
            ? stale
              ? 'warning'
              : 'healthy'
            : 'warning',
          note: `Docker: ${summary.docker}`,
        }
      : { status: 'unknown', note: 'docker 정보 없음' }
    const blocked = summary.blockers.length > 0
    edgeDevice = {
      status: stale || blocked ? 'warning' : 'healthy',
      note: blocked
        ? `warning ${summary.blockers.length}건`
        : summary.phase
          ? `phase: ${summary.phase}`
          : (summary.health ?? 'OK'),
    }
  } else {
    fastapi = { status: failStatus, note: failNote }
    docker = { status: failStatus, note: failNote }
    edgeDevice = { status: failStatus, note: failNote }
  }

  return {
    mac: { status: 'unknown', note: 'observer needed' },
    github: { status: 'unknown', note: 'adapter not connected' },
    codex: { status: 'unknown', note: 'adapter not connected' },
    fastapi,
    docker,
    'edge-device': edgeDevice,
    dashboard: { status: 'unknown', note: 'adapter not connected' },
  }
}

export function ArchitectureMapWidget() {
  const { reading, configured, failure } = useServerSummary()
  const summary = reading.lastKnown
  const states = deriveStates(summary, reading.status, failure)
  const [selected, setSelected] = useState<string | null>(null)
  const node = NODES.find((n) => n.id === selected) ?? null

  return (
    <WidgetFrame
      title="System Map"
      caption="내 장비·서버·GitHub·AI 도구가 어떻게 연결되어 있는지"
      status={configured ? reading.status : undefined}
      updatedAt={reading.updatedAt}
    >
      <div className={styles.wrap}>
        <div className={styles.flow} aria-label="시스템 연결 흐름">
          {NODES.map((n, i) => {
            const meta = STATUS_META[states[n.id].status]
            return (
              <Fragment key={n.id}>
                <button
                  type="button"
                  className={`${styles.node} ${selected === n.id ? styles.active : ''}`}
                  onClick={() => setSelected((cur) => (cur === n.id ? null : n.id))}
                  aria-pressed={selected === n.id}
                >
                  <span className={styles.ring} style={{ borderColor: meta.color }}>
                    <span className={styles.icon}>{n.icon}</span>
                    <span className={styles.statusDot} style={{ background: meta.color }} />
                  </span>
                  <span className={styles.nodeName}>{n.name}</span>
                  <span className={styles.nodeStatus} style={{ color: meta.color }}>
                    {meta.label}
                  </span>
                </button>
                {i < NODES.length - 1 && (
                  <span className={styles.connector} aria-hidden="true">
                    <span className={styles.flowLabel}>{FLOWS[i]}</span>
                    <span className={styles.arrow}>→</span>
                  </span>
                )}
              </Fragment>
            )
          })}
        </div>

        <div className={styles.detail}>
          {node ? (
            <>
              <div className={styles.detailHead}>
                <span className={styles.detailIcon}>{node.icon}</span>
                <div className={styles.detailTitle}>
                  <div className={styles.detailName}>{node.name}</div>
                  <div className={styles.detailRole}>{node.role}</div>
                </div>
                <span
                  className={styles.detailStatus}
                  style={{ color: STATUS_META[states[node.id].status].color }}
                >
                  ● {STATUS_META[states[node.id].status].label}
                  <small>{states[node.id].note}</small>
                </span>
              </div>
              <p className={styles.detailDesc}>{node.description}</p>
              {node.id === 'edge-device' && configured && (
                <ServerManagement summary={summary} status={reading.status} failure={failure} />
              )}
              {node.extend && <p className={styles.extend}>➕ {node.extend}</p>}
            </>
          ) : (
            <div className={styles.intro}>
              <strong>이 지도는?</strong>
              <p>
                내 코드가 <b>Mac</b>에서 시작해 GitHub·AI(Codex)·FastAPI·Docker를 거쳐{' '}
                <b>Edge Device</b>에 배포되고, 그 상태가 이 <b>Dashboard</b>로 돌아오는 전체
                흐름이에요. <b>노드를 누르면</b> 각 단계의 역할·상태·설명이 나옵니다.
              </p>
              <p className={styles.introNote}>
                {failure
                  ? FAILURE_LABEL[failure]
                  : 'Edge Device·Docker·FastAPI가 Demo Server /demo/status 실데이터로 갱신돼요. 🍓 노드를 누르면 서버 상세(phase·progress·system·warnings·다음 행동)가 보입니다.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </WidgetFrame>
  )
}

function readingLabel(status: ReadingStatus): string {
  if (status === 'live') return '실시간'
  if (status === 'stale') return '지연(stale)'
  return '오프라인'
}

function ServerManagement({
  summary,
  status,
  failure,
}: {
  summary: DemoServerSummary | null
  status: ReadingStatus
  failure: SummaryFailure
}) {
  if (!summary) {
    return <p className={styles.smNote}>{failure ? FAILURE_LABEL[failure] : '연결 중…'}</p>
  }
  const sys = summary.system
  const hasSys = sys.cpu != null || sys.ram != null || sys.disk != null
  return (
    <section className={styles.sm} aria-label="Server Management">
      <div className={styles.smHead}>
        <span className={styles.smTitle}>Server Management</span>
        <span className={styles.smFresh} data-status={status}>
          {readingLabel(status)}
        </span>
      </div>

      <div className={styles.smFields}>
        {summary.phase && <Field k="phase" v={summary.phase} />}
        {summary.health && <Field k="health" v={summary.health} />}
        {summary.readiness != null && <Field k="readiness" v={`${summary.readiness}%`} />}
        {summary.docker && <Field k="docker" v={summary.docker} />}
        {summary.project && <Field k="project" v={summary.project} />}
        {summary.role && <Field k="role" v={summary.role} />}
      </div>

      {summary.progress != null && <Meter label="progress" percent={summary.progress} />}
      {hasSys && (
        <div className={styles.smGauges}>
          <Meter label="CPU" percent={sys.cpu} />
          <Meter label="RAM" percent={sys.ram} />
          <Meter label="Disk" percent={sys.disk} />
        </div>
      )}

      {summary.blockers.length > 0 && (
        <div className={styles.smList}>
          <span className={styles.smListHead}>⚠ warnings ({summary.blockers.length})</span>
          {summary.blockers.map((b) => (
            <div key={b} className={styles.smBlocker}>
              {b}
            </div>
          ))}
        </div>
      )}

      {summary.nextActions.length > 0 && (
        <div className={styles.smList}>
          <span className={styles.smListHead}>다음 행동</span>
          {summary.nextActions.map((a) => (
            <div key={a} className={styles.smNext}>
              ▸ {a}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <span className={styles.field}>
      <span className={styles.fieldK}>{k}</span>
      <span className={styles.fieldV}>{v}</span>
    </span>
  )
}

function Meter({ label, percent }: { label: string; percent: number | null }) {
  const color =
    percent == null
      ? 'var(--surface-3)'
      : percent >= 90
        ? 'var(--fresh-offline)'
        : percent >= 75
          ? 'var(--fresh-stale)'
          : 'var(--fresh-live)'
  return (
    <div className={styles.meter}>
      <div className={styles.meterTop}>
        <span>{label}</span>
        <span>{percent == null ? '—' : `${Math.round(percent)}%`}</span>
      </div>
      <div className={styles.meterTrack}>
        <div
          className={styles.meterFill}
          style={{
            width: percent == null ? '0%' : `${Math.min(100, percent)}%`,
            background: color,
          }}
        />
      </div>
    </div>
  )
}
