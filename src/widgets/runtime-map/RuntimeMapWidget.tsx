import { WidgetFrame } from '../../components/WidgetFrame'
import type { RuntimeEdge, RuntimeNode } from '../../types'
import { STATUS_COLOR, STATUS_LABEL, needsAttention } from '../dev-observer/status'
import { useDevSnapshot } from '../dev-observer/useDevSnapshot'
import styles from './RuntimeMapWidget.module.css'

const KIND_LABEL: Record<RuntimeNode['kind'], string> = {
  agent: '에이전트',
  repo: '레포',
  service: '서비스',
  deploy: '배포',
  data: '데이터',
  local: '로컬',
}

export function RuntimeMapWidget() {
  const { reading, isDemo } = useDevSnapshot()
  const snapshot = reading.lastKnown
  const nodes = snapshot?.runtime.nodes ?? []
  const edges = snapshot?.runtime.edges ?? []
  const alert = nodes.some((node) => needsAttention(node.status))

  return (
    <WidgetFrame
      title="작동 구조"
      caption="정보가 어디서 어디로 흐르나"
      status={isDemo ? undefined : reading.status}
      updatedAt={reading.updatedAt}
      alert={!isDemo && alert}
      headerExtra={isDemo ? <span className={styles.demo}>Demo</span> : undefined}
    >
      {!snapshot ? (
        <div className={styles.empty}>Observer 연결 대기 중</div>
      ) : (
        <div className={styles.wrap}>
          <div className={styles.summary}>{snapshot.summary}</div>
          <div className={styles.map} aria-label="개발 시스템 작동 지도">
            <svg className={styles.edges} viewBox="0 0 100 100" aria-hidden="true">
              {edges.map((edge) => (
                <MapEdge key={`${edge.from}-${edge.to}-${edge.label}`} edge={edge} nodes={nodes} />
              ))}
            </svg>
            {nodes.map((node) => (
              <RuntimeNodeView key={node.id} node={node} />
            ))}
          </div>
        </div>
      )}
    </WidgetFrame>
  )
}

function MapEdge({ edge, nodes }: { edge: RuntimeEdge; nodes: RuntimeNode[] }) {
  const from = nodes.find((node) => node.id === edge.from)
  const to = nodes.find((node) => node.id === edge.to)
  if (!from || !to) return null

  const midX = (from.x + to.x) / 2
  const midY = (from.y + to.y) / 2

  return (
    <g>
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={STATUS_COLOR[edge.status]}
        strokeWidth="0.8"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        opacity="0.78"
      />
      <text x={midX} y={midY - 2} className={styles.edgeText} textAnchor="middle">
        {edge.label}
      </text>
    </g>
  )
}

function RuntimeNodeView({ node }: { node: RuntimeNode }) {
  return (
    <div
      className={`${styles.node} ${styles[node.kind]}`}
      style={{
        left: `${node.x}%`,
        top: `${node.y}%`,
        borderColor: STATUS_COLOR[node.status],
      }}
    >
      <div className={styles.nodeTop}>
        <span className={styles.dot} style={{ background: STATUS_COLOR[node.status] }} />
        <span className={styles.kind}>{KIND_LABEL[node.kind]}</span>
      </div>
      <div className={styles.nodeLabel}>{node.label}</div>
      <div className={styles.nodeDetail}>{node.detail}</div>
      <div className={styles.nodeStatus}>{STATUS_LABEL[node.status]}</div>
    </div>
  )
}
