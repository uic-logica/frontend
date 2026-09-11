# Style guide

Reusable visual and interaction rules for every page. When a rule comes from the
research, it points to [design-direction.md](design-direction.md) instead of
re-explaining the reference, so this doc can be used on its own by anyone building a
new page. The landing page layout is in [landing-page.md](landing-page.md).

Notes marked **Known issue** came up while building a mockup of the landing page. They
are open, and the [README](README.md#known-issues) lists them all in one place.

## Color

The palette comes from [design-direction.md section 4](design-direction.md#4-palette).
It's written as Tailwind 4 theme tokens. The project's `globals.css` already uses the
CSS-first `@theme` block for its default Next.js tokens, so these extend that block
instead of replacing it.

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

`--color-neutral-white` isn't one of the five research swatches. It's the plain white
the contrast checks already use. Treat it as a second, cooler surface for a card or
module that needs to lift off the warm Paper background. It's never the default page
background.

### Approved pairings

These are the documented contrast ratios. A pairing that isn't listed here isn't
approved until someone checks it.

| Pairing | Ratio | Use |
|---|---|---|
| Ink on Paper | 16.4:1 | Default for all primary reading text |
| Cobalt on Paper | 7.3:1 | Headings, links, borders, rules |
| Cobalt on white | 8.4:1 | Same, on white cards |
| Paper on Cobalt | 7.3:1 | Light text on a Cobalt band (footer, secondary dark band) |
| Jungle Green on Paper | 8.3:1 | Second safe text and link color, for variety in dense content |
| Ink on Cempasúchil | 9.4:1 | Tags, chips, small accent fills |
| Cempasúchil on Ink | 9.4:1 | Accents and focus rings on dark surfaces |
| Rosa on white | 4.6:1 | Buttons, large or bold text. Not small body copy |
| Rosa on Paper, Paper on Rosa | 3.9:1 | Large text and UI components only |
| Rosa on Ink | 4.1:1 | Large text and UI components only |
| Cobalt on Ink | 2.3:1 | Fails. Never text, borders or focus rings on Ink |
| Cempasúchil on Paper or white | 1.7:1, 2.0:1 | Fails. Never text or fine linework on light grounds |

### Usage rules

Ink on Paper is the default for body text.

Cobalt is a text and structure color on light backgrounds: headings, links, borders,
rules. It's also dark enough to be a background with light text on it, so it's the
palette's other legitimate dark surface besides Ink (a secondary dark band, the
footer). It doesn't work as a line color on Ink.

Jungle Green is a second safe text and link color on Paper, so every link or heading
doesn't have to be Cobalt.

Rosa Mexicano is for large or bold text, buttons, borders and icons only. It clears
AA on white and clears the large-text and UI bar on Paper. **Never set small body copy
in Rosa.** A Rosa button's Paper label is only safe if it counts as large text under
WCAG, meaning at least 18.66px bold (14pt) or 24px regular. Don't shrink it below that
without checking contrast again.

> **Known issue:** the button spec below says labels use `text-ui-label`, which is
> 14px. A 14px Paper label on Rosa fails. Either set Rosa button labels at 19px bold
> or larger, or use a white label (white on Rosa is 4.6:1 and passes at any size).
> Not decided yet.

Cempasúchil is a fill and accent color only. Use it as a background behind Ink text
for tags, chips and small accent fills, or as an icon or border color at a size where
the 3:1 UI threshold applies. Never use it as running text or fine linework on Paper
or white.

Don't use more than two of the six colors as dominant surfaces in one screen's worth
of content. Rosa and Cobalt carry most of the page. Cempasúchil and Jungle Green are
supporting accents, not equal partners.

## Type

The direction is a bold Sudtipos display face for headlines and wordmark-adjacent
moments, paired with a clean, very legible sans for everything else
([design-direction.md section 5](design-direction.md#5-type)). The display face is
never used below heading sizes.

**Display candidate: Barricada Pro** (Sudtipos, designed by Eli Castellanos, available
on Adobe Fonts and through MyFonts and YouWorkForThem). It's a bold display face with
a lot of personality, curved serifs and swash details. It fits the "loud but
disciplined" register this direction wants, and it's documented and licensable rather
than a generic system font. The license path is **not settled**: Adobe Fonts' web
embed CDN, or a purchased license we self-host under the performance budget in
`DESIGN.md`. That needs to be confirmed before it goes into the codebase.

Kukulkan (also Sudtipos) was considered and rejected as the main display face. Its
letterforms are drawn from an idealized Mayan aesthetic, so it would read as one
culture standing in for the whole reference set in
[design-direction.md section 2](design-direction.md#2-cultural-references-by-country),
instead of the general sign-painting energy that set calls for. It might still suit a
narrow, deliberately Mesoamerican moment, but not the site default.

**Body and UI candidate: Inter**, self-hosted through `next/font/google`, so there's no
external request at runtime and it fits the performance budget directly. It's very
legible at small sizes and has full Latin diacritic support for Spanish names and
copy. **Work Sans** is a reasonable second choice with a slightly warmer, less
mechanical feel, if Inter reads too neutral once it's on the page.

If neither display candidate clears licensing, hold onto the requirement rather than
the font: a bold face with visible brush or sign-painting character (swashes, ink
traps, or hand-lettering strokes). Never a generic geometric sans doing both display
and body. That way swapping the family later is a font-file change, not a redesign.
The earlier reference doc, [archive/Eddie_DESIGN.md](archive/Eddie_DESIGN.md), used
Archivo Black from Omnibus-Type in Buenos Aires under the SIL Open Font License, which
already meets that requirement.

### Scale

Sizes are a starting `rem` scale (1rem = 16px). In code, use `clamp()` so the display
and heading sizes shrink smoothly between the mobile and desktop values instead of
jumping at a breakpoint.

| Token | Size (mobile to desktop) | Weight | Face | Use |
|---|---|---|---|---|
| `text-display-xl` | 2.5rem to 5rem | Bold | Display | Hero headline only |
| `text-display-lg` | 2rem to 3.5rem | Bold | Display | Section openings (Mission statement, CTA headline) |
| `text-heading-1` | 1.5rem to 2rem | Bold | Display | Sub-section headings (a Mission cell's label, a card's title) |
| `text-heading-2` | 1.25rem to 1.5rem | Semibold | Sans | Card titles, minor headings |
| `text-body-lg` | 1.125rem | Regular | Sans | Hero subhead, lead paragraphs |
| `text-body` | 1rem | Regular | Sans | Default reading text |
| `text-body-sm` | 0.875rem | Regular | Sans | Captions, metadata (timestamps, tags) |
| `text-ui-label` | 0.875rem | Semibold | Sans | Button labels, nav links, form labels |

> **Known issue:** `text-display-lg` doesn't fit LOGICA's real mission statement. It's
> 127 characters. In a 1440px container it still ran four lines at 44px, and 38px was
> the largest size that fit in three. On a 390px screen it ran eight lines at 26px, so
> the 2rem mobile floor is out of reach. See
> [landing-page.md](landing-page.md#2-organization-mission).

## Spacing and grid

The base unit is **4px**, on a linear scale: `space-1` = 4px, `space-2` = 8px,
`space-3` = 12px, `space-4` = 16px, `space-6` = 24px, `space-8` = 32px,
`space-12` = 48px, `space-16` = 64px, `space-24` = 96px. Sections get `space-16` to
`space-24` of vertical padding depending on the viewport. Components stay between
`space-4` and `space-8`.

The grid is 12 columns on desktop (over 1024px), 8 on tablet (640 to 1024px) and 4 on
mobile (under 640px), with a `space-6` gutter at every size. The container maxes out
at 1440px, centered, with side gutters from `space-6` on mobile up to `space-16` on
desktop.

The grid is how the Torres-García grid-cell idea in design-direction.md section 2
actually gets built, not just a layout convenience. Any section made of bordered cells
(the Mission blocks, the Featured Content frame, a card's internal layout) should snap
its cell edges to this same column grid, so "cells with meaning" reads as one system
across the page and not a one-off trick in one section.

## Motion and interaction

This comes from [design-direction.md sections 7 and 9](design-direction.md#7-motion-and-interaction)
and is limited by the technical bar in `DESIGN.md`: CSS first, GSAP only for real
orchestration, Lottie for vector moments, `prefers-reduced-motion` everywhere, and
only `transform` and `opacity` animated.

**Motion has to mean something.** A scroll-triggered reveal says "this section is next
in the story." A hover state says "this is interactive." A card's entrance says "this
is one of a considered set." If an animation doesn't change what the visitor
understands or can do, it doesn't ship. That's the same bar `DESIGN.md` and the org's
lean-code rule already apply to code.

**Triggers.** Section reveals fire once when the section scrolls into view, not every
time it re-enters. Hover and focus states start immediately and reverse immediately,
with no delay. The one exception is the hero mark, which plays once when the hero
first paints, whatever the scroll position.

**CSS by default.** Section reveals (fade or slide up on scroll), hover and focus
transitions, and the header's transparent-to-solid swap are all native CSS:
`@starting-style`, `animation-timeline: scroll()` and plain transitions. None of them
need JavaScript.

**Where GSAP earns its place.** The Upcoming Events scroll-snap row, if it needs eased,
controllable scroll-to beyond native scroll-snap. A staggered reveal across the
Mission grid cells that needs each cell's icon and label to arrive in a set order. Not
a single section's fade-in; that's CSS.

**Where Lottie earns its place.** The hero mark's load-in (the branching circuit
tracing itself in) is the clearest case, shipped as a compressed `.lottie` file, not
raw JSON. Empty-state illustrations (no upcoming events, no featured content) are a
second reasonable use, kept small and optional. The empty state's text has to make
sense without them.

**Reduced motion.** Every animation above has a static version. Reveals become simple
opacity fades or appear instantly. The mark's load-in becomes a still of the finished
object. Hover states keep their color and border change but drop any movement. Build
this with `prefers-reduced-motion: reduce` from the start, not after the animated
version ships.

## Imagery and art direction

**Member and event photos** should be real photographs in warm, natural light,
matching the hero's warm materials rather than cool studio lighting. No heavy filters
or presets that shift skin tones. Keep crop and aspect ratio consistent within a
context (square for Featured Content and Team, a wider ratio for event photos) so a
grid or spotlight never has to fight a mismatched image. No stock photography and no
AI-generated images, full stop.

**The pattern language** is one reusable system, not a new graphic per section. It's a
small set of abstract geometric motifs in the spirit of the mola and Wayuu references,
built from straight lines, hard angles and palette colors. It should never be a
literal or traceable copy of a specific textile or artist's work. Use it for section
divider details, low-opacity background texture behind a section's content (never
strong enough to hurt readability behind body text), and the accent edge on an
Upcoming Events card. Treat it as a small, versioned library of SVG motifs that get
reused and recolored, not something redrawn for each section.

## Icons

Icons use the same line weight and geometric vocabulary as the pattern system, so
they never look like a separately sourced set. There are two kinds, both drawn, never
emoji.

**Relief icons**, from design-direction.md section 9, are for a few featured small
content units, mainly the Mission cells. They're flat primary-color blocks with a
slight carved or embossed edge (the hard offset shadow described under Components),
echoing the Torres-García pictographs at icon size.

**Line icons** are for everything else (nav, tags, UI affordances). Use one stroke
weight (2px at 24px icon size), squarish line ends rather than fully rounded ones, and
don't mix filled and line icons on the same screen.

## Components

One rule for every component: **no pill shapes.** Corners are sharp or lightly rounded
(4 to 8px, consistent per component type), never a full capsule.

### Buttons

- Radius: 6px.
- Primary: Rosa fill, Paper label, bold, `text-ui-label` size or larger (see the Rosa
  rule and known issue under Color).
- Secondary: transparent fill, 2px Cobalt border, Cobalt label.
- Hover darkens the fill one step (primary) or fills it solid (secondary).
- Focus shows a visible 2px Cobalt outline, offset from the button edge, and it's never
  removed.
- Active compresses the offset shadow (see Cards) by half.
- Disabled drops to 40% opacity, loses the hover and active treatment, and uses
  `aria-disabled` so it isn't a silently dead control.

> **Known issue:** the Cobalt focus ring is 2.3:1 on Ink, under the 3:1 a focus
> indicator needs, so it disappears on the hero, the CTA band and the footer. Dark
> surfaces need a different ring color. Cempasúchil is 9.4:1 on Ink. The same goes for
> a secondary button's Cobalt border and label on Ink; Paper works there. Not decided
> yet.

### Cards

Used for Upcoming Events, the Featured Content frame, and later the Team page.

- Radius: 4px.
- Border: 1px Ink at 15% opacity on a Paper card, or 1px Paper at 20% opacity on an Ink
  card.
- Elevation: a hard offset shadow, 2px right and 2px down, no blur, Ink at 12%
  opacity. Not a soft blurred drop shadow. This is on purpose: the card reads as a
  physical, cut or printed object sitting slightly above the page, which matches the
  relief and material language from design-direction.md section 9, instead of the
  floaty shadow of a generic SaaS card.
- Hover (when the whole card is a link, as in Events and Team): the offset shadow grows
  by 2px in the same direction, so it "lifts toward you." No scale transform.

### Tags and chips

- Radius: 4px.
- Default: Cempasúchil fill, Ink text.
- Quieter alternate: Jungle Green outline and text, transparent fill.

### Form inputs

Used on other pages, but documented here so this guide stands alone.

- Radius: 4px.
- Border: 1px Ink at 30% opacity at rest, 2px Cobalt on focus. The label is always
  visible above the field. A placeholder never stands in for a label.
- Error: the border switches to 2px Rosa, and the validation message sits in Ink text
  (not Rosa, so it stays readable at small size) between the label and the field.
- Disabled: 40% opacity, `aria-disabled`, no focus ring.

## Accessibility bar

Checked in review, line by line, not taken on trust. When `CONTENT.md` refers to "the
contrast bar" and "the minimum target size set in the design doc," this is the section
it means.

- Text contrast of 4.5:1 or better. Large text (24px and up, or 18.66px bold and up)
  at 3:1 or better. Interface boundaries and focus indicators at 3:1 or better (WCAG
  1.4.3 and 1.4.11). Only pairings in the [approved list](#approved-pairings) are
  approved.
- Interactive targets at least 44 by 44px, above the 24 by 24 floor in WCAG 2.5.8, with
  at least 8px between neighboring targets.
- Visible focus on everything that can take focus.
- A real `<label>` on every input. Placeholder text is never a label.
- The error summary at the top of a form takes focus, the page `<title>` gets an
  "Error: " prefix, and the summary's wording matches the inline wording exactly
  (`CONTENT.md` section 8).
- Color is never the only way meaning is shown. Post types get a label as well as a
  left rule color, calendar categories get a label as well as a fill, and attendance
  states are written out as "Attended" or "RSVP'd, didn't check in."
- `prefers-reduced-motion` is honored everywhere.
- The check-in flow and form flows can be completed with a keyboard alone.
