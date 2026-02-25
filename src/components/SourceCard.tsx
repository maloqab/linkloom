import { useState } from 'react'
import type { Source } from '../lib/types'

type Props = {
  source: Source
  onUpdate: (id: string, changes: Partial<Source>) => void
  onDelete: (id: string) => void
}

export default function SourceCard({ source, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(source.title)

  const save = () => {
    onUpdate(source.id, { title: title.trim() || source.domain })
    setEditing(false)
  }

  return (
    <div className={`card source-card ${source.isValid ? '' : 'invalid'}`}>
      <div className="card-icon">
        {source.isValid
          ? <img src={`https://www.google.com/s2/favicons?sz=32&domain=${source.domain}`} alt="" width={16} height={16} />
          : <span className="icon-warn">!</span>
        }
      </div>
      <div className="card-body">
        {editing ? (
          <input
            className="title-edit"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={save}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setTitle(source.title); setEditing(false) } }}
            autoFocus
          />
        ) : (
          <span className="card-title" onClick={() => setEditing(true)} title="Click to edit title">
            {source.title}
          </span>
        )}
        <a className="card-url" href={source.url} target="_blank" rel="noreferrer">
          {source.isValid ? source.domain : source.url}
        </a>
      </div>
      <button className="card-delete" onClick={() => onDelete(source.id)} title="Remove">
        &times;
      </button>
    </div>
  )
}
