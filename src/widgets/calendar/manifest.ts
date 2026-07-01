import type { WidgetManifest } from '../widget'
import { CalendarWidget } from './CalendarWidget'

export const calendarManifest: WidgetManifest = {
  id: 'calendar',
  title: 'Calendar',
  area: 'calendar',
  component: CalendarWidget,
  placeholder: true,
}
