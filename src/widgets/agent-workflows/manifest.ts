import type { WidgetManifest } from '../widget'
import { AgentWorkflowsWidget } from './AgentWorkflowsWidget'

export const agentWorkflowsManifest: WidgetManifest = {
  id: 'agent-workflows',
  title: 'Agent Workflows',
  area: 'workflows',
  component: AgentWorkflowsWidget,
}
