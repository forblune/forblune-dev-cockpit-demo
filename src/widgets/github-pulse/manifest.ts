import type { WidgetManifest } from '../widget'
import { GitHubPulseWidget } from './GitHubPulseWidget'

export const githubPulseManifest: WidgetManifest = {
  id: 'github-pulse',
  title: 'GitHub Pulse',
  area: 'pulse',
  component: GitHubPulseWidget,
}
