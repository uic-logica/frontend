# LOGICA workspace

`src/app/dashboard/layout.tsx` mounts `src/components/dashboard/Dashboard.tsx` once. The shell reads the section from the pathname, so navigating sections preserves loaded state. The section pages render nothing themselves.

## Who sees what

`src/components/dashboard/types.ts` owns navigation and mirrors backend stages. `runsWorkspace()` requires account kind MEMBER and role EXEC_BOARD. BOARD currently gets the member view. Guest accounts never gain workspace access from their role field.

- Members/BOARD: overview, profile, events, engagement, community.
- Exec: overview, insights, money, pipeline, speaker directory, members, applications, documents, events, community, profile.
- Candidate guests: visit/availability first, messages, profile. Confirmed guests: profile first, their talk/workshop/visit, messages.

All get notifications, MCP Connections, and settings links. Discord is conditional on `NEXT_PUBLIC_DISCORD_URL`. Backend handlers enforce permissions independently of this navigation.

## Sections and source

| Section | Implementation |
| --- | --- |
| Overview | `Overview.tsx` for personal engagement counts and next actions; `BoardHome.tsx` for exec tiles, waiting items and events. Officer changes the pinned tiles, not access. |
| Guest home/messages | `CandidateHome.tsx` saves and confirms availability; `SpeakerHome.tsx` shows confirmed-visit preparation and linked-event stats. `Thread.tsx` is the submission's shared thread with the board. |
| Profile/settings | `Profile.tsx` edits member or guest details, supports resume upload, and saves email preferences. Guest talk fields depend on confirmation. |
| Events/community/activity | `Participation.tsx` handles RSVP, materials, code check-in and community posts; `Overview.tsx` renders engagement history. |
| Speakers | `Speakers.tsx` searches and filters guests, creates/replaces single-use links, changes decisions, attaches events, and retains the older emailed-account invitation action. |
| Money/pipeline | `Board.tsx`, keyed by MONEY or OUTREACH. Search, stage filters, creation, edits, ownership, next steps, and archiving share one component. Money adds budgets, cents-based amounts, receipts and reimbursement tracking. |
| Members | `Members.tsx` searches the roster, edits role/officer fields, and issues or resets a member password via `/api/board/members/password`. The generated password is shown once and must be delivered privately. |
| Applications | `Applications.tsx` lists membership applications from `/api/join`, filters by status, and records a decision via `PATCH /api/join/:id`. Exec only. |
| Insights | `Insights.tsx` displays member activity, RSVP versus attendance, top attendees, and guest/application totals returned by `/api/board/insights`. |
| Documents | `Documents.tsx` browses folders and searches names through `/api/board/documents`. Files open in Drive; no editing/uploading here. Missing settings produce a not-connected panel pointing to backend `.env.example`. |
| Connections | `AgentAccess.tsx` lists, creates, and revokes MCP bearer tokens through `/api/mcp-tokens`; displays the backend's caller-filtered tool descriptions. |

Paths in this table are under `src/components/dashboard/`. `types.ts` mirrors backend board stages and response shapes. Money and outreach persist in one backend `BoardItem` table, distinguished by kind; `Budget` is separate.

## Data and states

`Dashboard.tsx` loads `/api/auth/session`, the account's profile, events, and notifications. Member accounts also load `/api/dashboard`; execs load the roster and guest directory. Board sections fetch their own data. The shell has loading, signed-out, failed-session, and partial-load error states. Accounts with `mustChangePassword` redirect to `/speaker-signin/set-password`.

The backend `app/api/dashboard/route.ts` scopes history to the session user, with the latest 20 attendance/post/form records per category. Guest event counts come through `/api/speaker-profile` and the linked Event; availability alone is not a booking.

Legacy `/members` and `/speaker-portal` redirect to `/dashboard`; `/profile` goes to `/dashboard/profile`; `/admin/speakers` goes to `/dashboard/speakers`. Public pages keep their separate shell.

## Checks

Use frontend lint, Next type generation, TypeScript, and build as listed in `.github/workflows/ci.yml`. Verify roles and empty/error states against a backend with the checked-in migrations. The current `/signin` still calls retired email-code endpoints; it cannot establish a member session against the paired backend's password-only login.
