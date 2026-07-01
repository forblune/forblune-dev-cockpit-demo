import { WidgetFrame } from '../../components/WidgetFrame'
import type { DevSnapshot, InfraService, RuntimeEdge, SystemStatus } from '../../types'
import { STATUS_COLOR, STATUS_LABEL, needsAttention } from '../dev-observer/status'
import { useDevSnapshot } from '../dev-observer/useDevSnapshot'
import styles from './InfraBoardWidget.module.css'

const SERVICE_ORDER: InfraService['id'][] = ['local-dev', 'github', 'render', 'supabase']

export function InfraBoardWidget() {
  const { reading, isDemo } = useDevSnapshot()
  const snapshot = reading.lastKnown
  const services = orderedServices(snapshot)
  const edges = snapshot?.infra?.edges ?? snapshot?.runtime.edges ?? []
  const attention = services.some((service) => needsAttention(service.status))
  const missingRequired = snapshot?.env.checks.filter(
    (check) => check.required && check.source === 'missing',
  )

  return (
    <WidgetFrame
      title="서비스 상태"
      caption="GitHub·배포·DB 연결 상태"
      status={isDemo ? undefined : reading.status}
      updatedAt={reading.updatedAt}
      alert={!isDemo && attention}
      headerExtra={isDemo ? <span className={styles.demo}>Demo</span> : undefined}
    >
      <div className={styles.layout}>
        <div className={styles.flow} aria-label="인프라 서비스 흐름">
          {services.map((service, index) => (
            <ServiceTile
              key={service.id}
              service={service}
              index={index + 1}
              isLast={index === services.length - 1}
            />
          ))}
        </div>
        <aside className={styles.side}>
          <section className={styles.panel}>
            <h3>신호</h3>
            <div className={styles.edgeList}>
              {importantEdges(edges).map((edge) => (
                <EdgeRow key={`${edge.from}-${edge.to}-${edge.label}`} edge={edge} />
              ))}
            </div>
          </section>
          <section className={styles.panel}>
            <h3>필수 키 점검</h3>
            {missingRequired && missingRequired.length > 0 ? (
              <div className={styles.checkList}>
                {missingRequired.map((check) => (
                  <div key={check.key} className={styles.checkRow}>
                    <span
                      className={styles.checkDot}
                      style={{ background: STATUS_COLOR[check.status] }}
                    />
                    <div>
                      <strong>{check.label}</strong>
                      <code>{check.key}</code>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.clear}>필수 체크 통과</div>
            )}
          </section>
        </aside>
      </div>
    </WidgetFrame>
  )
}

function ServiceTile({
  service,
  index,
  isLast,
}: {
  service: InfraService
  index: number
  isLast: boolean
}) {
  return (
    <article className={styles.tile}>
      <div className={styles.tileTop}>
        <span className={styles.index}>{index}</span>
        <span className={styles.status} style={{ color: STATUS_COLOR[service.status] }}>
          {STATUS_LABEL[service.status]}
        </span>
      </div>
      <div className={styles.serviceName}>
        <span className={styles.dot} style={{ background: STATUS_COLOR[service.status] }} />
        <strong>{service.label}</strong>
      </div>
      <p className={styles.role}>{service.role}</p>
      <div className={styles.signal}>{service.signal}</div>
      <div className={styles.detail}>{service.detail}</div>
      {service.checks.length > 0 && (
        <div className={styles.keys}>
          {service.checks.slice(0, 3).map((key) => (
            <code key={key}>{key}</code>
          ))}
        </div>
      )}
      {!isLast && <span className={styles.connector} aria-hidden="true" />}
    </article>
  )
}

function EdgeRow({ edge }: { edge: RuntimeEdge }) {
  return (
    <div className={styles.edgeRow}>
      <span className={styles.edgeStatus} style={{ background: STATUS_COLOR[edge.status] }} />
      <span className={styles.edgePath}>
        {edge.from} → {edge.to}
      </span>
      <strong>{edge.label}</strong>
      <span>{STATUS_LABEL[edge.status]}</span>
    </div>
  )
}

function orderedServices(snapshot: DevSnapshot | null | undefined): InfraService[] {
  const services = snapshot?.infra?.services ?? fallbackServices(snapshot)
  return [...services].sort((a, b) => SERVICE_ORDER.indexOf(a.id) - SERVICE_ORDER.indexOf(b.id))
}

function fallbackServices(snapshot: DevSnapshot | null | undefined): InfraService[] {
  const nodes = snapshot?.runtime.nodes ?? []
  const nodeStatus = (id: string): SystemStatus =>
    nodes.find((node) => node.id === id)?.status ?? 'unknown'
  const nodeDetail = (id: string, fallback: string): string =>
    nodes.find((node) => node.id === id)?.detail ?? fallback

  return [
    {
      id: 'local-dev',
      label: 'Local Dev',
      role: 'iPad preview source',
      status: nodeStatus('local'),
      signal: nodeDetail('local', 'dev server not detected'),
      detail: nodeDetail('repo', 'repo unknown'),
      checks: [],
    },
    {
      id: 'github',
      label: 'GitHub',
      role: 'source + CI',
      status: nodeStatus('github'),
      signal: nodeDetail('github', 'remote unknown'),
      detail: nodeDetail('repo', 'repo unknown'),
      checks: [],
    },
    {
      id: 'render',
      label: 'Render',
      role: 'deploy target',
      status: nodeStatus('render'),
      signal: nodeDetail('render', 'render config not detected'),
      detail: 'deploy status unknown',
      checks: ['RENDER_ENV'],
    },
    {
      id: 'supabase',
      label: 'Supabase',
      role: 'auth + db + storage',
      status: nodeStatus('supabase'),
      signal: nodeDetail('supabase', 'supabase not detected'),
      detail: 'data layer status unknown',
      checks: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'],
    },
  ]
}

function importantEdges(edges: RuntimeEdge[]): RuntimeEdge[] {
  const serviceIds = new Set(['local', 'repo', 'github', 'render', 'supabase'])
  return edges.filter((edge) => serviceIds.has(edge.from) && serviceIds.has(edge.to)).slice(0, 6)
}
