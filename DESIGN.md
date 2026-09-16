# Frontend design direction

## The concept

LOGICA = logic × growth.

- **Shape / UX:** copy the [Yale Computer Society](https://yalecomputersociety.org) site **exactly** — same IA, same homepage section order, same page types, same interaction patterns (fixed nav, typewriter hero, stats, pathways, sponsors, join CTAs, team grid, products directory, events upcoming/past).
- **Look:** Cesar Villela / Elenco **black · white · red**, Tropicália print energy, official **LOGICA** circuit-tree logo. YCS pink → our `signal` red. No cream mural system.

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
| `signal` | `#E10600` | YCS-pink slot — links, accents, four dots |
| `ink-muted` | `#8A8A8A` | Secondary on ink |

Four red dots = Villela motif. Logo = `LogicaMark` / `public/logo-logica.png` only.

Type: **DM Sans** (same family as YCS) — weights 400/500/600/700. No separate blackface display face; size + weight do the hierarchy. Hero cycle line: `text-4xl sm:text-6xl md:text-8xl font-semibold`. Page titles: `text-5xl md:text-7xl font-bold`. Team photos: `h-40 w-40 md:h-48 md:w-48 lg:h-56 lg:w-56 rounded-xl`, grid `gap-x-6 gap-y-12`.

Layout classes mirror YCS rhythm: page shell `mb-20 px-4 sm:px-6 lg:px-12 pt-16 sm:pt-20 lg:pt-24`, sections `max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 mb-16 sm:mb-24 lg:mb-32`, fixed nav `p-8`, spacer `h-24`.

## Motion

- Typewriter hero (respect `prefers-reduced-motion`)
- Stat/pathway hover translate `-4px`
- No canvas particles required (optional omit — shape matters more than their canvas)

## What wins

This file + YCS structure. `Eddie_DESIGN.md` is research only.
