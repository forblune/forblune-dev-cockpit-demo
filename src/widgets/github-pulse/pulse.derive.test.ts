import { describe, expect, it } from 'vitest'
import { ciFrom, toRows } from './pulse.derive'

describe('ciFrom', () => {
  it('maps GitHub rollup states onto the 4-state CI model', () => {
    expect(ciFrom('SUCCESS')).toBe('passing')
    expect(ciFrom('PENDING')).toBe('running')
    expect(ciFrom('EXPECTED')).toBe('running')
    expect(ciFrom('FAILURE')).toBe('failing')
    expect(ciFrom('ERROR')).toBe('failing')
  })

  it('treats unknown / missing rollups as none', () => {
    expect(ciFrom(undefined)).toBe('none')
    expect(ciFrom(null)).toBe('none')
    expect(ciFrom('WEIRD')).toBe('none')
  })
})

describe('toRows', () => {
  it('skips malformed nodes and derives CI per row', () => {
    const rows = toRows([
      {}, // no number → skipped
      { number: 1 }, // no repository → skipped
      {
        number: 7,
        title: 'Fix the thing',
        repository: { nameWithOwner: 'demo-labs/mission-control' },
        commits: { nodes: [{ commit: { statusCheckRollup: { state: 'FAILURE' } } }] },
      },
    ])
    expect(rows).toHaveLength(1)
    expect(rows[0].repo).toBe('demo-labs/mission-control')
    expect(rows[0].ci).toBe('failing')
    expect(rows[0].id).toBe('demo-labs/mission-control#7')
  })

  it('defaults CI to none when the rollup is absent', () => {
    const rows = toRows([
      { number: 2, repository: { nameWithOwner: 'a/b' }, commits: { nodes: [] } },
    ])
    expect(rows[0].ci).toBe('none')
  })
})
