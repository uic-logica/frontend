# LOGICA @ UIC — frontend

> **Owner:** [@nicolasrufino](https://github.com/nicolasrufino) · **Last reviewed:** Oct 15, 2026 · **Audience:** Members and recruiters · **Type:** Landing page

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs)](https://nextjs.org/) [![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=000)](https://react.dev/) [![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=fff)](https://tailwindcss.com/) [![Vercel](https://img.shields.io/badge/Vercel-live-000000?logo=vercel)](https://logicauic.org)

The club website for [LOGICA @ UIC](https://github.com/uic-logica): Latinx and underrepresented students in computing at the University of Illinois Chicago. **[Live site →](https://logicauic.org)**

**Software lead:** Nicolas Rufino ([@nicolasrufino](https://github.com/nicolasrufino)). Owns every product, sets deadlines, reviews and merges. Public repo, **members-only contributions** ([how we work](https://github.com/uic-logica/.github/blob/main/CONTRIBUTING.md)).

<img src="docs/screenshots/home-desktop.jpg" alt="Home page: a warm painting of the Chicago skyline fading into the page" width="70%"> <img src="docs/screenshots/home-phone.jpg" alt="Home page on a phone" width="24%">

## What's live

| Area | What it does |
|---|---|
| Public site | Home, About, Events, Team, Projects, Blog, Join, Partner, Speak, legal pages. Light and dark, a Chicago painting on Home and in every footer |
| Accounts | Sign up with @uic.edu, password sign-in, 30-day sessions |
| Member dashboard | Overview, profile (resume + LinkedIn), events and one-step check-in, engagement, community, **Software Teams** application |
| Exec workspace | Money, outreach pipeline, insights, documents, members, applications, speakers; the board edits events in place |
| Speakers & guests | `/speak` intake, guest portal, availability calendar |

<img src="docs/screenshots/events-desktop.jpg" alt="Events page" width="49%"> <img src="docs/screenshots/projects-desktop.jpg" alt="Projects page" width="49%">

What members are building next (opportunity board, resume builder, 3D event replays, mock interviewer) is on [logicauic.org/projects](https://logicauic.org/projects) and in the [roadmap](https://github.com/uic-logica/.github/blob/main/ROADMAP.md).

## How it fits together

```mermaid
flowchart LR
  U[Browser] --> F["frontend (this repo)<br/>Next.js on Vercel"]
  F -- "/api/* rewrite<br/>same-origin cookies" --> B["backend<br/>logica-backend.vercel.app"]
  B --> DB[(Postgres<br/>Supabase)]
  style F fill:#FECC15,color:#111
```

Browser calls stay same-origin (`src/lib/api.ts`); `next.config.ts` forwards `/api/*` to `NEXT_PUBLIC_API_URL`, so session cookies stay first-party.

## Run it locally

```bash
npm ci
cp .env.example .env.local    # NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev                   # http://localhost:3000
```

`SITE_URL` defaults to `https://logicauic.org` (sitemap, canonical URLs, Open Graph and share image use it); set it only to override.

Run the [backend](https://github.com/uic-logica/backend#readme) on port 3001 at the same time. Before a PR: `npm run lint` · `npx tsc --noEmit` · `npm test`.

## Where things are

| Path | What |
|---|---|
| `src/app/` | Routes: public pages, `signin`, `signup`, `dashboard/[section]`, `speak`, `invite` |
| `src/components/club/` | Public shell: nav, footer, theme toggle (`ClubShell.tsx`) |
| `src/components/site/` | Public site styles (`site.css`), paintings, star divider, icons |
| `src/components/dashboard/` | Dashboard shell and every section (`Dashboard.tsx`, `Board.tsx`, `Speakers.tsx`, …) |
| `src/app/tokens.css` | The `d-*` color tokens, light and dark, shared by the site and the dashboard |
| `src/lib/` | API client and pure helpers (with vitest tests) |
| `design/logica.pen` | The design. V4 frames ("V4 · Site" and "V4 ·" dashboard), open in [Pencil](https://pen.dev) |
| `docs/screenshots/` | Live screenshots used here |

## Design

The V4 design in [`design/logica.pen`](design/logica.pen) (Stage 9 for the site) and [DESIGN.md](DESIGN.md) is the spec. New screens get designed there first. How dashboard items open (split views, links that keep your place, confirms, the read cache) is in [DASHBOARD.md](DASHBOARD.md).

Docs for contributors: [AGENTS.md](AGENTS.md) (rules for code changes) · [PRODUCT.md](PRODUCT.md) · [DASHBOARD.md](DASHBOARD.md) · [CONTENT.md](CONTENT.md) · [roadmap](https://github.com/uic-logica/.github/blob/main/ROADMAP.md).
