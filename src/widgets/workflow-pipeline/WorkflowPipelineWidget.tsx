import { WidgetFrame } from '../../components/WidgetFrame'
import type { RuntimeNode, SystemStatus } from '../../types'
import { STATUS_COLOR, STATUS_LABEL } from '../dev-observer/status'
import { useDevSnapshot } from '../dev-observer/useDevSnapshot'
import styles from './WorkflowPipelineWidget.module.css'

interface PipelineStage {
  id: string
  label: string
  detail: string
  status: SystemStatus
}

export function WorkflowPipelineWidget() {
  const { reading, isDemo } = useDevSnapshot()
  const snapshot = reading.lastKnown
  const stages = buildStages(snapshot?.runtime.nodes ?? [], snapshot?.workflows.length ?? 0)

  return (
    <WidgetFrame
      title="개발 파이프라인"
      caption="지금 어느 단계까지 왔나"
      status={isDemo ? undefined : reading.status}
      updatedAt={reading.updatedAt}
      headerExtra={isDemo ? <span className={styles.demo}>Demo</span> : undefined}
    >
      <div className={styles.pipeline} aria-label="개발 워크플로우 파이프라인">
        {stages.map((stage, index) => (
          <StageView
            key={stage.id}
            stage={stage}
            isLast={index === stages.length - 1}
            index={index + 1}
          />
        ))}
      </div>
    </WidgetFrame>
  )
}

function StageView({
  stage,
  isLast,
  index,
}: {
  stage: PipelineStage
  isLast: boolean
  index: number
}) {
  return (
    <div className={styles.stageWrap}>
      <div className={styles.markerColumn}>
        <div className={styles.marker} style={{ borderColor: STATUS_COLOR[stage.status] }}>
          <span style={{ background: STATUS_COLOR[stage.status] }}>{index}</span>
        </div>
        {!isLast && <div className={styles.connector} />}
      </div>
      <section className={styles.stage}>
        <div className={styles.stageTop}>
          <span className={styles.label}>{stage.label}</span>
          <span className={styles.status}>{STATUS_LABEL[stage.status]}</span>
        </div>
        <div className={styles.detail}>{stage.detail}</div>
      </section>
    </div>
  )
}

function buildStages(nodes: RuntimeNode[], workflowCount: number): PipelineStage[] {
  const repo = findNode(nodes, 'repo')
  const github = findNode(nodes, 'github')
  const render = findNode(nodes, 'render')
  const supabase = findNode(nodes, 'supabase')
  const codex = findNode(nodes, 'codex')
  const claude = findNode(nodes, 'claude')
  const activeAgent = [codex, claude].find((node) => node?.status === 'running')

  return [
    {
      id: 'agent',
      label: '에이전트',
      detail:
        workflowCount > 0
          ? `${workflowCount}개 작업 · ${activeAgent?.label ?? '에이전트'}`
          : '활성 작업 없음',
      status: workflowCount > 0 ? 'running' : 'idle',
    },
    {
      id: 'repo',
      label: '레포',
      detail: repo?.detail ?? '레포 미감지',
      status: repo?.status ?? 'unknown',
    },
    {
      id: 'ci',
      label: 'GitHub·검사',
      detail: github ? '코드 저장·자동검사' : '원격 미감지',
      status: github?.status ?? 'unknown',
    },
    {
      id: 'deploy',
      label: '배포',
      detail: render?.detail ?? '배포 대상 미감지',
      status: render?.status ?? 'idle',
    },
    {
      id: 'infra',
      label: '인프라(DB)',
      detail: supabase?.detail ?? 'DB 미감지',
      status: supabase?.status ?? 'idle',
    },
  ]
}

function findNode(nodes: RuntimeNode[], id: string): RuntimeNode | undefined {
  return nodes.find((node) => node.id === id)
}
