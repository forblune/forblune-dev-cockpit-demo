import type { WidgetManifest } from '../widget'
import { WorkflowPipelineWidget } from './WorkflowPipelineWidget'

export const workflowPipelineManifest: WidgetManifest = {
  id: 'workflow-pipeline',
  title: 'Workflow Pipeline',
  area: 'pipeline',
  component: WorkflowPipelineWidget,
}
