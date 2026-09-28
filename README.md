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

## Search and sharing setup

Public pages have individual titles, descriptions, Open Graph and Twitter cards.
The homepage includes Organization structured data. `/share-image` serves a
1200×630 PNG, and `/sitemap.xml` lists the public content pages.

Before launch, set `SITE_URL` to the final HTTPS origin (no path), then rebuild.
Without it, pages carry `noindex`, the sitemap is empty, and canonical URLs are
omitted. Leave this variable unset on preview deployments. At launch, verify
`/robots.txt`, `/sitemap.xml`, and page source against the real domain, then verify
ownership in Google Search Console and submit the sitemap.

Account pages, private event/speaker details, design previews, forms, and the empty
blog send `X-Robots-Tag: noindex, follow`. These routes remain crawlable so bots can
read the directive; this is not access control. When real blog posts launch,
remove the blog exclusion from both its metadata and `next.config.ts` and include
it in the sitemap. Event details currently require sign-in, so they are excluded;
public event landing pages can add event-specific metadata and structured data
when a public backend endpoint exists.
