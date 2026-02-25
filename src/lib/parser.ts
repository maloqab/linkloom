import type { Source, Note } from './types'

const URL_PATTERN = /^https?:\/\//i

export function parseInput(raw: string): { sources: Source[]; notes: Note[] } {
  const sources: Source[] = []
  const notes: Note[] = []

  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean)

  for (const line of lines) {
    if (URL_PATTERN.test(line)) {
      try {
        const parsed = new URL(line)
        const domain = parsed.hostname.replace(/^www\./, '')
        sources.push({
          id: crypto.randomUUID(),
          url: parsed.toString(),
          title: domain,
          domain,
          isValid: true,
        })
      } catch {
        sources.push({
          id: crypto.randomUUID(),
          url: line,
          title: line,
          domain: '',
          isValid: false,
        })
      }
    } else {
      notes.push({ id: crypto.randomUUID(), text: line })
    }
  }

  return { sources, notes }
}

export function tryParseUrl(text: string): Source | null {
  if (!URL_PATTERN.test(text)) return null
  try {
    const parsed = new URL(text)
    const domain = parsed.hostname.replace(/^www\./, '')
    return {
      id: crypto.randomUUID(),
      url: parsed.toString(),
      title: domain,
      domain,
      isValid: true,
    }
  } catch {
    return null
  }
}
