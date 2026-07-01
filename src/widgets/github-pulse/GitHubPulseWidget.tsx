import { useEffect, useRef, useState } from 'react'
import { useBusEvent } from '../../app/eventBus'
import { WidgetFrame } from '../../components/WidgetFrame'
import styles from './GitHubPulseWidget.module.css'
import type { CiState, PullRequestRow } from './pulse.types'
import { useGitHubPulse } from './useGitHubPulse'

const CI_COLOR: Record<CiState, string> = {
  passing: 'var(--status-passing)',
  running: 'var(--status-running)',
  failing: 'var(--status-failing)',
  none: 'var(--status-none)',
}

/** How long a fresh-failure banner lingers before auto-dismissing (ms). */
const BANNER_MS = 15_000

export function GitHubPulseWidget() {
  const { reading, hasToken } = useGitHubPulse()
  const data = reading.lastKnown
  const recent = useRecentFailure()

  // Persistent attention while any of my PRs is red — glanceable across the room.
  const anyFailing = (data?.mine ?? []).some((pr) => pr.ci === 'failing')

  return (
    <WidgetFrame
      title="GitHub Pulse"
      status={hasToken ? reading.status : undefined}
      updatedAt={reading.updatedAt}
      alert={anyFailing}
    >
      {recent && (
        <button type="button" className={styles.banner} onClick={recent.dismiss}>
          <span className={styles.bannerIcon}>⚠</span>
          <span className={styles.bannerText}>
            CI 실패 — {shortRepo(recent.repo)} #{recent.pr}
          </span>
          <span className={styles.bannerClose}>✕</span>
        </button>
      )}
      {!hasToken ? (
        <Empty text="설정 ⚙ 에서 GitHub 토큰을 추가하세요" />
      ) : !data ? (
        <Empty text={reading.error ? `오류: ${reading.error}` : '불러오는 중…'} />
      ) : data.mine.length === 0 && data.reviewRequested.length === 0 ? (
        <Empty text="열린 PR이 없습니다 ✓" />
      ) : (
        <div className={styles.scroll}>
          <Section title="내 PR" rows={data.mine} />
          <Section title="리뷰 요청" rows={data.reviewRequested} review />
        </div>
      )}
    </WidgetFrame>
  )
}

interface RecentFailure {
  repo: string
  pr: number
  dismiss: () => void
}

/**
 * The cockpit's first eventBus consumer: surfaces a freshly-failed PR (announced by
 * useGitHubPulse) as a transient banner. The red frame border (driven by live data)
 * stays up while the failure persists; this banner is the moment-of-breakage alert.
 */
function useRecentFailure(): RecentFailure | null {
  const [failure, setFailure] = useState<{ repo: string; pr: number } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useBusEvent((e) => {
    if (e.type !== 'github:ci-failed') return
    setFailure({ repo: e.repo, pr: e.pr })
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setFailure(null), BANNER_MS)
  })

  useEffect(() => () => clearTimeout(timer.current ?? undefined), [])

  if (!failure) return null
  return {
    ...failure,
    dismiss: () => {
      if (timer.current) clearTimeout(timer.current)
      setFailure(null)
    },
  }
}

function shortRepo(repo: string): string {
  return repo.split('/')[1] ?? repo
}

function Section({
  title,
  rows,
  review,
}: { title: string; rows: PullRequestRow[]; review?: boolean }) {
  if (rows.length === 0) return null
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>
        {title} <span className={styles.count}>{rows.length}</span>
      </div>
      {rows.map((pr) => (
        <PrRow key={pr.id} pr={pr} review={review} />
      ))}
    </div>
  )
}

function PrRow({ pr, review }: { pr: PullRequestRow; review?: boolean }) {
  const repoName = pr.repo.split('/')[1] ?? pr.repo
  return (
    <a className={styles.row} href={pr.url} target="_blank" rel="noreferrer">
      <span className={styles.ciDot} style={{ background: CI_COLOR[pr.ci] }} />
      <span className={styles.repo}>{repoName}</span>
      <span className={styles.num}>#{pr.number}</span>
      <span className={styles.prTitle}>{pr.title}</span>
      {review && <span className={styles.reviewBadge}>리뷰</span>}
      {pr.isDraft && <span className={styles.draft}>draft</span>}
    </a>
  )
}

function Empty({ text }: { text: string }) {
  return <div className={styles.empty}>{text}</div>
}
