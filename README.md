# LinkLoom

A context packer that turns scattered links, notes, and files into clean, shareable briefings.

## Features

- **Smart paste** — paste URLs and notes together, URLs are auto-detected
- **File drop** — drag & drop `.txt` or `.md` files to import content
- **Multiple briefings** — create, manage, and switch between briefings
- **Editable items** — click any source title or note to edit inline
- **URL enrichment** — favicons fetched automatically, custom titles per link
- **Live preview** — Markdown output updates in real-time
- **Export** — download as `.md`, copy to clipboard, or share via URL
- **Share links** — encode a briefing into a URL (zero-backend sharing)
- **Local-first** — everything saved in browser `localStorage`, no server needed

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Tech

- React 19 + TypeScript + Vite
- Zero runtime dependencies beyond React
- Plain CSS with custom properties
