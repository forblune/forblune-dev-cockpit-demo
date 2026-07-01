import { afterEach, describe, expect, it, vi } from 'vitest'
import type { UsageMeter } from '../../types'
import { buildDemoSnapshot, clampUsage, fetchDevSnapshot, normalizeStatus } from './devSnapshot'

const meter = (usedPercent: number | null): UsageMeter => ({
  id: 'codex',
  label: 'Codex',
  usedPercent,
  resetsAt: null,
  limitLabel: 'window',
  status: 'running',
  source: 'manual',
})

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

describe('normalizeStatus', () => {
  it('passes through known statuses', () => {
    expect(normalizeStatus('healthy')).toBe('healthy')
    expect(normalizeStatus('blocked')).toBe('blocked')
  })

  it('falls back to unknown for anything else', () => {
    expect(normalizeStatus('bogus')).toBe('unknown')
    expect(normalizeStatus(undefined)).toBe('unknown')
  })
})

describe('clampUsage', () => {
  it('clamps usedPercent into 0..100', () => {
    expect(clampUsage(meter(140)).usedPercent).toBe(100)
    expect(clampUsage(meter(-3)).usedPercent).toBe(0)
    expect(clampUsage(meter(55)).usedPercent).toBe(55)
  })

  it('leaves a null reading untouched', () => {
    expect(clampUsage(meter(null)).usedPercent).toBeNull()
  })
})

describe('buildDemoSnapshot', () => {
  it('is a self-consistent demo snapshot', () => {
    const s = buildDemoSnapshot(1_000_000)
    expect(s.source).toBe('demo')
    expect(s.schemaVersion).toBe(1)
    expect(s.usage.length).toBeGreaterThan(0)
    expect(s.runtime.nodes.length).toBeGreaterThan(0)
    expect(s.nextActions.length).toBeGreaterThan(0)
  })
})

describe('fetchDevSnapshot', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('throws when the observer responds non-ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({}, 503)),
    )
    await expect(fetchDevSnapshot('http://localhost:4317')).rejects.toThrow('observer 503')
  })

  it('appends /snapshot, defaults missing sections, and clamps usage', async () => {
    const spy = vi.fn(async () =>
      jsonResponse({
        schemaVersion: 1,
        updatedAt: 0,
        source: 'observer',
        summary: '',
        usage: [meter(140)],
        workflows: [],
        runtime: { nodes: [], edges: [] },
        nextActions: [],
      }),
    )
    vi.stubGlobal('fetch', spy)

    const snap = await fetchDevSnapshot('http://localhost:4317/')
    expect(spy).toHaveBeenCalledWith('http://localhost:4317/snapshot', { cache: 'no-store' })
    expect(snap.env).toEqual({ checks: [] })
    expect(snap.infra).toEqual({ services: [], edges: [] })
    expect(snap.usage[0].usedPercent).toBe(100)
  })
})
