# LOGICA website content

This is an inventory of the checked-in pages, not a specification for pages to build. Copy lives in the named source files. Static marketing claims below describe what the page displays; they are not verified club statistics.

## Public shell and home

`src/components/club/ClubShell.tsx` supplies About, Events, Team, Blog, and Sign in navigation. Footer actions are email (`logica@uic.edu`), Join, Sign in, Privacy, Terms, and Support. There is no Products link in this navigation.

`src/app/page.tsx` renders, in order:

1. “We are” and the “LOGICA @ UIC” character reveal, mission paragraph, and animated circuit-tree logo.
2. “By the numbers”: the static values 100+, 20+, and 1.
3. “Where Our Members Land” with employer logos.
4. Development, Mentorship, Events, and Community pathway cards.
5. “Our Partners”: company visits, talks, workshops, partners, and a separate DPI entry. Talks currently says “Coming soon — Fall '26.” The partnership action opens email.
6. Join LOGICA and Attend an Event actions.

There is no fetched upcoming-event list, featured-post feed, product directory, or rotating slogan in the homepage implementation. `Typewriter.tsx` renders one fixed string.

## Public pages

| Route and source under `src/app/` | Current content and action |
| --- | --- |
| `/about` — `about/page.tsx` | Mission, what the club does, who attends, three values, a Started/Since/Now timeline, and a Team link. |
| `/team` — `team/page.tsx` | Four static exec profiles with photos, titles and LinkedIn links: Diego Flores, Nicolas Rufino Pinto, Dylan Cervantes, Angelo Moises Guerrero. Join CTA below. No fetched member directory or missing-photo fallback. |
| `/blog` — `blog/page.tsx` | “No posts yet” and an Events link. It does not fetch the community feed. |
| `/join` — `join/page.tsx` | General Member, Software Engineer, and Mentorship track copy; three application steps; FAQs. “Apply to Join” opens a membership-interest email. It does not create an application or account through the API. |
| `/events` — `events/page.tsx` | Fetches `/api/events`, switches upcoming/past, shows loading/error/empty states, and links event detail and member sign-in. “Add to Calendar (soon)” is text. Upcoming Speakers is “To be announced.” “Subscribe” links to `/join`, not a newsletter form. |
| `/events/[id]` — `events/[id]/page.tsx` | Event details, downloadable materials, board upload controls, and a signed-in event note feed. These panels make separate API requests. |
| `/speak` — `speak/page.tsx`, `speak/SpeakerForm.tsx` | Public guest intake plus the backend public speaker list. A role-based draft panel still creates the older `/speak/[id]` completion link. |
| `/speak/[id]` — `speak/[id]/page.tsx` | Loads a draft, pre-fills `SpeakerForm`, and posts completion. Shows loading, invalid-link and already-submitted states. This is not an account-claim page. |
| `/privacy`, `/terms`, `/support` | Static pages in their respective `page.tsx` files, using `components/legal/LegalPage.tsx`. These are published text, not evidence that a backend feature exists. |

## Authentication and invitations

`src/app/signin/page.tsx` collects a university email and a password and posts them to `/api/auth/member-login`. Passwords are issued by an exec, never chosen at signup, and there is no public member signup. The old email → code screen is archived and inactive under `archive/passwordless/`. Do not promise code delivery, passkeys, or self-service reset here — a forgotten password goes through the exec board via `/support`.

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
