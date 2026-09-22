# Product

The public site introduces LOGICA, the Latinx Organization for Growth in Computing and Academics at UIC. The dashboard handles records: participation, guest availability and talks, and exec decisions. This describes the checked-in implementation, including unfinished connections.

## Public site

`src/app/page.tsx` presents the mission, static club statistics, member-employer logos, four pathways, partner categories, and links to join or attend. These are authored arrays and copy, not dashboard analytics.

`src/components/club/ClubShell.tsx` links About, Events, Team, Blog, and Sign in. `/team` renders four hardcoded exec profiles. `/blog` says “No posts yet.” `/join` describes roles and an application process, but its action opens an email to `logica@uic.edu`; there is no application form on that page.

`src/app/events/page.tsx` fetches events and splits them into upcoming/past lists. Calendar export is marked “soon”; the speaker lineup is a static placeholder. `/speak` has the public guest intake form and fetches the public speaker list. These are separate from creating a login account.

## Signed-in users

`src/components/dashboard/types.ts` and `Dashboard.tsx` select the experience:

- MEMBER and BOARD receive the member view: overview, profile, events, engagement, and community.
- MEMBER accounts with EXEC_BOARD role get insights, money, outreach pipeline, guest directory, roster, and documents as well. Officer titles alter the home tiles in `BoardHome.tsx`, not permissions.
- SPEAKER accounts whose submission is not CONFIRMED see the candidate home: availability and a board message thread. Confirmed guests see talk preparation and linked-event counts. TALK, WORKSHOP, and COMPANY_VISIT change the visit wording.

Notifications, settings, and MCP Connections sit in the account navigation. Discord appears only when `NEXT_PUBLIC_DISCORD_URL` is set. `AgentAccess.tsx` manages backend-issued bearer tokens and displays the tools the backend returns for that caller; it does not define the tool catalog.

Money and outreach use one `Board.tsx` component and one backend `BoardItem` model with two kinds. Documents is a read-only Drive browser; without the backend service-account settings it shows a not-connected state.

## Account entry

Guests claim `/invite/[token]` with their name, email, and chosen password, then enter the dashboard. `/speaker-signin` posts username/password and routes temporary-password accounts to the password-change page.

Member auth is currently mismatched: `src/app/signin/page.tsx` still requests email codes, while the paired backend only supports issued member passwords. The frontend has no member-password login or issuance form. There is no public member signup. Do not describe the old code flow as working, or the replacement UI as already shipped.

## Visual surfaces

Public pages use the fixed wallpaper, gold accents, DM Sans, and Archivo Black from `globals.css` and `layout.tsx`. The dashboard uses its own black sidebar and light work area in `dashboard.css`. Standalone feed, attendance, and forms still use `AppShell`. They do not all share one identical shell. See [DESIGN.md](DESIGN.md) and [DASHBOARD.md](DASHBOARD.md).
