export type CiState = 'passing' | 'running' | 'failing' | 'none'

export interface PullRequestRow {
  id: string
  number: number
  title: string
  url: string
  repo: string // owner/name
  headRef: string
  isDraft: boolean
  ci: CiState
  updatedAt: string
}

export interface PulseData {
  viewer: string
  mine: PullRequestRow[]
  reviewRequested: PullRequestRow[]
}
