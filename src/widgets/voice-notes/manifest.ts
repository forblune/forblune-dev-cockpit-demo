import type { WidgetManifest } from '../widget'
import { VoiceNotesWidget } from './VoiceNotesWidget'

export const voiceNotesManifest: WidgetManifest = {
  id: 'voice-notes',
  title: 'Voice Notes',
  area: 'voice',
  component: VoiceNotesWidget,
}
