# LOGICA Style Guide

Reusable visual and interaction rules, independent of any one page. Where a
rule traces back to research, it points at `design-direction.md` rather than
re-explaining the reference; this document only covers the rule itself, so it
can be used on its own by anyone building a new page later. Layout for the
landing page specifically lives in `mockup.md`; the reasoning connecting the
two lives in `design.md`.

## Color

The palette is final, pulled from `design-direction.md` section 4. It is
encoded below as Tailwind 4 theme tokens (the project's `globals.css` already
uses the CSS-first `@theme` block for its default Next.js tokens; these extend
that same block rather than replacing it).

```css
@theme {
  --color-primary-rosa: #e4007c;      /* Rosa Mexicano */
  --color-primary-cobalt: #0047ab;    /* Cobalt Blue */
  --color-accent-cempasuchil: #f2a900; /* Cempasúchil Yellow */
  --color-accent-jungle: #1b4d3e;     /* Jungle Green */
  --color-neutral-ink: #12100e;
  --color-neutral-paper: #f5ede1;
  --color-neutral-white: #ffffff;
}
```

`--color-neutral-white` is not in the original five-swatch table; it is the
plain white already used in the contrast checks (`design-direction.md` notes
contrast against both Paper and white). Treat it as a second, cooler neutral
surface, for a card or module that needs to lift slightly off the warmer Paper
page background, never as the default body background.

### Usage rules (from the documented contrast findings; do not re-derive)

- **Ink on Paper** is the default body text pairing (16.4:1). Use it for all
  primary reading text.
- **Cobalt** is a text and structure color on light backgrounds (7.3:1 on
  Paper, 8.4:1 on white): headings, links, borders, rules. It also works as a
  fill for a dark surface (a secondary dark band, the footer) since it is dark
  enough to hold light text on top; treat it as the palette's other legitimate
  dark background besides Ink, not only as a light-background text color.
- **Jungle Green** is a second safe text and link color on Paper (8.3:1), useful
  for variety in dense content so every link or heading is not Cobalt.
- **Rosa Mexicano** is for large or bold text, buttons, borders, and icons
  only. It clears AA against white (4.6:1) and against Paper for large
  text/UI components only (3.9:1, fails the small-text bar). **Never set small
  body copy in Rosa.** A Rosa-filled button's label is safe under this same
  rule as long as the label is set bold and at a size that qualifies as large
  text (18px+ bold, or 24px+ regular); do not shrink a Rosa button's label
  below that without re-checking contrast.
- **Cempasúchil** is a fill and accent color only, never text on a light
  background (roughly 2:1 on white, 1.7:1 on Paper, both fail outright). Use
  it as a background behind Ink text (9.4:1, passes easily) for tags, chips,
  and small accent fills, or as an icon/border color at a size where the 3:1
  UI-component threshold applies, never as running text or fine linework
  directly on Paper or white.
- Never place more than two of the six colors as dominant surfaces in one
  screen's worth of content; the primary pair (Rosa and Cobalt) carries most
  of the page, Cempasúchil and Jungle Green are supporting accents, not equal
  partners.

## Type

Pairing direction: a bold Sudtipos display face for headlines and
wordmark-adjacent moments, paired with a clean, highly legible sans for
everything else, per `design-direction.md` section 5. The display face is
never used below heading sizes.

**Display candidate: Barricada Pro** (Sudtipos, designed by Eli Castellanos,
available on Adobe Fonts and through MyFonts/YouWorkForThem). It is a bold,
high-personality display face with curved serifs and swash detailing, built
for exactly the "loud but disciplined" register this direction calls for, and
it is technically documented and licensable rather than a generic system font.
Confirming the license path (Adobe Fonts' web-embed CDN versus a purchased
desktop/web license for self-hosting, per the performance budget in
`DESIGN.md`) is a follow-up task before implementation, not settled here.
**Kukulkan** (also Sudtipos) was considered and rejected as the primary
candidate: its letterforms are explicitly drawn from an idealized Mayan
aesthetic, which reads as one specific culture standing in for the whole
reference set in section 2 of `design-direction.md` rather than the general
sign-painting energy that set calls for. It may still be worth a look for a
narrow, deliberately Mesoamerican-specific moment, but it should not be the
site's default display face.

**Body/UI candidate: Inter**, self-hostable through `next/font/google` (no
external request at runtime, satisfies the performance budget directly), with
excellent legibility at small sizes and full Latin diacritic support for
Spanish names and copy. **Work Sans** is a reasonable second option with a
slightly warmer, less mechanical character if Inter reads too neutral once
type is on the actual page.

If neither display candidate clears licensing review, the requirement to hold
onto is: a bold face with visible brush- or sign-painting-derived character
(swashes, ink traps, or hand-lettering ductus), never a generic geometric
sans doing double duty as both display and body, so swapping the family later
is a font-file change, not a redesign.

### Scale

All sizes below are a starting `rem` scale (1rem = 16px); use `clamp()` in
implementation so the display and heading tiers shrink between the values
given for mobile and desktop rather than jumping at a breakpoint.

| Token | Size (mobile -> desktop) | Weight | Face | Use |
|---|---|---|---|---|
| `text-display-xl` | 2.5rem -> 5rem | Bold | Display | Hero headline only |
| `text-display-lg` | 2rem -> 3.5rem | Bold | Display | Section-opening headlines (Mission statement, CTA headline) |
| `text-heading-1` | 1.5rem -> 2rem | Bold | Display | Sub-section headings (a Mission cell's label, a card's title) |
| `text-heading-2` | 1.25rem -> 1.5rem | Semibold | Sans | Card titles, minor headings |
| `text-body-lg` | 1.125rem | Regular | Sans | Hero subhead, lead paragraphs |
| `text-body` | 1rem | Regular | Sans | Default reading text |
| `text-body-sm` | 0.875rem | Regular | Sans | Captions, metadata (timestamps, tags) |
| `text-ui-label` | 0.875rem | Semibold | Sans | Button labels, nav links, form labels |

## Spacing and grid

Base unit: **4px**, expressed as a linear scale (`space-1` = 4px, `space-2` =
8px, `space-3` = 12px, `space-4` = 16px, `space-6` = 24px, `space-8` = 32px,
`space-12` = 48px, `space-16` = 64px, `space-24` = 96px). Section-level
vertical padding uses `space-16` to `space-24` depending on viewport;
component-level padding stays at `space-4` to `space-8`.

**Grid.** A 12-column grid on desktop (>1024px), 8 columns on tablet
(640-1024px), 4 columns on mobile (<640px), with a consistent gutter of
`space-6` between columns at all three. Container max-width is 1440px,
centered, with side gutters of `space-6` (mobile) up to `space-16` (desktop).

This grid is not just a layout convenience; it is the direct mechanism for the
Torres-García grid-cell logic in `design-direction.md` sections 2 and 8. Any
section built as a set of bordered cells (Organization Mission's blocks, a
Featured Content frame, a card's internal layout) should snap its cell
boundaries to this same column grid, so the "cells with meaning" idea reads as
one system across the page rather than a one-off treatment in a single
section.

## Motion and interaction

Built from `design-direction.md` sections 7 and 10, and constrained by the
technical bar in `DESIGN.md` (CSS-first, GSAP reserved for real orchestration,
Lottie for vector moments, `prefers-reduced-motion` required everywhere,
animate `transform`/`opacity` only).

- **What animates and why.** Motion marks a relationship, not a decoration: a
  scroll-triggered reveal exists to say "this section is next in the story,"
  a hover state exists to say "this is interactive," a card's entrance exists
  to say "this is one of a considered set." If an animation does not change
  what the visitor understands or can do, it does not ship, the same bar
  `DESIGN.md` and the org's own lean-code convention already apply to code.
- **Trigger model.** Section-level reveals trigger on scroll into view, once,
  not on every re-entry into the viewport. Hover and focus states trigger
  immediately and reverse immediately on exit, no delay. The one load-in
  moment that is an exception is the hero's mark, which plays once on first
  paint of the hero, independent of scroll.
- **CSS-first, by default.** Section reveals (fade/slide-up on scroll),
  hover/focus transitions, and the header's transparent-to-solid swap are all
  native CSS: `@starting-style`, `animation-timeline: scroll()`, and simple
  transitions. None of these need JavaScript.
- **Where GSAP is justified.** The Upcoming Events horizontal scroll-snap row,
  if it needs eased, controllable scroll-to behavior beyond native
  scroll-snap. Any staggered multi-element reveal that needs precise
  sequencing across the Organization Mission grid cells (each cell's icon and
  label arriving in a deliberate order, not simultaneously). Not for a single
  section's fade-in; that is CSS.
- **Where Lottie is justified.** The hero mark's load-in animation (the
  branching circuit tracing itself in, per `design-direction.md` section 7)
  is the clearest candidate, delivered as a compressed `.lottie` file, not raw
  JSON. Empty-state illustrations (no upcoming events, no featured content) are
  a second reasonable use, kept small and optional, never load-bearing for
  understanding the empty state's text.
- **Reduced motion.** Every animation above has a static equivalent: reveals
  become simple opacity fades or appear instantly, the mark's load-in becomes
  a static rendered frame of the finished object, hover states keep their
  color/border change but drop any movement. Implement via
  `prefers-reduced-motion: reduce`, never as an afterthought once the
  animated version ships.

## Imagery and art direction

**Real photography (member and event photos).** Warm, natural light,
consistent with the hero's warm-materials direction rather than cool studio
lighting; no heavy filter or preset that shifts skin tones away from
accurate. Consistent crop and aspect ratio within a given context (square for
Featured Content and Team, a wider ratio for event photos) so a grid or a
spotlight module never has to fight an inconsistent source image. No stock
photography and no AI-generated images, full stop, per the hard-ban list.

**Decorative geometric pattern language.** A single reusable system, not a
one-off graphic per section: a small set of abstracted geometric motifs in the
spirit of the mola and Wayuu references in `design-direction.md` section 2,
built from straight lines, hard angles, and the palette's colors, never a
literal or traceable reproduction of a specific textile or artist's work. Use
it for section-divider details, low-opacity background texture behind a
section's content (never behind body text at a strength that reduces
readability), and the accent edge on an Upcoming Events card. Treat it as a
small, versioned asset library (a handful of SVG motifs, reused and recolored)
rather than something a designer redraws per section.

## Iconography

Line weight and construction match the same geometric vocabulary as the
decorative pattern system above, so an icon never reads as a mismatched,
separately-sourced set. Two registers, both drawn, never emoji:

- **Dimensional relief icons**, per `design-direction.md` section 10, for a
  small number of "featured small content units," specifically the
  Organization Mission cells. Built from flat primary-color blocks with a
  slight carved/embossed edge treatment (see Components below for the shadow
  language that produces this), echoing the Torres-García pictograph idea at
  icon scale.
- **Simple line icons** everywhere else (nav, tags, UI affordances): a
  consistent stroke weight (2px at 24px icon size), square-ish terminals
  rather than fully rounded ones, and no filled/line inconsistency within a
  single screen.

## Components

Shape rule that applies to every component below: **no pill shapes.**
Corners are sharp or lightly rounded (4-8px radius, consistent per component
type below), never a fully rounded capsule.

**Buttons.**
- Radius: 6px.
- Primary: Rosa Mexicano fill, Paper-colored label text, bold, `text-ui-label`
  size or larger (see the color contrast rule above).
- Secondary: transparent fill, 2px Cobalt border, Cobalt label text.
- States: hover darkens the fill (primary) or fills solid (secondary) by one
  step; focus shows a visible 2px Cobalt outline offset from the button edge,
  never removed; active compresses the offset shadow described below by half;
  disabled drops to 40% opacity and removes the hover/active treatment
  entirely, with `aria-disabled` rather than a silently non-functional
  control.

**Cards** (Upcoming Events, Featured Content's frame, Team later).
- Radius: 4px.
- Border: 1px Ink at 15% opacity on a Paper card, or 1px Paper at 20% opacity
  on an Ink card.
- Elevation: a hard-edged offset shadow (2px right, 2px down, no blur, Ink at
  12% opacity), not a soft blurred drop shadow. This is a deliberate choice,
  not a default: it reads as a physical, cut or printed object sitting
  slightly proud of the page, consistent with the relief and dimensional
  material language validated in `design-direction.md` section 10, rather
  than the soft, floaty shadow language of a generic SaaS card.
- Hover (where a card is a link, as in Events and Team): the offset shadow
  grows by 2px in the same direction, reinforcing "lifting toward you," not a
  scale transform.

**Tags and chips.**
- Radius: 4px.
- Default: Cempasúchil fill, Ink text (documented safe pairing).
- Alternate: Jungle Green outline, Jungle Green text, transparent fill, for a
  tag that should read as quieter than the default.

**Form inputs** (used on other pages; documented here so this guide stands
alone).
- Radius: 4px.
- Border: 1px Ink at 30% opacity at rest; 2px Cobalt on focus, with the label
  always visible above the field, never a placeholder standing in for a
  label.
- Error state: border switches to Rosa Mexicano at 2px, with the validation
  message in Ink text (not Rosa, to keep the message itself readable at small
  size) directly between the label and the field.
- Disabled: 40% opacity, `aria-disabled`, no focus ring.
