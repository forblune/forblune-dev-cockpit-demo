import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { bus } from '../../app/eventBus'
import { useCockpit } from '../../app/store'
import { githubClient } from '../../lib/github'
import { toReading } from '../../lib/reading'
import { useOnline } from '../../system/useOnline'
import { repoSlug } from '../../types'
import type { InstrumentReading } from '../widget'
import { type RawResponse, toRows } from './pulse.derive'
import { PULSE_QUERY } from './pulse.graphql'
import type { PulseData } from './pulse.types'

const REFETCH_MS = 60_000

export interface PulseState {
  reading: InstrumentReading<PulseData>
  hasToken: boolean
}

export function useGitHubPulse(): PulseState {
  const token = useCockpit((s) => s.githubToken)
  const pinnedRepos = useCockpit((s) => s.pinnedRepos)
  const online = useOnline()

  const slugs = pinnedRepos.map(repoSlug)
  const filter = slugs.map((s) => `repo:${s}`).join(' ')

  const query = useQuery({
    queryKey: ['github-pulse', slugs],
    enabled: !!token,
    refetchInterval: REFETCH_MS,
    queryFn: async (): Promise<PulseData> => {
      if (!token) throw new Error('GitHub 토큰이 없습니다')
      const client = githubClient(token)
      const res = await client<RawResponse>(PULSE_QUERY, {
        mine: `is:open is:pr author:@me ${filter}`.trim(),
        reviewing: `is:open is:pr review-requested:@me ${filter}`.trim(),
      })
      return {
        viewer: res.viewer.login,
        mine: toRows(res.mine.nodes),
        reviewRequested: toRows(res.reviewing.nodes),
      }
    },
  })

  // Edge-detect CI failures on my own PRs and announce each NEW one on the bus.
  // The first reading only seeds the baseline (so a reload doesn't re-alert old
  // failures); subsequent polls emit only on a fresh passing/none → failing flip.
  const knownFailing = useRef<Set<string>>(new Set())
  const seeded = useRef(false)
  const data = query.data
  useEffect(() => {
    if (!data) return
    const failing = new Set(
      data.mine.filter((pr) => pr.ci === 'failing').map((pr) => `${pr.repo}#${pr.number}`),
    )
    if (!seeded.current) {
      knownFailing.current = failing
      seeded.current = true
      return
    }
    for (const key of failing) {
      if (!knownFailing.current.has(key)) {
        const hash = key.lastIndexOf('#')
        bus.emit({
          type: 'github:ci-failed',
          repo: key.slice(0, hash),
          pr: Number(key.slice(hash + 1)),
        })
      }
    }
    knownFailing.current = failing
  }, [data])

  return { reading: toReading(query, online), hasToken: !!token }
}
