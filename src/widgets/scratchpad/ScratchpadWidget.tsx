import { type ReactNode, useEffect, useRef, useState } from 'react'
import Markdown from 'react-markdown'
import { useCockpit } from '../../app/store'
import { Sheet } from '../../components/Sheet'
import { WidgetFrame } from '../../components/WidgetFrame'
import styles from './ScratchpadWidget.module.css'

/**
 * A persisted markdown note. The widget body is a read-only rendered preview;
 * editing happens in a bottom sheet whose textarea writes straight to the store,
 * so every keystroke is auto-saved to localStorage and restored on restart.
 *
 * Markdown is rendered with react-markdown (no raw-HTML injection) — important
 * because the GitHub PAT also lives in localStorage, so an HTML sink here would be
 * a token-exfiltration XSS vector.
 */
export function ScratchpadWidget() {
  const text = useCockpit((s) => s.scratchpad)
  const setText = useCockpit((s) => s.setScratchpad)
  const [editing, setEditing] = useState(false)
  const editorRef = useRef<HTMLTextAreaElement>(null)

  // Move focus into the editor when the sheet opens (modal-standard, avoids autoFocus).
  useEffect(() => {
    if (editing) editorRef.current?.focus()
  }, [editing])

  const hasContent = text.trim().length > 0

  return (
    <WidgetFrame
      title="Scratchpad"
      headerExtra={
        <button type="button" className={styles.editBtn} onClick={() => setEditing(true)}>
          편집
        </button>
      }
    >
      {hasContent ? (
        <div className={styles.preview}>
          <Markdown components={{ a: MdLink }}>{text}</Markdown>
        </div>
      ) : (
        <button type="button" className={styles.empty} onClick={() => setEditing(true)}>
          탭하여 메모를 작성하세요
        </button>
      )}

      <Sheet open={editing} onClose={() => setEditing(false)} title="Scratchpad" side="bottom">
        <div className={styles.editor}>
          <span className={styles.hint}>마크다운 지원 · 입력 즉시 자동 저장</span>
          <textarea
            ref={editorRef}
            className={styles.textarea}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={'# 할 일\n- [ ] ...\n\n**메모**를 자유롭게'}
            spellCheck={false}
          />
        </div>
      </Sheet>
    </WidgetFrame>
  )
}

/** Render markdown links as new-tab, no-referrer anchors (consistent with PR rows). */
function MdLink({ href, children }: { href?: string; children?: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  )
}
