import { useQuery } from '@tanstack/react-query'
import { useCockpit } from '../../app/store'
import { toReading } from '../../lib/reading'
import { useOnline } from '../../system/useOnline'
import type { InstrumentReading } from '../widget'
import type { CalendarPeek } from './calendar.types'

const REFETCH_MS = 5 * 60_000

export interface CalendarState {
  reading: InstrumentReading<CalendarPeek>
  /** whether an ICS URL is configured (drives the placeholder → live swap in Phase 1) */
  configured: boolean
}

/**
 * Phase 1 lands ICS support by implementing `queryFn` below (fetch the ICS URL, parse
 * VEVENTs, return { next, upcoming }). The query key, reading shape, cadence, and the
 * `configured` flag are all final — the Calendar widget activates the moment this resolves
 * real data and an ICS URL is set in Settings. No other file needs to change.
 */
export function useCalendarPeek(): CalendarState {
  const icsUrl = useCockpit((s) => s.calendarIcsUrl)
  const online = useOnline()
  const configured = Boolean(icsUrl)

  const query = useQuery({
    queryKey: ['calendar-peek', icsUrl],
    enabled: configured, // disabled until an ICS URL exists (Phase 1)
    refetchInterval: REFETCH_MS,
    queryFn: async (): Promise<CalendarPeek> => {
      // TODO(Phase 1): fetch `icsUrl`, parse VEVENTs, sort by start, return next + upcoming.
      throw new Error('ICS 연동은 Phase 1에서 추가됩니다')
    },
  })

  return { reading: toReading(query, online), configured }
}
