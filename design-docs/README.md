# LOGICA design docs

Start here. This folder holds the visual direction for the LOGICA @ UIC site. None of
it is final. The direction hasn't been signed off, and the scope of the first version
is still being discussed (see [open questions](#open-questions)).

## What's in here

| Doc | What it covers | Read it when |
|---|---|---|
| [design-direction.md](design-direction.md) | The concept, the art references by country, where the palette and type came from, the voice for copy, and what the site should never do | You want to know why the site looks the way it does |
| [style-guide.md](style-guide.md) | Reusable rules: color tokens and approved contrast pairings, type scale, spacing and grid, motion, imagery, icons, components, and the accessibility bar | You're building any page |
| [landing-page.md](landing-page.md) | The landing page section by section, desktop and mobile, with the reasoning for each section | You're building the landing page |
| [archive/](archive/README.md) | Earlier work: the first reference doc (`Eddie_DESIGN.md`, merged in #25) and an abandoned pencil.dev mockup (`mockup_archive.pen`). Neither is current | You're working on a page other than the landing page and want the old per-page references and motion ideas, or you want to see what was already tried |

Suggested reading order: design direction, then the style guide, then the landing page.

Two docs at the repo root sit above this folder:

- `CONTENT.md` says what every page contains. The layouts here follow it.
- `DESIGN.md` sets the performance and motion bar (Lighthouse 90+, LCP under 2.5s,
  reduced-motion fallbacks) and the build order.

## Open questions

These are undecided. If you need an answer to build something, ask instead of
guessing.

1. **Scope of the first version.** The current proposal is to ship a simpler v1 first
   (the flat mark, the palette and type, real content from the API, no 3D and no scroll
   animation) and add the more ambitious hero later. Not agreed yet.
2. **Who owns visual direction.** Open.
3. **The hero object.** The lit, 3D version of the mark came out of AI image
   exploration. It's a direction, not an asset. Nobody has built it, and building it
   is 3D and motion work. [landing-page.md](landing-page.md#the-3d-object-and-the-performance-budget)
   has the plan for how it would ship.
4. **Display typeface.** Barricada Pro's license path (Adobe Fonts embed or a purchased
   self-hosted license) isn't settled, and it shouldn't go in the codebase as a runtime
   dependency on a service nobody signed off on. The archived doc's choice, Archivo
   Black (Omnibus-Type, Buenos Aires, SIL Open Font License), is free, self-hostable
   and Latin American work, so it's an option if Barricada falls through.
5. **The hero's one action.** Sign In, or a link down to Upcoming Events. The board's
   call.
6. **Roots on the tree mark.** Suggested: extend the mark with roots, each one standing
   for something LOGICA represents. Worth deciding whether that's a website
   illustration or a change to the logo itself, and what the roots stand for. One root
   per country means choosing which countries appear; the three pillars (diversity,
   growth and development, community) avoid that.
7. **Country flags.** Suggested as a pattern. It raises the same question as a root per
   country. One option is optional flags on member profiles, chosen by each member,
   which would need a new field in the `CONTENT.md` profile spec.

## Known issues

Found while building a mockup of the landing page. Each is also noted where the rule
lives.

- **Rosa button labels.** Paper on Rosa is 3.9:1, so the label has to be large text
  (18.66px bold or 24px regular), but the button spec uses 14px `text-ui-label`. Use a
  larger label or a white one (white on Rosa is 4.6:1).
  [Style guide](style-guide.md#usage-rules)
- **Focus ring on dark surfaces.** Cobalt on Ink is 2.3:1, under the 3:1 a focus
  indicator needs. Dark surfaces need another ring color; Cempasúchil is 9.4:1 on Ink.
  [Style guide](style-guide.md#buttons)
- **Mission statement length.** At 127 characters it can't fit "one or two lines" at
  `text-display-lg`. [Landing page](landing-page.md#2-organization-mission)
- **Header logo.** The vertical lockup is unreadable at header height.
  [Landing page](landing-page.md#header)
- **Mobile hero height.** The copy and the object don't fit in one 390 by 812 screen.
  [Landing page](landing-page.md#mobile)
- **Footer color.** An Ink footer right under the Ink Call to Action reads as one
  block. [Landing page](landing-page.md#footer)
