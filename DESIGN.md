# Frontend design direction

## Status (2026-09-16)

**This file is the active direction. Build against it, not against a Figma/Pencil mockup, unless a page is genuinely novel enough to need one.** The team was moving too slowly designing each page separately before coding it; we're building directly against the system below instead, page by page, same roadmap order, faster loop.

The richer Cesar Villela / Athos Bulcão / Carlos Cruz-Diez "culture-rich" direction some pages reference in comments (feed's tile modules, attendance's color-flash) is a **future phase, not now.** `Eddie_DESIGN.md` holds that research — treat it as inspiration for a later pass, not a spec to build today. If a page's comment cites one of those references, the *shape* (e.g. feed's fixed-module grid) still applies; the deeper visual treatment doesn't yet.

Eduardo is no longer design lead — there's no longer a single owner drawing every page ahead of the code. Whoever's building a page owns making it match this file.

## The concept

LOGICA = logic × growth.

- **Shape / UX:** copy the [Yale Computer Society](https://yalecomputersociety.org) site **exactly** — same IA, same homepage section order, same page types, same interaction patterns (fixed nav, typewriter hero, stats, pathways, sponsors, join CTAs, team grid, products directory, events upcoming/past).
- **Look:** Cesar Villela / Elenco **black · white · gold**, Tropicália print energy, official **LOGICA** circuit-tree logo. YCS pink → our `signal` gold (`#FECC15`). No cream mural system.

## Shape reference (copy this)

Primary source: https://yalecomputersociety.org

### Nav (fixed, ink)

`Logo` · About · Products · Events · Team · Blog

### Home section order (do not reorder)

1. Giant faint watermark wordmark behind content (`LOGICA` / club mark)
2. Hero — “We are the” + rotating typewriter line + one paragraph + “Explore our products →” + blog sentence link
3. **By the numbers** — 3 big stats
4. **Where Our Members Land** — centered title + numbered 01–04 pathway cards (Development · Mentorship · Events · Community)
5. **Our Sponsors** — tier labels + logos (placeholders OK)
6. Sponsor CTA strip — “Interested in partnering… / Become a Sponsor”
7. Join CTA strip — “Ready to join… / Apply to Join / Attend an Event”
8. Footer — “Get in touch” + © year

### Other pages (same shape as YCS)

| Route | Shape |
| --- | --- |
| `/about` | Title, intro, photo/band, values, timeline, meet-team teaser, sponsors |
| `/products` | Directory of products/programs + FAQ + contact |
| `/events` | Intro, Upcoming / Past tabs, empty state, Add to Calendar, newsletter |
| `/team` | Exec board grid, product/program leads, member directory gate, join CTA |
| `/blog` | Post list (stub until content) |
| `/join` | Roles, application process, FAQ, apply CTA |

Member tools (`/signin`, `/profile`, `/feed`, `/attendance`, `/forms`) are app surfaces — linked from footer / gated team directory, **not** primary nav.

## Visual system (Elenco)

| Token | Hex | Role |
| --- | --- | --- |
| `ink` | `#000000` | Site ground (YCS black) |
| `paper` | `#FFFFFF` | Text on ink; light wells |
| `paper-dim` | `#F2F2F2` | Rare light bands |
| `signal` | `#FECC15` | YCS-pink slot — links, accents, four dots |
| `ink-muted` | `#8A8A8A` | Secondary on ink |

Four gold dots = Villela motif. Logo = `LogicaMark` / `public/logo-logica.png` only.

Type: **two faces, and only two.**

| Face | Use | Token |
| --- | --- | --- |
| **DM Sans** (400/500/600/700) | Everything you read — body, labels, buttons, nav, `type-h3` and below | `--font-sans` |
| **Archivo Black** | Display only — page titles, `type-h1`/`type-h2`, the LOGICA wordmark, big stat numbers | `--font-display` |

Archivo Black stands in for **Folio Extra Bold**, the 1957 Bauer neo-grotesque used on the
[Getz/Gilberto](https://fontsinuse.com/uses/37528/stan-getz-joao-gilberto-getz-gilberto-album-a)
cover — the same record whose Olga Albizu painting the wallpaper comes from. Folio isn't
free; Archivo Black is the closest open face in that lineage.

Two rules: Archivo Black ships **one weight**, so never pair it with `font-bold` — that
triggers synthetic bolding and smears it. And don't reach for it below `type-h2`; it's too
heavy to read at body sizes. No third face — no monospace, no serif.

**Use the shared scale in `globals.css`, not a one-off Tailwind size.** Every page's headings and body copy should come from these utility classes so pages don't drift apart:

| Class | Use |
| --- | --- |
| `type-h1` | Page title (one per page) |
| `type-h2` | Section heading |
| `type-h3` | Card / subsection heading |
| `type-h4` | Minor heading |
| `type-label` | Eyebrows, form labels, small caps tags |
| `text-body-lg` / `text-body` / `text-body-sm` / `text-caption` | Paragraph copy, largest to smallest |

Team photos: `h-40 w-40 md:h-48 md:w-48 lg:h-56 lg:w-56 rounded-xl`, grid `gap-x-6 gap-y-12`.

Layout classes mirror YCS rhythm: page shell `mb-20 px-4 sm:px-6 lg:px-12 pt-16 sm:pt-20 lg:pt-24`, sections `max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mb-16 sm:mb-24 lg:mb-32`, fixed nav `p-8`, spacer `h-24`.

## Motion

- Typewriter hero (respect `prefers-reduced-motion`)
- Stat/pathway hover translate `-4px`
- No canvas particles required (optional omit — shape matters more than their canvas)

## What wins

This file + YCS structure. `Eddie_DESIGN.md` is research for a later phase — see Status above.
