import { useCallback, useEffect, useReducer } from 'react'
import SmartInput from './components/SmartInput'
import SourceCard from './components/SourceCard'
import NoteCard from './components/NoteCard'
import Preview from './components/Preview'
import Sidebar from './components/Sidebar'
import { loadState, saveState, createBriefing } from './lib/storage'
import { parseInput } from './lib/parser'
import type { AppState, Briefing, Source, Note } from './lib/types'
import './App.css'

type Action =
  | { type: 'SELECT_BRIEFING'; id: string }
  | { type: 'CREATE_BRIEFING' }
  | { type: 'DELETE_BRIEFING'; id: string }
  | { type: 'SET_TITLE'; title: string }
  | { type: 'ADD_ITEMS'; sources: Source[]; notes: Note[] }
  | { type: 'UPDATE_SOURCE'; id: string; changes: Partial<Source> }
  | { type: 'DELETE_SOURCE'; id: string }
  | { type: 'UPDATE_NOTE'; id: string; text: string }
  | { type: 'DELETE_NOTE'; id: string }
  | { type: 'CLEAR_BRIEFING' }
  | { type: 'IMPORT_SHARED'; briefing: Briefing }

function updateActive(state: AppState, fn: (b: Briefing) => Briefing): AppState {
  return {
    ...state,
    briefings: state.briefings.map(b =>
      b.id === state.activeBriefingId
        ? { ...fn(b), updatedAt: new Date().toISOString() }
        : b
    ),
  }
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SELECT_BRIEFING':
      return { ...state, activeBriefingId: action.id }

    case 'CREATE_BRIEFING': {
      const b = createBriefing()
      return { briefings: [...state.briefings, b], activeBriefingId: b.id }
    }

    case 'DELETE_BRIEFING': {
      const remaining = state.briefings.filter(b => b.id !== action.id)
      return {
        briefings: remaining,
        activeBriefingId:
          state.activeBriefingId === action.id
            ? (remaining[0]?.id ?? null)
            : state.activeBriefingId,
      }
    }

    case 'SET_TITLE':
      return updateActive(state, b => ({ ...b, title: action.title }))

    case 'ADD_ITEMS':
      return updateActive(state, b => ({
        ...b,
        sources: [...b.sources, ...action.sources],
        notes: [...b.notes, ...action.notes],
      }))

    case 'UPDATE_SOURCE':
      return updateActive(state, b => ({
        ...b,
        sources: b.sources.map(s => s.id === action.id ? { ...s, ...action.changes } : s),
      }))

    case 'DELETE_SOURCE':
      return updateActive(state, b => ({
        ...b,
        sources: b.sources.filter(s => s.id !== action.id),
      }))

    case 'UPDATE_NOTE':
      return updateActive(state, b => ({
        ...b,
        notes: b.notes.map(n => n.id === action.id ? { ...n, text: action.text } : n),
      }))

    case 'DELETE_NOTE':
      return updateActive(state, b => ({
        ...b,
        notes: b.notes.filter(n => n.id !== action.id),
      }))

    case 'CLEAR_BRIEFING':
      return updateActive(state, b => ({ ...b, sources: [], notes: [] }))

    case 'IMPORT_SHARED': {
      const exists = state.briefings.find(b => b.id === action.briefing.id)
      if (exists) return { ...state, activeBriefingId: exists.id }
      return {
        briefings: [...state.briefings, action.briefing],
        activeBriefingId: action.briefing.id,
      }
    }

    default:
      return state
  }
}

function loadSharedBriefing(): Briefing | null {
  const hash = window.location.hash
  if (!hash.startsWith('#b=')) return null
  try {
    const decoded = decodeURIComponent(escape(atob(hash.slice(3))))
    const data = JSON.parse(decoded) as { t: string; s: { u: string; t: string }[]; n: string[] }
    const now = new Date().toISOString()
    const briefing: Briefing = {
      id: crypto.randomUUID(),
      title: data.t,
      sources: data.s.map(s => {
        let domain = ''
        try { domain = new URL(s.u).hostname.replace(/^www\./, '') } catch { /* noop */ }
        return { id: crypto.randomUUID(), url: s.u, title: s.t, domain, isValid: !!domain }
      }),
      notes: data.n.map(text => ({ id: crypto.randomUUID(), text })),
      createdAt: now,
      updatedAt: now,
    }
    window.history.replaceState(null, '', window.location.pathname)
    return briefing
  } catch {
    return null
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, null, () => {
    const saved = loadState()
    const shared = loadSharedBriefing()
    if (shared) return reducer(saved, { type: 'IMPORT_SHARED', briefing: shared })
    if (saved.briefings.length === 0) {
      const first = createBriefing('My First Briefing')
      return { briefings: [first], activeBriefingId: first.id }
    }
    return saved.activeBriefingId ? saved : { ...saved, activeBriefingId: saved.briefings[0].id }
  })

  useEffect(() => { saveState(state) }, [state])

  const active = state.briefings.find(b => b.id === state.activeBriefingId) ?? null

  const handleAdd = useCallback((sources: Source[], notes: Note[]) => {
    dispatch({ type: 'ADD_ITEMS', sources, notes })
  }, [])

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    for (const file of files) {
      if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
        file.text().then(text => {
          const { sources, notes } = parseInput(text)
          dispatch({ type: 'ADD_ITEMS', sources, notes })
        })
      }
    }
  }, [])

  return (
    <div className="app" onDragOver={e => e.preventDefault()} onDrop={handleFileDrop}>
      <Sidebar
        briefings={state.briefings}
        activeId={state.activeBriefingId}
        onSelect={id => dispatch({ type: 'SELECT_BRIEFING', id })}
        onCreate={() => dispatch({ type: 'CREATE_BRIEFING' })}
        onDelete={id => dispatch({ type: 'DELETE_BRIEFING', id })}
      />

      <main className="main">
        {active ? (
          <>
            <header className="main-header">
              <input
                className="title-input"
                value={active.title}
                onChange={e => dispatch({ type: 'SET_TITLE', title: e.target.value })}
                placeholder="Briefing title..."
              />
              <div className="header-meta">
                {active.sources.length} source{active.sources.length !== 1 ? 's' : ''} &middot;{' '}
                {active.notes.length} note{active.notes.length !== 1 ? 's' : ''}
              </div>
            </header>

            <SmartInput onAdd={handleAdd} />

            <div className="content-grid">
              <section className="items-section">
                {active.sources.length > 0 && (
                  <div className="item-group">
                    <h3>Sources</h3>
                    {active.sources.map(s => (
                      <SourceCard
                        key={s.id}
                        source={s}
                        onUpdate={(id, changes) => dispatch({ type: 'UPDATE_SOURCE', id, changes })}
                        onDelete={id => dispatch({ type: 'DELETE_SOURCE', id })}
                      />
                    ))}
                  </div>
                )}

                {active.notes.length > 0 && (
                  <div className="item-group">
                    <h3>Notes</h3>
                    {active.notes.map(n => (
                      <NoteCard
                        key={n.id}
                        note={n}
                        onUpdate={(id, text) => dispatch({ type: 'UPDATE_NOTE', id, text })}
                        onDelete={id => dispatch({ type: 'DELETE_NOTE', id })}
                      />
                    ))}
                  </div>
                )}

                {active.sources.length === 0 && active.notes.length === 0 && (
                  <div className="empty-state">
                    <p>Paste URLs and notes above, or drop files anywhere on this page.</p>
                    <p className="empty-hint">URLs are auto-detected. Everything else becomes a note.</p>
                  </div>
                )}

                {(active.sources.length > 0 || active.notes.length > 0) && (
                  <button
                    type="button"
                    className="btn-sm ghost clear-btn"
                    onClick={() => dispatch({ type: 'CLEAR_BRIEFING' })}
                  >
                    Clear all items
                  </button>
                )}
              </section>

              <Preview briefing={active} />
            </div>
          </>
        ) : (
          <div className="empty-state">
            <p>Create a briefing to get started.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
