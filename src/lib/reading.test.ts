import { describe, expect, it } from 'vitest'
import { type QueryLike, toReading } from './reading'

function q<T>(over: Partial<QueryLike<T>>): QueryLike<T> {
  return { data: undefined, isError: false, error: undefined, dataUpdatedAt: 0, ...over }
}

describe('toReading', () => {
  it('is live when online with fresh data', () => {
    const r = toReading(q({ data: 42, dataUpdatedAt: 1000 }), true)
    expect(r.status).toBe('live')
    expect(r.data).toBe(42)
    expect(r.lastKnown).toBe(42)
    expect(r.updatedAt).toBe(1000)
    expect(r.error).toBeUndefined()
  })

  it('keeps lastKnown but marks stale when an error arrives after data', () => {
    const r = toReading(
      q({ data: 42, dataUpdatedAt: 1000, isError: true, error: new Error('boom') }),
      true,
    )
    expect(r.status).toBe('stale')
    expect(r.data).toBe(42) // never blanked once seen — the cardinal honesty rule
    expect(r.error).toBe('boom')
  })

  it('is stale when offline but data was already seen', () => {
    const r = toReading(q({ data: 42, dataUpdatedAt: 1000 }), false)
    expect(r.status).toBe('stale')
    expect(r.data).toBe(42)
  })

  it('is live (connecting) when online with no data yet', () => {
    const r = toReading(q<number>({}), true)
    expect(r.status).toBe('live')
    expect(r.data).toBeNull()
    expect(r.lastKnown).toBeNull()
    expect(r.updatedAt).toBeNull()
  })

  it('is offline when there is no data and the source is degraded', () => {
    expect(toReading(q<number>({}), false).status).toBe('offline')
    expect(toReading(q<number>({ isError: true, error: 'x' }), true).status).toBe('offline')
  })

  it('stringifies non-Error errors', () => {
    expect(toReading(q({ data: 1, isError: true, error: 'plain' }), true).error).toBe('plain')
  })
})
