import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PomodoroPhase, RepoRef, ThemeName, VoiceNote } from '../types'
import { DEFAULT_WIDGET_IDS, type WidgetId } from '../widgets/widget'

export interface PomodoroSettings {
  focusMin: number
  breakMin: number
}

/** Runtime timer state — persisted so it survives a reload / silent refresh. */
export interface TimerState {
  phase: PomodoroPhase
  /** epoch ms when the current phase ends; remaining = endsAt - Date.now() (drift-free) */
  endsAt: number | null
  /** remaining ms captured at the moment of pause; null while running or idle */
  pausedRemainingMs: number | null
  /** the current focus label */
  task: string
}

interface CockpitState {
  version: number

  // --- GitHub (PAT lives here, sent only to api.github.com) ---
  githubToken: string | null
  pinnedRepos: RepoRef[]

  // --- Calendar (interface ready now; ICS fetch lands in Phase 1) ---
  calendarIcsUrl: string | null

  // --- settings ---
  pomodoro: PomodoroSettings
  theme: ThemeName
  observerUrl: string | null
  /** Demo Server /demo/status endpoint — client-side adapter; empty = not connected. */
  demoServerUrl: string | null
  enabledWidgets: WidgetId[]

  // --- timer runtime ---
  timer: TimerState

  // --- scratchpad (markdown note; persisted, restored on restart) ---
  scratchpad: string
  voiceNotes: VoiceNote[]

  // --- actions ---
  setGithubToken: (t: string | null) => void
  setPinnedRepos: (r: RepoRef[]) => void
  setCalendarIcsUrl: (u: string | null) => void
  setPomodoro: (p: Partial<PomodoroSettings>) => void
  setTheme: (t: ThemeName) => void
  setObserverUrl: (u: string | null) => void
  setDemoServerUrl: (u: string | null) => void
  setWidgetEnabled: (id: WidgetId, enabled: boolean) => void
  setTimer: (t: Partial<TimerState>) => void
  setScratchpad: (s: string) => void
  addVoiceNote: (text: string) => void
  deleteVoiceNote: (id: string) => void
  clearVoiceNotes: () => void
}

const DEFAULT_TIMER: TimerState = {
  phase: 'idle',
  endsAt: null,
  pausedRemainingMs: null,
  task: '',
}

const ALL_WIDGET_IDS: WidgetId[] = [
  'runtime-map',
  'agent-workflows',
  'usage',
  'next-action',
  'workflow-pipeline',
  'infra-board',
  'voice-notes',
  'current-mission',
  'attention-radar',
  'env-checklist',
]

function mergeDefaultWidgets(current: unknown): WidgetId[] {
  const valid = Array.isArray(current)
    ? current.filter((id): id is WidgetId => ALL_WIDGET_IDS.includes(id))
    : []
  return Array.from(new Set([...valid, ...DEFAULT_WIDGET_IDS]))
}

/**
 * The single source of local truth (React Query owns server cache).
 * Persisted to localStorage; clearing site data fully resets the cockpit.
 */
export const useCockpit = create<CockpitState>()(
  persist(
    (set) => ({
      version: 1,
      githubToken: null,
      pinnedRepos: [],
      calendarIcsUrl: null,
      pomodoro: { focusMin: 25, breakMin: 5 },
      theme: 'dark',
      observerUrl: null,
      demoServerUrl: null,
      enabledWidgets: DEFAULT_WIDGET_IDS,
      timer: DEFAULT_TIMER,
      scratchpad: '',
      voiceNotes: [],

      setGithubToken: (t) => set({ githubToken: t }),
      setPinnedRepos: (r) => set({ pinnedRepos: r }),
      setCalendarIcsUrl: (u) => set({ calendarIcsUrl: u }),
      setPomodoro: (p) => set((s) => ({ pomodoro: { ...s.pomodoro, ...p } })),
      setTheme: (t) => set({ theme: t }),
      setObserverUrl: (u) => set({ observerUrl: u }),
      setDemoServerUrl: (u) => set({ demoServerUrl: u }),
      setWidgetEnabled: (id, enabled) =>
        set((s) => {
          const ids = new Set(s.enabledWidgets)
          if (enabled) ids.add(id)
          else if (ids.size > 1) ids.delete(id)
          return { enabledWidgets: Array.from(ids) }
        }),
      setTimer: (t) => set((s) => ({ timer: { ...s.timer, ...t } })),
      setScratchpad: (s) => set({ scratchpad: s }),
      addVoiceNote: (text) =>
        set((s) => ({
          voiceNotes: [
            {
              id: crypto.randomUUID(),
              text,
              createdAt: Date.now(),
            },
            ...s.voiceNotes,
          ].slice(0, 20),
        })),
      deleteVoiceNote: (id) =>
        set((s) => ({ voiceNotes: s.voiceNotes.filter((n) => n.id !== id) })),
      clearVoiceNotes: () => set({ voiceNotes: [] }),
    }),
    {
      name: 'forblune.cockpit.v1',
      version: 3,
      migrate: (persisted) => {
        const state = persisted as Partial<CockpitState>
        return {
          ...state,
          enabledWidgets: mergeDefaultWidgets(state.enabledWidgets),
          voiceNotes: state.voiceNotes ?? [],
        }
      },
    },
  ),
)
