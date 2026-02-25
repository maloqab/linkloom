import { useState } from 'react'
import type { Note } from '../lib/types'

type Props = {
  note: Note
  onUpdate: (id: string, text: string) => void
  onDelete: (id: string) => void
}

export default function NoteCard({ note, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(note.text)

  const save = () => {
    const trimmed = text.trim()
    if (!trimmed) { onDelete(note.id); return }
    onUpdate(note.id, trimmed)
    setEditing(false)
  }

  return (
    <div className="card note-card">
      <div className="card-icon">
        <span className="icon-note">&para;</span>
      </div>
      <div className="card-body">
        {editing ? (
          <textarea
            className="note-edit"
            value={text}
            onChange={e => setText(e.target.value)}
            onBlur={save}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); save() }; if (e.key === 'Escape') { setText(note.text); setEditing(false) } }}
            autoFocus
            rows={2}
          />
        ) : (
          <span className="card-text" onClick={() => setEditing(true)} title="Click to edit">
            {note.text}
          </span>
        )}
      </div>
      <button className="card-delete" onClick={() => onDelete(note.id)} title="Remove">
        &times;
      </button>
    </div>
  )
}
