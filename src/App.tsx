import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type BriefItem = {
  id: string
  text: string
}

type BriefState = {
  urlsRaw: string
  notes: string
  title: string
  updatedAt: string
}

const STORAGE_KEY = 'linkloom:v1'

function extractUrlItems(urlsRaw: string): BriefItem[] {
  const lines = urlsRaw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  return lines.map((text, index) => ({ id: `url-${index + 1}`, text }))
}

function extractNoteItems(notesRaw: string): BriefItem[] {
  return notesRaw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((text, index) => ({ id: `note-${index + 1}`, text }))
}

function normalizeTitle(urlsRaw: string, notes: string): string {
  const firstUrl = urlsRaw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean)

  if (firstUrl) {
    try {
      const host = new URL(firstUrl).hostname.replace(/^www\./, '')
      return `Briefing • ${host}`
    } catch {
      return 'LinkLoom Brief'
    }
  }

  if (notes.trim().length > 0) return 'LinkLoom Notes Brief'
  return 'Untitled Brief'
}

function buildMarkdown(title: string, urls: BriefItem[], notes: BriefItem[], updatedAt: string): string {
  const sections = [
    `# ${title}`,
    '',
    `Last updated: ${updatedAt}`,
    '',
    '## Sources',
    ...(urls.length ? urls.map((item) => `- ${item.text}`) : ['- _No URLs added_']),
    '',
    '## Notes',
    ...(notes.length ? notes.map((item) => `- ${item.text}`) : ['- _No notes added_']),
    '',
  ]

  return sections.join('\n')
}

function downloadMarkdown(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

function App() {
  const [urlsRaw, setUrlsRaw] = useState('')
  const [notes, setNotes] = useState('')
  const [updatedAt, setUpdatedAt] = useState(new Date().toLocaleString())

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return

    try {
      const parsed = JSON.parse(stored) as BriefState
      setUrlsRaw(parsed.urlsRaw ?? '')
      setNotes(parsed.notes ?? '')
      setUpdatedAt(parsed.updatedAt ?? new Date().toLocaleString())
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    const nextState: BriefState = {
      urlsRaw,
      notes,
      title: normalizeTitle(urlsRaw, notes),
      updatedAt: new Date().toLocaleString(),
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState))
    setUpdatedAt(nextState.updatedAt)
  }, [urlsRaw, notes])

  const title = useMemo(() => normalizeTitle(urlsRaw, notes), [urlsRaw, notes])
  const urlItems = useMemo(() => extractUrlItems(urlsRaw), [urlsRaw])
  const noteItems = useMemo(() => extractNoteItems(notes), [notes])
  const markdown = useMemo(() => buildMarkdown(title, urlItems, noteItems, updatedAt), [noteItems, title, updatedAt, urlItems])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  const handleClear = () => {
    setUrlsRaw('')
    setNotes('')
    localStorage.removeItem(STORAGE_KEY)
    setUpdatedAt(new Date().toLocaleString())
  }

  const exportFilename = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'linkloom-brief'}.md`

  return (
    <main className="app-shell">
      <header className="hero">
        <h1>LinkLoom</h1>
        <p>Turn scattered links and notes into one clean briefing page.</p>
      </header>

      <section className="layout-grid">
        <form className="panel panel-input" onSubmit={handleSubmit}>
          <h2>Input</h2>
          <label>
            URLs (one per line)
            <textarea
              value={urlsRaw}
              onChange={(event) => setUrlsRaw(event.target.value)}
              placeholder="https://example.com/article\nhttps://news.site/story"
              rows={8}
            />
          </label>

          <label>
            Notes
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Paste raw notes, bullets, fragments..."
              rows={8}
            />
          </label>

          <div className="actions">
            <button type="button" className="ghost" onClick={handleClear}>
              Clear
            </button>
            <button type="button" onClick={() => downloadMarkdown(exportFilename, markdown)}>
              Export Markdown
            </button>
          </div>
        </form>

        <article className="panel panel-brief">
          <div className="brief-header">
            <h2>{title}</h2>
            <span>Updated: {updatedAt}</span>
          </div>

          <section>
            <h3>Sources</h3>
            {urlItems.length ? (
              <ul>
                {urlItems.map((item) => (
                  <li key={item.id}>
                    {item.text.startsWith('http') ? (
                      <a href={item.text} target="_blank" rel="noreferrer">
                        {item.text}
                      </a>
                    ) : (
                      item.text
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty">No URLs yet.</p>
            )}
          </section>

          <section>
            <h3>Notes</h3>
            {noteItems.length ? (
              <ul>
                {noteItems.map((item) => (
                  <li key={item.id}>{item.text}</li>
                ))}
              </ul>
            ) : (
              <p className="empty">No notes yet.</p>
            )}
          </section>
        </article>
      </section>
    </main>
  )
}

export default App
