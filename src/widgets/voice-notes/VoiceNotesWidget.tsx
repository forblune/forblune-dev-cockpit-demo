import { useState } from 'react'
import { useCockpit } from '../../app/store'
import { WidgetFrame } from '../../components/WidgetFrame'
import { relativeTime } from '../../lib/time'
import { useNow } from '../../lib/useNow'
import styles from './VoiceNotesWidget.module.css'

export function VoiceNotesWidget() {
  const notes = useCockpit((s) => s.voiceNotes)
  const addVoiceNote = useCockpit((s) => s.addVoiceNote)
  const deleteVoiceNote = useCockpit((s) => s.deleteVoiceNote)
  const [draft, setDraft] = useState('')

  const save = () => {
    const text = draft.trim()
    if (!text) return
    addVoiceNote(text)
    setDraft('')
  }

  return (
    <WidgetFrame title="음성 메모" caption="아이패드 받아쓰기로 빠른 메모">
      <div className={styles.wrap}>
        <div className={styles.controls}>
          <textarea
            className={styles.input}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="iPad 키보드의 마이크 받아쓰기로 입력"
          />
          <button type="button" className={styles.save} onClick={save} disabled={!draft.trim()}>
            저장
          </button>
        </div>
        <div className={styles.notes}>
          {notes.length === 0 ? (
            <div className={styles.empty}>저장된 메모 없음</div>
          ) : (
            notes.map((note) => (
              <VoiceNoteRow key={note.id} note={note} onDelete={() => deleteVoiceNote(note.id)} />
            ))
          )}
        </div>
      </div>
    </WidgetFrame>
  )
}

function VoiceNoteRow({
  note,
  onDelete,
}: {
  note: { text: string; createdAt: number }
  onDelete: () => void
}) {
  const now = useNow(30_000)
  return (
    <article className={styles.note}>
      <div className={styles.noteText}>{note.text}</div>
      <div className={styles.noteMeta}>
        <span>{relativeTime(note.createdAt, now)}</span>
        <button type="button" onClick={onDelete}>
          삭제
        </button>
      </div>
    </article>
  )
}
