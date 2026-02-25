import type { Briefing } from '../lib/types'

type Props = {
  briefings: Briefing[]
  activeId: string | null
  onSelect: (id: string) => void
  onCreate: () => void
  onDelete: (id: string) => void
}

export default function Sidebar({ briefings, activeId, onSelect, onCreate, onDelete }: Props) {
  const sorted = [...briefings].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Briefings</h2>
        <button type="button" className="btn-sm" onClick={onCreate}>+ New</button>
      </div>
      <ul className="briefing-list">
        {sorted.map(b => (
          <li
            key={b.id}
            className={`briefing-item ${b.id === activeId ? 'active' : ''}`}
            onClick={() => onSelect(b.id)}
          >
            <div className="briefing-item-title">{b.title || 'Untitled'}</div>
            <div className="briefing-item-meta">
              {b.sources.length} source{b.sources.length !== 1 ? 's' : ''} &middot; {b.notes.length} note{b.notes.length !== 1 ? 's' : ''}
            </div>
            <button
              className="briefing-item-delete"
              onClick={e => { e.stopPropagation(); onDelete(b.id) }}
              title="Delete briefing"
            >
              &times;
            </button>
          </li>
        ))}
        {briefings.length === 0 && (
          <li className="briefing-empty">No briefings yet. Create one to start.</li>
        )}
      </ul>
    </aside>
  )
}
