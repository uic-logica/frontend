# LOGICA @ UIC — frontend

Public site: landing, team, calendar, events, member spotlight, forms. Talks to [`backend`](https://github.com/uic-logica/backend) for auth, data, and everything user-specific.

## Stack

Next.js 16 (App Router) + Tailwind + GSAP (motion) + Lottie (vector animation). See [DESIGN.md](DESIGN.md) for the visual direction and the performance/motion bar every page is held to.

## Local setup

1. `npm install`
2. Copy `.env.example` to `.env.local`, point `NEXT_PUBLIC_API_URL` at your local backend (defaults to `http://localhost:3001`).
3. `npm run dev`

## Where things are

- `next.config.ts` — proxies `/api/*` to the backend so the session cookie backend sets stays first-party; no CORS/SameSite config needed anywhere. This part's a real architectural decision, not scaffolding — keep it when replacing the pages below.
- `src/app/signin`, `/profile`, `/feed`, `/events`, `/attendance`, `/forms/[slug]` — **bare-minimum, throwaway scaffolding**, unstyled on purpose (see ROADMAP's skeleton-first build order). A rough starting reference for Steps 2–7, not finished pages — see each roadmap issue's comments for specifics.
- `src/lib/api.ts` — small fetch wrapper the scaffolding pages share.

## Workflow

See the org-wide [CONTRIBUTING.md](https://github.com/uic-logica/.github/blob/main/CONTRIBUTING.md) — branch off `main`, PR, review, merge. CI runs lint + typecheck + build on every PR.

New here? Read [ROADMAP.md](https://github.com/uic-logica/.github/blob/main/ROADMAP.md) and the [frontend role guide](https://github.com/uic-logica/.github/blob/main/docs/roles/frontend.md) first, then pick up an open issue labeled `roadmap`.

Using Claude Code? Install the [`skills`](https://github.com/uic-logica/skills) plugin for `/logica-pr`, `/logica-review`, `/logica-test`, `/logica-issue`, and `/logica-lean`.
