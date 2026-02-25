import { useRef, useState } from 'react'
import { parseInput, tryParseUrl } from '../lib/parser'
import type { Source, Note } from '../lib/types'

type Props = {
  onAdd: (sources: Source[], notes: Note[]) => void
}

export default function SmartInput({ onAdd }: Props) {
  const [value, setValue] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const submit = () => {
    if (!value.trim()) return
    const { sources, notes } = parseInput(value)
    onAdd(sources, notes)
    setValue('')
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      submit()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text/plain')
    // If pasting a single URL, add it immediately
    const source = tryParseUrl(text.trim())
    if (source && !value.trim()) {
      e.preventDefault()
      onAdd([source], [])
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    // Handle dropped files
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      for (const file of files) {
        if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
          file.text().then(text => {
            const { sources, notes } = parseInput(text)
            onAdd(sources, notes)
          })
        }
      }
      return
    }

    // Handle dropped text/URLs
    const text = e.dataTransfer.getData('text/plain')
    if (text) {
      const { sources, notes } = parseInput(text)
      onAdd(sources, notes)
    }
  }

  return (
    <div
      className={`smart-input ${dragOver ? 'drag-over' : ''}`}
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder="Paste URLs, notes, or drop files here. URLs are auto-detected.&#10;&#10;Press Cmd+Enter to add."
        rows={5}
      />
      <div className="input-actions">
        <span className="hint">URLs auto-detected &middot; Drop .txt/.md files</span>
        <button type="button" onClick={submit} disabled={!value.trim()}>
          Add to Briefing
        </button>
      </div>
    </div>
  )
}
