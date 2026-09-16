# Product

## Register

brand

## Users

Two groups on the same site:
- **Prospective members and sponsors** (UIC students, company reps evaluating the club) — landing on `/`, `/about`, `/join`, `/team`, `/events` to decide whether to apply, attend, or sponsor.
- **Current members** — using the gated tools (`/signin`, `/profile`, `/feed`, `/attendance`, `/forms/*`) to sign in, check event feed, check into events, and fill required forms. These are still part of the same brand surface, not a separate app; a member should never feel like they left the club's site when they sign in.

## Product Purpose

LOGICA @ UIC's public site: it markets the club (mission, team, events, sponsors) to recruit members and sponsors, and layers in the minimum member tooling (sign-in, profile, feed, attendance, forms) needed to run the club day to day. Success = visitors understand what LOGICA is and apply/attend/sponsor; members can sign in and do the one task they came for without friction.

## Brand Personality

"Logic × growth." Bold, graphic, disciplined — black/white/red Elenco (Cesar Villela) print energy with Tropicália-poster confidence, not soft SaaS-startup polish. Sharp typography and hard contrast do the work; no gradients, no pastel, no cream/mural warmth.

## Anti-references

- Not a cream/pastel "warm mural" aesthetic (explicitly ruled out in DESIGN.md).
- Not generic SaaS: no glassmorphism, no hero-metric-card template, no soft rounded dashboard look for the member tools.
- Shape (information architecture, section order, page types) follows Yale Computer Society's site exactly, but the *look* is Villela/Elenco black-white-red, not YCS's pink.
- The current `/signin` and other scaffold pages (`/profile`, `/feed`, `/attendance`, `/forms/[slug]`) are explicitly throwaway, unstyled placeholders per README — they are the anti-reference for what these pages should become.

## Design Principles

1. **One system, two audiences.** Member tool pages (signin, profile, feed, attendance, forms) use the exact same visual language as the public marketing pages — same nav shell, type scale, color tokens, spacing rhythm. A signed-in member is still on the LOGICA site.
2. **Shape from YCS, look from Villela.** Never blend the two: structure/IA/interaction patterns copy Yale Computer Society; color/type/motion identity is black-white-red Elenco with the four-dot motif.
3. **Size and weight carry hierarchy, not extra typefaces.** Single family (DM Sans), no separate display face.
4. **Consistency over novelty per-page.** Every page reuses the same page-shell spacing, heading scale, and section rhythm defined in DESIGN.md — no page invents its own type scale or container widths.
5. **Keep it lean.** Native HTML/Tailwind before component libraries; minimum code that works (per AGENTS.md's "Keeping it lean").

## Accessibility & Inclusion

WCAG AA baseline. Forms have labeled, keyboard-navigable inputs (explicit review checklist item in AGENTS.md and QA/CHECKLIST). Interactive controls (check-in buttons, nav, forms) must be reachable and operable by keyboard and screen reader. Motion (typewriter hero, hover transforms) respects `prefers-reduced-motion`, as already specified in DESIGN.md.
