import type { CiState, PullRequestRow } from './pulse.types'

/** Map a GitHub `statusCheckRollup.state` onto our 4-state CI model. */
export function ciFrom(state: string | null | undefined): CiState {
  switch (state) {
    case 'SUCCESS':
      return 'passing'
    case 'PENDING':
    case 'EXPECTED':
      return 'running'
    case 'FAILURE':
    case 'ERROR':
      return 'failing'
    default:
      return 'none'
  }
}

export interface RawPr {
  id: string
  number: number
  title: string
  url: string
  isDraft: boolean
  updatedAt: string
  headRefName: string
  repository: { nameWithOwner: string }
  commits: { nodes: Array<{ commit: { statusCheckRollup: { state: string } | null } }> }
}

export interface RawResponse {
  viewer: { login: string }
  mine: { nodes: Array<Partial<RawPr>> }
  reviewing: { nodes: Array<Partial<RawPr>> }
}

/** Normalize raw GraphQL PR nodes into rows, skipping malformed entries. */
export function toRows(nodes: Array<Partial<RawPr>>): PullRequestRow[] {
  const rows: PullRequestRow[] = []
  for (const n of nodes) {
    if (!n || n.number === undefined || !n.repository) continue
    const rollup = n.commits?.nodes?.[0]?.commit?.statusCheckRollup?.state
    rows.push({
      id: n.id ?? `${n.repository.nameWithOwner}#${n.number}`,
      number: n.number,
      title: n.title ?? '',
      url: n.url ?? '#',
      repo: n.repository.nameWithOwner,
      headRef: n.headRefName ?? '',
      isDraft: n.isDraft ?? false,
      ci: ciFrom(rollup),
      updatedAt: n.updatedAt ?? '',
    })
  }
  return rows
}
