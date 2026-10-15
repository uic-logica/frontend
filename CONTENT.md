# LOGICA website content

> **Owner:** [@nicolasrufino](https://github.com/nicolasrufino) · **Last reviewed:** Oct 15, 2026 · **Audience:** Frontend members · **Type:** Reference

This is an inventory of the checked-in pages, not a specification for pages to build. Copy lives in the named source files. Static marketing claims below describe what the page displays; they are not verified club statistics.

## Public shell and home

`src/components/club/ClubShell.tsx`: nav with About, Events, Team, Blog, a theme toggle, Sign in (Dashboard when signed in) and Join. Footer columns: Explore (About, Events, Team, Blog), Get involved (Join LOGICA, Partner with us, Speak at LOGICA, Sign in), Contact (`logica@uic.edu`, Support, GitHub), then Privacy and Terms.

`src/app/page.tsx` renders, in order:

1. Hero: logo, "LOGICA @ UIC", "The Latinx computing community at UIC.", Join LOGICA (`/signup`), See upcoming events, and the next event from `/api/events` (hidden when there is none).
2. "Coming up": the next three events from `/api/events`, or "No upcoming events scheduled".
3. "People, not just programs": four generated Chicago scenes (no people) and the "Where our members land" logo slider. The design's member quote is left out until a real one exists.
4. "What you get": Get hired, Learn by building, Find your people.
5. Join card: Join LOGICA and Attend an event first.
6. "Supported by": partner logos in four rows (Company visits, Talks "Coming soon", Workshops, Partners) and Partner with us.

## Public pages

| Route and source under `src/app/` | Current content and action |
| --- | --- |
| `/about` — `about/page.tsx` | Mission, what the club does, who attends, three values, a Started/Since/Now timeline, and a Team link. |
| `/team` — `team/page.tsx` | Four static exec profiles with photos, titles and LinkedIn links: Diego Flores, Nicolas Rufino Pinto, Dylan Cervantes, Angelo Moises Guerrero. Join CTA below. No fetched member directory or missing-photo fallback. |
| `/blog` — `blog/page.tsx` | “No posts yet” and a See events link. It does not fetch the community feed. |
| `/join` — `join/page.tsx`, `join/JoinForm.tsx` | Create your account / Attend an event first, Software Engineer and Board Member roles, three application steps, FAQs, and the application form: Board Member posts to `/api/join`; Software Engineer sends people to the dashboard's Software Teams. |
| `/events` — `events/page.tsx` | Fetches `/api/events` on the server, switches upcoming/past, shows error/empty states, links event detail, and offers a per-event .ics download and RSVP link. “Never miss one” posts to `/api/subscribe`. |
| `/events/[id]` — `events/[id]/page.tsx` | Title, date, location, RSVP link, .ics download and the description. Materials and check-in live in the dashboard. |
| `/speak` — `speak/page.tsx`, `speak/SpeakerForm.tsx` | Public guest intake plus the backend public speaker list. A role-based draft panel still creates the older `/speak/[id]` completion link. |
| `/speak/[id]` — `speak/[id]/page.tsx` | Loads a draft, pre-fills `SpeakerForm`, and posts completion. Shows loading, invalid-link and already-submitted states. This is not an account-claim page. |
| `/privacy`, `/terms`, `/support` | Static pages in their respective `page.tsx` files, using `components/legal/LegalPage.tsx`. These are published text, not evidence that a backend feature exists. |

## Authentication and invitations

`src/app/signin/page.tsx` collects a university email and a password and posts them to `/api/auth/member-login`. Members create their own account at `/signup` with a @uic.edu email; execs can also issue or reset a password from the Members section. The old email → code screen is archived and inactive under `archive/passwordless/`. Do not promise code delivery, passkeys, or self-service reset here: a forgotten password goes through the exec board via `/support`.

`src/app/speaker-signin/page.tsx` sends username/password to `/api/auth/speaker-login`. It routes temporary-password accounts to `/speaker-signin/set-password` and other guests through `/speaker-portal` to the dashboard. Its copy still says “confirmed speakers” and “invite email,” although the backend also permits candidates and accounts claimed from a link.

`src/app/invite/[token]/page.tsx` looks up a single-use invitation, displays visit-specific wording, and collects name, email, and a password. Successful claim signs the guest in and routes to `/dashboard`. Invalid/expired/used links display the backend error. The backend requires 10–200 password characters and rejects claims from an existing signed-in session.

There is no public member signup. Guest account creation requires a valid invite. Dashboard `Speakers.tsx` creates or replaces token links for talks, workshops, and company visits, and still offers the older emailed temporary-password account action.

## Dashboard

See `DASHBOARD.md` for sections and their components. `src/components/dashboard/types.ts` and `Dashboard.tsx` select member, candidate, confirmed guest, or exec views. BOARD sees the member view; the business workspace is EXEC_BOARD-only.

Money and outreach are two kinds of one pipeline component/table. Members is the roster and role/officer editor, not a public directory or password-issuance UI. Documents shows a not-connected state when the backend Drive settings are absent. MCP Connections renders the tool summaries returned by the backend, rather than a fixed frontend catalog.

The redirects are implemented in `members/page.tsx`, `speaker-portal/page.tsx`, `profile/page.tsx`, and `admin/speakers/page.tsx`: the first two go to `/dashboard`, the others to `/dashboard/profile` and `/dashboard/speakers`.

## Standalone member tools

- `src/app/feed/page.tsx` fetches and posts plain-text community updates through `/api/posts`. It has a composer, post grid, loading, error, and empty states. No pinned-announcement or reaction feature is rendered.
- `src/app/attendance/page.tsx` fetches personal attendance history but its check-in form sends only `eventId`. The paired backend requires `code`, so this legacy form fails validation. Dashboard `Participation.tsx` has the code field and sends both values. There is no QR scanner on the standalone page.
- `src/app/forms/[slug]/page.tsx` loads a backend form and renders one text input per field, regardless of `type`. Values are keyed by label; every field is required by the client. Submission posts `{ data: values }`. Errors focus a summary and change the page title; success replaces the form with a confirmation. Links to startup intake and company visit are present, but their schemas come from the backend. There is no submissions-review UI on this page.

Do not add copy about absent calendars, moderation queues, product pages, registration, or form field types just because an older document planned them.
