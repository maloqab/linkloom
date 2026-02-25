import { useMemo } from 'react'
import type { Briefing } from '../lib/types'
import { buildMarkdown, briefingToFilename } from '../lib/markdown'

type Props = {
  briefing: Briefing
}

export default function Preview({ briefing }: Props) {
  const markdown = useMemo(() => buildMarkdown(briefing), [briefing])

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(markdown)
  }

  const download = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = briefingToFilename(briefing.title)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const shareViaUrl = () => {
    const data = JSON.stringify({ t: briefing.title, s: briefing.sources.map(s => ({ u: s.url, t: s.title })), n: briefing.notes.map(n => n.text) })
    const encoded = btoa(unescape(encodeURIComponent(data)))
    const shareUrl = `${window.location.origin}${window.location.pathname}#b=${encoded}`
    navigator.clipboard.writeText(shareUrl)
  }

  return (
    <div className="preview-pane">
      <div className="preview-header">
        <h3>Preview</h3>
        <div className="preview-actions">
          <button type="button" className="btn-sm" onClick={copyToClipboard} title="Copy Markdown">
            Copy
          </button>
          <button type="button" className="btn-sm" onClick={download} title="Download .md file">
            Download
          </button>
          <button type="button" className="btn-sm ghost" onClick={shareViaUrl} title="Copy shareable link">
            Share Link
          </button>
        </div>
      </div>
      <pre className="markdown-preview">{markdown}</pre>
    </div>
  )
}
