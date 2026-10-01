# Visual direction · V3 night design (October 2026)

> **Owner:** [@nicolasrufino](https://github.com/nicolasrufino) · **Last reviewed:** Oct 1, 2026 · **Audience:** Anyone building UI · **Type:** Reference

**This is the source of truth for how the site looks, and it supersedes any conflicting guidance below.**
The designs are the frames labeled **HANDOFF · APPLY** in [`design/logica.pen`](design/logica.pen) (open it in
[Pencil](https://pen.dev); start at "★ START HERE"): "Website · Desktop" (1440) and "Website · Mobile" (390)
for the public pages, "App · Desktop" and "App · Mobile" for the dashboard. Frames labeled ARCHIVE are retired.

| | Desktop | Phone (< 800px) |
|---|---|---|
| Art | `public/journey/v3-<page>.webp`, 2x of the 1440 frame | `v3-<page>-mobile.webp`, 3x of the 390 frame |
| Objects | navy glass `rgb(11 18 48 / .5)`, 16px blur, 28px corners | denser glass `rgb(8 17 38 / .85)`, 18–22px corners |
| Type | DM Sans 500; h1 54, h2 38, card titles 23, body 15–19 | DM Sans 600; h1 34, h2 22, titles 15, body 12–14 |
| Accents | gold `#fecc15` kickers, rust `#b63814` buttons, logos in brand colors | gold `#ffd45c`, rows with hairlines instead of cards |

- Each page's painting is drawn at exactly the window width and never rescaled, so browser zoom only resizes
  text and cards. It scrolls with the page and stops at its bottom edge if the content runs longer. Real
  phones (coarse pointer) get the phone painting. See `JourneyBackdrop.tsx`.
- Phones follow the separate mobile frames, including their shorter copy: `.only-d` / `.only-m` hold the two
  versions side by side in each page. Home's vertical gaps are in vw so each section stays over its landmark.
- Form fields are translucent with a hairline border (`src/components/ui/darkForm.ts`).
- Navigation is a glass capsule with one white indicator that slides between items (360ms ease-out).
- Things the design leaves out stay: the Join application form, Create account / forgot-password links on
  Sign in, the About timeline, and "Notify me" (the newsletter form) on an empty Events list.

# Frontend design in the code

The implementation is the reference. Public pages, the workspace, and standalone tools have different shells. Do not turn old design proposals into requirements or treat every page as an unstyled scaffold.

## Public pages

`src/components/club/ClubShell.tsx` mounts the painting (`JourneyBackdrop.tsx`), the fixed nav, and the footer. Navigation is About, Events, Team, Blog, and Sign in (Dashboard when signed in); below 800px it becomes the logo chip, a Sign in pill and a menu button. The footer stacks About, Events, Team, Blog, Join and Sign in on the right with email, Privacy, Terms and Support under them; on phones the links split into Explore and Connect columns.

The V3 pages (Home, About, Events, Team, Blog, Join, Sign in) use `.site-page`, `.page-head`, `.page-section`, `.page-grid-*` and `.page-card` from the "Public site, logica.pen V3" block of `globals.css`. Older routes (partner, speak, legal, invites, event detail) still use `PageContainer`/`SectionContainer` and `.club-card`, which share the same glass. `.club-card-interactive` adds a small hover lift.

## Tokens and type

The active tokens in `src/app/globals.css` are:

| Token | Value |
| --- | --- |
| `ink` | `#000000` |
| `paper` | `#ffffff` |
| `paper-dim` | `#f2f2f2` |
| `ink-muted` | `#8a8a8a` |
| `rule` | `#1a1a1a` |
| `signal` | `#fecc15` |
| `ember` | `#ca3a03` |

`src/app/layout.tsx` loads DM Sans at 400/500/600/700 and Archivo Black at 400. Body copy uses DM Sans; display utilities (`type-h1`, `type-h2`, `type-title`, `type-display-*`) use Archivo Black. `type-h3`, `type-h4`, and `type-label` use DM Sans. Body weight is 500. Keep Archivo Black at its loaded weight rather than adding synthetic bold.

Reuse `text-body-lg`, `text-body`, `text-body-sm`, and `text-caption` for copy. `type-title` intentionally lets a page set its size. The current code also uses Tailwind sizes directly; this is not a universal utility-only layout.

## Workspace and standalone tools

`src/components/dashboard/dashboard.css` scopes the dashboard under `.dash`: light paper-dim work area, black fixed sidebar, white panels, gold actions, 14px base text, and light color scheme. Its h1 uses Archivo Black; smaller headings use the body face. It has its own focus outline and skip link. `Dashboard.tsx` provides the mobile menu and account navigation.

`src/components/shell/AppShell.tsx` is still used by `/feed`, `/attendance`, and `/forms/[slug]`. Preserve the actual route's shell when making a local change; the public shell is not mounted around the dashboard.

## Motion

`src/components/club/Typewriter.tsx` reveals the single string “LOGICA @ UIC” over 1600ms. It does not rotate slogans. The homepage passes the same duration to `AnimatedLogo.tsx`, a server-rendered SVG animated by CSS. Their CSS modules handle reduced motion. The logo does not use Lottie.

`globals.css` defines the 30-second logo marquee, nav underline transitions, and card hover behavior. Its reduced-motion rules stop the marquee, smooth scroll, underline transitions, and card lift. Keep those alternatives when changing motion. Do not claim the whole site has passed an accessibility or performance audit from these rules alone.

## Working on the design

Read the affected component and stylesheet first. `src/app/page.tsx` is the actual homepage section order; `CONTENT.md` maps the current routes. Keep `Eddie_DESIGN.md` as the human design document. This file describes implementation, not ownership decisions or a requirement to copy another website exactly.
