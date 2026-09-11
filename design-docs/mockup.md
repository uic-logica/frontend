# LOGICA Landing Page: Mockup

This document describes how the landing page is put together: section order, what
lives in each section, roughly how it is arranged, and how it responds at mobile
width. It does not explain colors, type, or spacing values (see
[`style-guide.md`](style-guide.md)) and it does not explain why a layout choice
exists (see [`design.md`](design.md)). Section order and content follow
`CONTENT.md` section 1 exactly.

Two structural elements sit outside `CONTENT.md`'s five named sections because
every page needs them: a persistent header and a footer. Both are described
briefly below, then the five content sections in order, with the hero (part of
Introduction to LOGICA) broken out as its own subsection since it carries the
most visual weight on the page.

## Global frame

**Header.** Fixed to the top of the viewport. Left: the LOGICA lockup mark
(`logica-lockup.svg`), sized small, acting as the home link. Right: a row of
text links, Team, Calendar, Sign In, plus a small chevron-free nav that does not
try to list every page in `CONTENT.md`, just the ones the landing page's Call to
Action also points at. Over the hero, the header sits on a transparent field with
Paper-colored (cream) text and mark, since the hero background is dark. Once the
page scrolls past the hero into the Paper-background sections, the header
becomes a solid Paper bar with Ink text, so it never sits illegibly against
whatever content is behind it. At mobile width, the text links collapse into a
single menu control on the right; opening it drops a full-width panel below the
header rather than a slide-in drawer, keeping the interaction simple and
keyboard-navigable.

**Footer.** A single Ink-background band below the Call to Action: the lockup
mark, a short line restating who LOGICA serves (reusing, not rewriting, the
Introduction copy), a link list (Team, Calendar, Sign In, and a contact or
social link if one exists), and a copyright line. One column of links on mobile,
stacked under the mark.

**Container and rhythm.** Content sits inside a centered container with side
gutters at every width; the grid that divides each section internally is
defined in the style guide, not here. The page reads as one continuous scroll
with exactly one background transition: dark (hero) to Paper (everything after
it). No section after the hero returns to a dark background except the Call to
Action band and the footer, both described below, so "dark" reads as bookends,
not a recurring motif.

## 1. Introduction to LOGICA (the hero)

This section is the hero in full. `CONTENT.md` asks for three things here (the
LOGICA name, a brief description, and who LOGICA serves), and all three live in
this one full-viewport-height block rather than being split into a hero plus a
second "about" block underneath.

**Layout, desktop.** A two-zone split within the section, roughly 55/45. The
left zone carries the copy stack, top to bottom: the LOGICA wordmark (small,
already identified by the header, so this is the full name spelled out as a
line of display type, not a repeat of the logo), a large headline that states
what LOGICA is and does in LOGICA's own words (see `design-direction.md`
section 6 for the actual language to draw from), a shorter body line naming who
it serves, and a single primary action (Sign In, or a "See what's coming up"
link into Upcoming Events, whichever the board decides is the stronger door).
The right zone is the mark-as-object stage: the branching-circuit medallion,
rendered as the literal dimensional object validated in `design-direction.md`
section 10, not the flat production SVG in `public/`. It sits large, slightly
right of center, partially bleeding off the right edge of the viewport so it
reads as an object extending past the frame rather than a centered icon. Behind
it, soft warm ambient light falls across the dark field, the way a lit object
would sit in a room, not a flat color or a hard vignette.

**The dark-to-light transition.** The hero occupies close to a full viewport
height on first load. Its background is Ink for roughly the first three
quarters of that height, then transitions to Paper across the remaining
quarter, so the section itself carries the seam rather than handing off a hard
cut to whatever comes after it. The transition is a controlled gradient, not a
soft photographic fade: it moves in a straight vertical band and is capped by a
single horizontal rule in Cobalt Blue marking the exact seam line, a grid-literal
edge in the Torres-García sense rather than a blurred vignette. The warm ambient
light around the object should feel like it is casting into that gradient, so
the transition reads as "the room gets brighter," not as an unrelated color
swap layered on top. Below the seam, the Organization Mission section begins on
solid Paper.

**Layout, mobile.** Single column, stacked top to bottom: wordmark, headline,
body line, primary action, then the object render, scaled down and centered
rather than bleeding off an edge (there is no spare width to bleed into). The
object keeps its warm lighting treatment. The dark-to-light gradient still
runs, compressed into a shorter vertical distance since the whole section is
shorter on a narrow viewport; the Cobalt seam rule stays a full-width line at
the same relative position.

## 2. Organization Mission

**Layout, desktop.** A bounded grid, not a paragraph: one wide top cell holding
the mission statement itself, set in a single confident line or two, followed
by a row of three or four equal-width cells below it, one per goal or one per
thing LOGICA provides to members. Every cell has a visible border (a thin
Cobalt or Ink rule, consistent with the Torres-García grid-cell logic this
section is built on), and one cell in the row carries a solid Cempasúchil fill
rather than a bordered outline, the way a Torres-García canvas fills one cell
with flat color among the pictograph cells. Each of the lower cells carries a
small dimensional relief icon above its short label and one line of
description, per the icon direction validated in `design-direction.md` section
10.

**Layout, mobile.** The grid collapses to a single column: the mission
statement cell stays full width at the top, then each goal/provision cell
stacks full width below it in the same order, keeping its border and icon
treatment. The one filled accent cell keeps its fill; it does not need to stay
in the same position in the stack, but it should not land first, so the section
still opens on the mission statement rather than a color block.

## 3. Upcoming Events

**Layout, desktop.** A horizontally scrolling row of event cards, three to four
visible at a time with scroll-snap so a card never sits half-cut at rest. Each
card is a self-contained module: a large date block (day number prominent, in
Cobalt, month and weekday smaller above or below it), the event name, time and
location on one line, a short description, and a "View event" link to the event
detail page. Each card also carries one unique accent, a color from the palette
or a small piece of the geometric pattern language along one edge, so the row
reads as a set of individually considered instances (the mola/Wayuu logic
described in `design-direction.md` section 2), not one template stamped
out identically. A pair of arrow controls at the row's ends supports scroll for
non-touch input; the row is native-scrollable so touch and trackpad users never
need them.

**Layout, mobile.** The same card, one at a time, full width, in a swipeable
horizontal scroll-snap row rather than a vertical stack, so the "repeating set
you page through" feeling survives the width change instead of turning into an
ordinary list.

**Empty state.** Per `CONTENT.md`, if there are no upcoming events the row is
replaced with a single centered message inside the same card-shaped frame ("No
upcoming events. Check back soon.") rather than leaving a blank gap, so the
section still occupies its place in the page's rhythm.

## 4. Featured Content

This is the page's one deliberately singular, "framed object" section, not
another card grid, per `design-direction.md` section 3's spotlight mechanism.

**Layout, desktop.** A single large module, not a repeating grid: an image
(the featured member's photo) on one side, roughly 45% of the section width,
and the content on the other, name, what they did, a short real description,
and a link to their profile page. The whole module sits inside a visible frame,
a thin border with generous internal padding, closer to a piece hung on a wall
than a content card, reinforcing that this is the page's one "art object"
moment. If more than one piece of featured content exists at a time, a small
row of dot or tab controls beneath the module lets a visitor step through them
one at a time; the section never shows two at once, since the whole point is a
single spotlight, not a feed.

**Layout, mobile.** The image stacks above the text, full width, frame border
intact. Stepping controls (if more than one item) move to sit directly under
the module.

## 5. Call to Action

**Layout, desktop and mobile alike.** A full-width band, the second and last
dark moment on the page, carrying the most Rosa Mexicano of any section (as a
large accent shape or the button fill, not the whole band's background, per the
contrast rules in the style guide). Centered content: a specific headline
naming what joining actually gets someone, one supporting line, and two
actions side by side on desktop (a primary button and a secondary text link),
stacked full width on mobile. The links point at the pages `CONTENT.md`
specifies: Team, Calendar, Sign In.

## Extending the pattern to other pages

Not designed in this pass, per scope, but the same system extends cleanly:

- **Team.** The board-member grid reuses the Upcoming Events card logic (a
  repeating, individually accented module) rather than the Featured Content
  singular-frame treatment, since Team is a full roster, not a spotlight.
- **Calendar.** The Upcoming Events and Past Events lists reuse the same event
  card from the landing page; the calendar grid view is a new component this
  document does not cover.
- **Sign-In, Profile, Feed, Attendance, Forms.** All inherit the color,
  type, spacing, and component rules in `style-guide.md` directly; none of
  their page-specific layouts are designed here.
