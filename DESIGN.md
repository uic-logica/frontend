# Visual direction · night redesign (September 2026)

**This is the source of truth for how the site looks, and it supersedes any conflicting guidance below.**
The designs are the "Variant E (night)" frames in `logica.pen`: 28–33 for the public pages and
"35 Dashboard — Variant E (night) · C clouds + city lights" for the dashboard.

- Each page has one night painting of Chicago (`public/journey/*-night.webp`), drawn at exactly the window
  width and never rescaled, so browser zoom only resizes text and cards. It scrolls with the page and stops
  at its bottom edge if the content runs longer. See `JourneyBackdrop.tsx`.
- Objects are navy glass (`rgb(11 18 48 / .5)` with a background blur, 28px corners), white text, gold
  (`#fecc15`) labels and links, rust (`#b63814`) primary buttons. Form fields stay white for legibility.
- Navigation is a glass capsule with one white indicator that slides between items (mapier.ai's motion,
  360ms ease-out), including onto Sign in; the dashboard sidebar slides the same way.
- Type is DM Sans throughout, medium weight for headings. The mapier.ai site is a reference only.

# Frontend design in the code

The implementation is the reference. Public pages, the workspace, and standalone tools have different shells. Do not turn old design proposals into requirements or treat every page as an unstyled scaffold.

## Public pages

`src/app/globals.css` puts `/logicawallpaper.png` on the body as a fixed, cover-sized background with a 0.3 black overlay. `src/components/club/ClubShell.tsx` provides a transparent fixed nav and a black footer with corner notches and an ember glow. The shell uses `/logica-logo-white.png`.

Navigation is About, Events, Team, Blog, and Sign in. Desktop links hide while scrolling down; the mobile menu is selected below 800px. The footer links email, Join, Sign in, Privacy, Terms, and Support.

`PageContainer` and `SectionContainer` in `ClubShell.tsx` provide the responsive padding and section spacing. `.club-card` supplies a one-rem radius, white border, and gold hover edge. Only `.club-card-interactive` adds the four-pixel hover lift. Team cards in `src/app/team/page.tsx` use rounded photos and a name-color change, without a lift.

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
