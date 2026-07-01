/**
 * Calendar interface — finalized now so Phase 1 activation is a drop-in.
 * Phase 1 implements the ICS fetch/parse in useCalendarPeek; nothing here changes.
 */
export interface CalendarEvent {
  id: string
  title: string
  start: number // epoch ms
  end: number // epoch ms
  location?: string
  allDay?: boolean
}

export interface CalendarPeek {
  /** the next upcoming event, or null when none */
  next: CalendarEvent | null
  /** the next few events (including `next`) */
  upcoming: CalendarEvent[]
}
