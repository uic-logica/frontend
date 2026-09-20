# LOGICA workspace

The signed-in workspace lives at `/dashboard`. Its overview and navigation follow the authenticated account kind and membership role. Built on `codex/dashboard-rebuild` in frontend and backend.

## Pages

- `/dashboard`: profile essentials, next actions, engagement counts, upcoming club events, and notifications.
- `/dashboard/profile`: persisted member details or speaker details, resume, availability, equipment needs, and board notes.
- `/dashboard/events`: upcoming/past events, personal RSVPs, materials, and check-in. Board accounts can create events.
- `/dashboard/activity`: personal attendance, posts, and form submission history.
- `/dashboard/community`: read and publish community posts.
- `/dashboard/speakers`: board-only directory, search/filter, review, draft completion links, and exec-only portal invitations.
- `/dashboard/notifications` and `/dashboard/settings`: notifications and email preferences.

Legacy `/members` and `/speaker-portal` links redirect to the overview. `/profile` and `/admin/speakers` redirect to their workspace sections. Public pages remain outside the workspace.

## Data and permissions

The backend adds `GET /api/dashboard`, authenticated and scoped exclusively to the session user. Counts use Prisma relations. History is limited to the latest 20 records per category; form answers and credentials are never returned. All other actions reuse existing API routes and their server-side role checks. No schema migration is needed.

Speaker availability is not a confirmed booking. The schema does not associate speakers with scheduled events, so the calendar is labeled as club events and does not claim that a speaker is assigned to one.

## Local preview

Use the `frontend-wallpaper-preview` checkout at port 3002 with the backend on port 3001. The backend must include the new dashboard endpoint and have its existing migrations applied. Test accounts are local database records; no demo identities or credentials are bundled into the frontend.

## Validation

Frontend lint, TypeScript and production build. Backend lint, TypeScript and existing unit tests. `app/api/dashboard/route.test.ts` adds a signed-out check and real-Postgres ownership/response-privacy checks for member, exec and speaker sessions (set `DATABASE_URL` to a test database to run those).

Browser checks covered all three roles, mobile navigation at 390px, profile save, RSVP persistence, and directory search. Outbound invitation emails were not sent during testing.
