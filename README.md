# LOGICA @ UIC — frontend

Next.js 16 App Router, React 19, Tailwind 4, and GSAP (`package.json`). Public pages introduce the club; `/dashboard` holds member participation, guest coordination, and the exec workspace. Auth and persistent data come from the backend.

## Local setup

1. `npm ci`.
2. Copy `.env.example` to `.env.local`. Set `NEXT_PUBLIC_API_URL` to the backend origin; the default is `http://localhost:3001`.
3. `npm run dev` starts the frontend on port 3000. Run the backend separately.

`next.config.ts` rewrites `/api/*` to the backend. `src/lib/api.ts` makes same-origin JSON requests, keeping session cookies first-party. `NEXT_PUBLIC_DISCORD_URL` adds a dashboard Discord link only when set.

## Where things are

- `src/app/page.tsx`, `about/`, `team/`, `events/`, `blog/`, `join/`, `speak/` — public pages. `/join` opens an email; it does not submit the backend membership form. Blog is an empty state.
- `src/components/club/ClubShell.tsx`, `src/app/globals.css` — public navigation, footer, wallpaper, and shared type/color styles. See [DESIGN.md](DESIGN.md).
- `src/app/dashboard/layout.tsx`, `src/components/dashboard/Dashboard.tsx` — persistent dashboard shell, session loading, role-dependent home and sections. See [DASHBOARD.md](DASHBOARD.md).
- `src/components/dashboard/Board.tsx` — shared money and outreach UI; `Members.tsx`, `Insights.tsx`, `Documents.tsx`, and `Speakers.tsx` cover the rest of the exec workspace.
- `src/app/invite/[token]/page.tsx` — guest account claim with name, email, and chosen password. `/speaker-signin` uses username/password.
- `src/app/feed/`, `attendance/`, `forms/[slug]/` — standalone tools still using `AppShell`. `/members`, `/speaker-portal`, `/profile`, and `/admin/speakers` redirect into the dashboard.

## Current integration gaps

`/join` opens a `mailto:` rather than posting to `/api/join`, so the public cannot submit the applications the dashboard can now review.

Legacy `/attendance` sends only `eventId`; the backend requires `code` too. Dashboard event check-in in `Participation.tsx` sends both, so there are two check-in surfaces and one of them cannot work.

`src/app/forms/[slug]/page.tsx` renders every field as a text input regardless of its declared `type`, and keys values by label rather than field id.

`/events` shows "Add to Calendar (soon)" as literal text.

Using Claude Code? Install the [`skills`](https://github.com/uic-logica/skills) plugin for `/logica-pr`, `/logica-review`, `/logica-test`, `/logica-issue`, and `/logica-lean`.

## Member password sign-in

`/signin` accepts a university email and generated password issued by an exec.
Execs create/reset credentials under Dashboard → Members. The generated password
is displayed once and must be delivered privately after verifying the recipient.
A reset ends the recipient's sessions and revokes their MCP connections.
Forgotten passwords are handled by the exec board through `/support`.

Deploy the backend password endpoints and provision an existing exec before
switching this frontend. Backend `FRONTEND_URL` must match the frontend origin;
see backend `AUTH.md` for rollout and administrator recovery. Passwordless code
is archived under `archive/passwordless/` and is not active.

## Deployment and checks

For Vercel, build with `npm run build` and set `NEXT_PUBLIC_API_URL` to the backend origin. Set the backend's `FRONTEND_URL` to this site's origin for member password request checks. Database setup and migrations belong to the backend; see its `prisma.config.ts`, `.env.example`, and README.

`.github/workflows/ci.yml` uses Node 24 and runs `npm ci`, `npm run lint`, `npx next typegen`, `npx tsc --noEmit`, and `npm run build`. There is no test script or test runner in `package.json`. See [AGENTS.md](AGENTS.md) for review instructions and [CONTENT.md](CONTENT.md) for the page inventory.
