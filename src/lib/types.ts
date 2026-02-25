export type Source = {
  id: string
  url: string
  title: string
  domain: string
  isValid: boolean
}

export type Note = {
  id: string
  text: string
}

export type Briefing = {
  id: string
  title: string
  sources: Source[]
  notes: Note[]
  createdAt: string
  updatedAt: string
}

export type AppState = {
  briefings: Briefing[]
  activeBriefingId: string | null
}
