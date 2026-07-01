import { useQuery } from '@tanstack/react-query'
import { useCockpit } from '../../app/store'
import { toReading } from '../../lib/reading'
import { useOnline } from '../../system/useOnline'
import type { DemoServerSummary } from '../../types'
import type { InstrumentReading } from '../widget'

/** Why no data is shown — surfaced to the UI so the cause is explicit, not generic. */
export type SummaryFailure =
  | 'not-configured'
  | 'mixed-content'
  | 'network'
  | 'invalid-response'
  | null

/**
 * Demo Server (Edge Device) `/demo/status` adapter — client-side, settings-configured,
 * InstrumentReading honesty contract. `failure` classifies *why* there's no data:
 *   not-configured  → endpoint empty
 *   mixed-content   → HTTPS cockpit can't fetch an HTTP endpoint (predicted by protocol)
 *   invalid-response→ non-OK status / unparseable body / unrecognized shape
 *   network         → fetch rejected (host unreachable, CORS, refused, timeout)
 * Once data has been seen, failure is null and lastKnown is shown (marked stale).
 */
export function useServerSummary(): {
  reading: InstrumentReading<DemoServerSummary>
  configured: boolean
  endpoint: string
  failure: SummaryFailure
} {
  const demoServerUrl = useCockpit((s) => s.demoServerUrl)
  const online = useOnline()
  const endpoint = demoServerUrl?.trim() ? summaryEndpoint(demoServerUrl.trim()) : ''

  const query = useQuery({
    queryKey: ['demo-server-summary', endpoint],
    queryFn: () => fetchSummary(endpoint),
    enabled: Boolean(endpoint),
    refetchInterval: 10_000,
    retry: 1,
    staleTime: 8_000,
  })

  const reading = toReading(query, online)
  return { reading, configured: Boolean(endpoint), endpoint, failure: classify(endpoint, reading) }
}

function classify(endpoint: string, reading: InstrumentReading<DemoServerSummary>): SummaryFailure {
  if (!endpoint) return 'not-configured'
  if (reading.lastKnown) return null // have data (live or stale) — no failure banner
  const err = reading.error ?? ''
  if (!err && reading.status !== 'offline') return null // still connecting
  if (err.startsWith('invalid')) return 'invalid-response'
  if (isMixedContent(endpoint)) return 'mixed-content'
  return 'network'
}

/** An HTTPS page cannot load an HTTP subresource — the browser blocks it silently. */
function isMixedContent(endpoint: string): boolean {
  if (typeof window === 'undefined') return false
  return window.location.protocol === 'https:' && endpoint.startsWith('http://')
}

/** Accept either a base URL or the full `/demo/status` URL. */
function summaryEndpoint(url: string): string {
  const trimmed = url.replace(/\/+$/, '')
  if (/\/demo\/status$/.test(trimmed)) return trimmed
  return `${trimmed}/demo/status`
}

async function fetchSummary(endpoint: string): Promise<DemoServerSummary> {
  let res: Response
  try {
    res = await fetch(endpoint, { cache: 'no-store' })
  } catch (e) {
    // fetch rejection — network / CORS / mixed-content. Keep the original message
    // (it won't start with "invalid", so classify() falls to mixed-content/network).
    throw e instanceof Error ? e : new Error('network')
  }
  if (!res.ok) throw new Error(`invalid:status:${res.status}`)
  let raw: unknown
  try {
    raw = await res.json()
  } catch {
    throw new Error('invalid:parse')
  }
  const parsed = parseSummary(raw)
  if (!looksLikeSummary(parsed)) throw new Error('invalid:shape')
  return parsed
}

/** Guard against a 200 that isn't actually a summary (wrong endpoint / unrelated JSON). */
function looksLikeSummary(s: DemoServerSummary): boolean {
  return Boolean(
    s.phase ||
      s.health ||
      s.docker ||
      s.project ||
      s.readiness != null ||
      s.progress != null ||
      s.blockers.length ||
      s.nextActions.length ||
      s.system.cpu != null ||
      s.system.ram != null ||
      s.system.disk != null,
  )
}

// --- defensive parsing: top-level fields are known; sub-shapes probed leniently ---

function parseSummary(raw: unknown): DemoServerSummary {
  const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  return {
    project: str(o.project),
    role: str(o.role),
    phase: str(o.phase),
    progress: pct(num(o.progress)),
    health: strOrStatus(o.health),
    readiness: pct(readinessNum(o.readiness)),
    docker: strOrStatus(o.docker),
    system: {
      cpu: deepNum(o.system, ['cpu', 'cpu_percent', 'cpuPercent', 'load']),
      ram: deepNum(o.system, [
        'ram',
        'memory',
        'mem',
        'ram_percent',
        'memPercent',
        'memoryPercent',
      ]),
      disk: deepNum(o.system, ['disk', 'disk_percent', 'diskPercent', 'storage']),
    },
    blockers: toStrArray(o.blockers),
    nextActions: toStrArray(o.nextActions ?? o.next_actions),
  }
}

function str(v: unknown): string | null {
  if (v == null) return null
  return typeof v === 'string' ? v : String(v)
}

function num(v: unknown): number | null {
  if (v == null) return null
  const n = typeof v === 'string' ? Number.parseFloat(v) : Number(v)
  return Number.isFinite(n) ? n : null
}

/** 0..1 ratio → percent; else round as-is. */
function pct(n: number | null): number | null {
  if (n == null) return null
  return n > 0 && n <= 1 ? Math.round(n * 100) : Math.round(n)
}

/** health/docker may be a string or an object like { status: "healthy" }. */
function strOrStatus(v: unknown): string | null {
  if (v == null) return null
  if (typeof v === 'string') return v
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>
    return str(o.status ?? o.state ?? o.health ?? o.value)
  }
  return String(v)
}

function readinessNum(v: unknown): number | null {
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>
    return num(o.percent ?? o.score ?? o.value ?? o.readiness)
  }
  return num(v)
}

function deepNum(obj: unknown, keys: string[]): number | null {
  if (!obj || typeof obj !== 'object') return null
  const o = obj as Record<string, unknown>
  for (const k of keys) {
    const n = num(o[k])
    if (n != null) return n
  }
  return null
}

/** blockers / nextActions may be strings or objects ({ message } / { title }). */
function toStrArray(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v
    .map((item) => {
      if (typeof item === 'string') return item
      if (item && typeof item === 'object') {
        const o = item as Record<string, unknown>
        return str(o.message ?? o.title ?? o.text ?? o.detail ?? o.action) ?? JSON.stringify(item)
      }
      return String(item)
    })
    .filter((s): s is string => Boolean(s))
}
