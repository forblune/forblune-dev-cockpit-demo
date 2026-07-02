import { useCockpit } from '../app/store'
import { WIDGETS, WIDGET_PAGES } from '../widgets/registry'
import { DEFAULT_WIDGET_IDS } from '../widgets/widget'
import { AgentWorkflow } from './AgentWorkflow'
import styles from './CockpitGrid.module.css'
import type { TabId } from './TabBar'

/**
 * Tab-driven board (Phase 2-2a). Renders only the widgets of the page whose id matches
 * the active tab — no swipe / dots. A tab with no page (Settings) or no enabled widgets
 * shows a small placeholder. Widget contract (id · component · grid area) unchanged;
 * no store/persist change.
 */
export function CockpitGrid({ activeTab }: { activeTab: TabId }) {
  const enabledWidgets = useCockpit((s) => s.enabledWidgets)
  const activeIds = new Set(enabledWidgets.length > 0 ? enabledWidgets : DEFAULT_WIDGET_IDS)
  const widgetsById = new Map(WIDGETS.map((widget) => [widget.id, widget]))

  const page = WIDGET_PAGES.find((p) => p.id === activeTab)
  const widgets = page
    ? page.widgetIds
        .filter((id) => activeIds.has(id))
        .map((id) => widgetsById.get(id))
        .filter((widget) => widget !== undefined)
    : []
  const showWorkflowBand = activeTab === 'workflow'

  if (!page || widgets.length === 0) {
    return (
      <div className={styles.board}>
        {showWorkflowBand && <AgentWorkflow />}
        <div className={styles.placeholder}>
          {activeTab === 'settings'
            ? '설정은 우하단 ⚙ 버튼에서 확인할 수 있어요.'
            : 'No widgets in this tab'}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.board}>
      {showWorkflowBand && <AgentWorkflow />}
      <section
        className={`${styles.page} ${styles[page.id]}`}
        style={
          widgets.length === 1
            ? {
                gridTemplateAreas: `"${widgets[0].area}"`,
                gridTemplateColumns: 'minmax(0, 1fr)',
                gridTemplateRows: 'minmax(0, 1fr)',
              }
            : undefined
        }
      >
        {widgets.map((w) => {
          const Component = w.component
          return (
            <div key={w.id} className={styles.cell} style={{ gridArea: w.area }}>
              <Component />
            </div>
          )
        })}
      </section>
    </div>
  )
}
