# LinkLoom

LinkLoom is a local-first utility that turns scattered links and raw notes into one clean briefing page.

## MVP Scope

- Input: URLs (one per line) + pasted notes
- Output: unified briefing pane (sources + notes)
- Export: Markdown (`.md`)
- Storage: local-first in browser `localStorage`
- No backend, auth, or server-side persistence

## Run Locally

```bash
npm install
npm run dev
```

Open the app at the URL shown by Vite (default `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## UX Notes (Checkpoint 2)

- Empty-state guard: export disabled until there is content
- Error handling: invalid URL lines are flagged in UI and included in markdown under a review section
- Readability polish: responsive spacing + mobile fit improvements
- Export formatting: title, timestamp, markdown links for valid URLs, notes section

## Tech

- React + TypeScript + Vite
- Plain CSS (no UI framework)
