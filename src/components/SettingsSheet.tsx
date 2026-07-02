import { useState } from 'react'
import { useCockpit } from '../app/store'
import { validateToken } from '../lib/github'
import { type RepoRef, parseRepoSlug, repoSlug } from '../types'
import { WIDGETS } from '../widgets/registry'
import styles from './SettingsSheet.module.css'
import { Sheet } from './Sheet'

interface Props {
  open: boolean
  onClose: () => void
}

type TestState = { state: 'idle' | 'testing' | 'ok' | 'err'; msg?: string }

export function SettingsSheet({ open, onClose }: Props) {
  const githubToken = useCockpit((s) => s.githubToken)
  const setGithubToken = useCockpit((s) => s.setGithubToken)
  const pinnedRepos = useCockpit((s) => s.pinnedRepos)
  const setPinnedRepos = useCockpit((s) => s.setPinnedRepos)
  const theme = useCockpit((s) => s.theme)
  const setTheme = useCockpit((s) => s.setTheme)
  const observerUrl = useCockpit((s) => s.observerUrl)
  const setObserverUrl = useCockpit((s) => s.setObserverUrl)
  const demoServerUrl = useCockpit((s) => s.demoServerUrl)
  const setDemoServerUrl = useCockpit((s) => s.setDemoServerUrl)
  const enabledWidgets = useCockpit((s) => s.enabledWidgets)
  const setWidgetEnabled = useCockpit((s) => s.setWidgetEnabled)

  const [tokenInput, setTokenInput] = useState(githubToken ?? '')
  const [reposText, setReposText] = useState(pinnedRepos.map(repoSlug).join('\n'))
  const [observerText, setObserverText] = useState(observerUrl ?? '')
  const [demoServerText, setDemoServerText] = useState(demoServerUrl ?? '')
  const [test, setTest] = useState<TestState>({ state: 'idle' })

  const saveToken = () => {
    setGithubToken(tokenInput.trim() || null)
    setTest({ state: 'idle' })
  }

  const saveRepos = () => {
    const repos = reposText
      .split('\n')
      .map((l) => parseRepoSlug(l))
      .filter((r): r is RepoRef => r !== null)
    setPinnedRepos(repos)
    setReposText(repos.map(repoSlug).join('\n'))
  }

  const saveObserver = () => {
    setObserverUrl(observerText.trim() || null)
  }

  const saveDemoServer = () => {
    setDemoServerUrl(demoServerText.trim() || null)
  }

  const runTest = async () => {
    const t = tokenInput.trim()
    if (!t) return
    setTest({ state: 'testing' })
    try {
      const login = await validateToken(t)
      setGithubToken(t)
      setTest({ state: 'ok', msg: `@${login}` })
    } catch (e) {
      setTest({ state: 'err', msg: e instanceof Error ? e.message : '실패' })
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="설정">
      <p className={styles.intro}>
        이 데모는 설정 없이도 전부 작동해요. 아래는 모두 선택 사항이고, 원하면 내 데이터로 바꿔볼 수
        있어요.
      </p>

      {/* Demo data source */}
      <div className={styles.section}>
        <span className={styles.label}>Demo data endpoint</span>
        <input
          className={styles.input}
          type="url"
          value={observerText}
          onChange={(e) => setObserverText(e.target.value)}
          onBlur={saveObserver}
          placeholder="http://example.local:4000"
          spellCheck={false}
        />
        <span className={styles.hint}>
          Optional demo JSON source. Leave blank to use the bundled mock dashboard data.
        </span>
      </div>

      {/* Demo status-summary endpoint (optional) */}
      <div className={styles.section}>
        <span className={styles.label}>Demo Server summary endpoint</span>
        <input
          className={styles.input}
          type="url"
          value={demoServerText}
          onChange={(e) => setDemoServerText(e.target.value)}
          onBlur={saveDemoServer}
          placeholder="http://example.local:8080"
          spellCheck={false}
        />
        <span className={styles.hint}>
          Optional demo status endpoint. Leave blank to keep System Map in demo mode.
        </span>
      </div>

      {/* GitHub */}
      <div className={styles.section}>
        <span className={styles.label}>GitHub integration (demo optional)</span>
        <input
          className={styles.input}
          type="password"
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          onBlur={saveToken}
          placeholder="demo token not required"
          autoComplete="off"
          spellCheck={false}
        />
        <div className={styles.row}>
          <button
            type="button"
            className={styles.btn}
            onClick={runTest}
            disabled={!tokenInput.trim() || test.state === 'testing'}
          >
            {test.state === 'testing' ? '확인 중…' : '연결 테스트'}
          </button>
          {test.state === 'ok' && <span className={styles.ok}>✓ {test.msg}</span>}
          {test.state === 'err' && <span className={styles.err}>✗ {test.msg}</span>}
        </div>
        <span className={styles.hint}>
          Optional. The demo works without connecting a GitHub account.
        </span>
      </div>

      {/* Pinned repos */}
      <div className={styles.section}>
        <span className={styles.label}>주요 레포 (한 줄에 owner/name)</span>
        <textarea
          className={styles.textarea}
          value={reposText}
          onChange={(e) => setReposText(e.target.value)}
          onBlur={saveRepos}
          placeholder={'owner/repo\nanother/repo'}
          spellCheck={false}
        />
        {pinnedRepos.length > 0 && (
          <div className={styles.chips}>
            {pinnedRepos.map((r) => (
              <span key={repoSlug(r)} className={styles.repoChip}>
                {repoSlug(r)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Widget board */}
      <div className={styles.section}>
        <span className={styles.label}>위젯 보드</span>
        <div className={styles.widgetList}>
          {WIDGETS.map((widget) => (
            <label key={widget.id} className={styles.toggleRow}>
              <input
                type="checkbox"
                checked={enabledWidgets.includes(widget.id)}
                onChange={(e) => setWidgetEnabled(widget.id, e.target.checked)}
              />
              <span>
                <strong>{widget.title}</strong>
                <small>{widget.area}</small>
              </span>
            </label>
          ))}
        </div>
        <span className={styles.hint}>
          켠 위젯은 보드 페이지에 배치됩니다. 좌우 스와이프로 다른 페이지를 봅니다.
        </span>
      </div>

      {/* Theme */}
      <div className={styles.section}>
        <span className={styles.label}>테마</span>
        <div className={styles.themeRow}>
          <button
            type="button"
            className={
              theme === 'dark' ? `${styles.themeBtn} ${styles.themeBtnActive}` : styles.themeBtn
            }
            onClick={() => setTheme('dark')}
          >
            다크
          </button>
          <button
            type="button"
            className={
              theme === 'contrast' ? `${styles.themeBtn} ${styles.themeBtnActive}` : styles.themeBtn
            }
            onClick={() => setTheme('contrast')}
          >
            고대비
          </button>
        </div>
      </div>
    </Sheet>
  )
}
