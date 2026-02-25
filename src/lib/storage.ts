import type { AppState, Briefing } from './types'

const STORAGE_KEY = 'linkloom:v2'

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { briefings: [], activeBriefingId: null }
    return JSON.parse(raw) as AppState
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return { briefings: [], activeBriefingId: null }
  }
}

export function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function createBriefing(title = 'Untitled Briefing'): Briefing {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    title,
    sources: [],
    notes: [],
    createdAt: now,
    updatedAt: now,
  }
}
