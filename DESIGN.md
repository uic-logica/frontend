# Visual direction · V4 (October 2026)

> **Owner:** [@nicolasrufino](https://github.com/nicolasrufino) · **Last reviewed:** Oct 15, 2026 · **Audience:** Anyone building UI · **Type:** Reference

**Source of truth:** `~/Documents/logica.pen`, Stage 9 "V4 site, every screen" (pages 01–20 Light, Dark copies at
x+8640, state frames 12b–19b) for the public site, and the "V4 ·" frames for the dashboard.

| | Public site (`.site`) | Workspace (`.dash`) |
|---|---|---|
| Tokens | `d-*` in `src/app/tokens.css`, light + dark | same tokens |
| Styles | `src/components/site/site.css` | `src/components/dashboard/dashboard.css` |
| Type | Source Serif 4 headlines (`.serif`), DM Sans body | same |
| Accents | near-black primary buttons, gold `#FECC15` only as accent, ember for dates and stars | same |

- Theme follows the computer unless the visitor picks one (moon/sun in the nav, or the dashboard's toggle). The
  choice is saved as `logica-theme` and applied before paint by `src/app/layout.tsx`.
- Paintings (`public/art/*-{light,dark}.webp`) go through `Painting.tsx`: both versions lazy, CSS shows the one for the
  current theme. They blend into the page with gradients in `--d-bg`, never as a boxed image. The full-bleed one is on
  Home's hero only; the skyline is in every footer.
- Star dividers (`StarDivider.tsx`): 2–3 per long page, never between every section. They fade in on scroll with CSS
  scroll-driven animation, and are simply there where that's unsupported or motion is reduced.
- Partner and member logos sit on white tiles in both themes (`public/logos`: brand colours, white text turned to ink).
- Copy: no em dashes, no filler taglines under section titles, no mock content shipped as real.
- Not built yet: Ride the L (rail and trains) and phone-specific layouts (phones get a simple stacked layout).

# Frontend design in the code

## Public pages

`src/components/club/ClubShell.tsx` is the shell for every public page, `/feed` and `/forms/[slug]` included: nav (logo,
About, Events, Team, Blog, theme toggle, Sign in or Dashboard, Join; a menu button below 800px), the page, and the
skyline footer (Explore, Get involved, Contact). Pages use `.site-page`, `.site-page-head`, `.site-section`,
`.site-head`, `.site-card`, `.site-btn` and `.site-field` from `site.css`; page-specific blocks are prefixed (`home-`,
`events-`, `auth-`, `legal-`, …).

## Workspace and standalone tools

`src/components/dashboard/dashboard.css` scopes the dashboard under `.dash`: light paper-dim work area, black fixed sidebar, white panels, gold actions, 14px base text, and light color scheme. Its h1 uses Archivo Black; smaller headings use the body face. It has its own focus outline and skip link. `Dashboard.tsx` provides the mobile menu and account navigation.

The public shell is not mounted around the dashboard.

## Motion

The "Where our members land" logo slider moves and pauses on hover; with reduced motion it becomes a scrollable row.
Star dividers fade in on scroll. Nothing else on the public site moves.

## Working on the design

Read the affected component and stylesheet first. `src/app/page.tsx` is the actual homepage section order; `CONTENT.md` maps the current routes. Keep `Eddie_DESIGN.md` as the human design document. This file describes implementation, not ownership decisions or a requirement to copy another website exactly.
