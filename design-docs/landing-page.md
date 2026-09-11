# Landing page

How the landing page is put together: section order, what goes in each section, how
it's arranged, how it changes at mobile width, and why. Section order and content
follow `CONTENT.md` section 1 exactly. Colors, type and spacing values are in
[style-guide.md](style-guide.md). The research behind the "why" notes is in
[design-direction.md](design-direction.md).

Every page also needs a persistent header and a footer, which sit outside the five
sections `CONTENT.md` names. They come first below, then the five sections in order.
The hero is part of Introduction to LOGICA, but it gets the most detail because it
carries the most visual weight.

## Header, footer and page rhythm

### Header

Fixed to the top of the viewport. On the left, the LOGICA logo, small, as the home
link. On the right, text links to Team, Calendar and Sign In. The nav has no dropdowns
and doesn't try to list every page in `CONTENT.md`, only the ones the Call to Action
also links to.

Over the hero, the header sits on a transparent background with Paper (cream) text and
logo, because the hero is dark. Once the page scrolls past the hero into the Paper
sections, it becomes a solid Paper bar with Ink text, so it's never hard to read
against whatever is behind it.

At mobile width, the links collapse into one menu control on the right. Opening it
drops a full-width panel below the header rather than sliding in a drawer, which keeps
it simple and keyboard-friendly.

> **Known issue:** the spec calls for `logica-lockup.svg` here, but that lockup is
> vertical (the mark above the word LOGICA). At header height the word ends up about
> 5px tall. The mark on its own, with LOGICA set next to it in the display face, works
> better in the header. The full lockup fits the footer.

### Footer

A single Ink band below the Call to Action with the logo, a short line about who
LOGICA serves (reusing the Introduction copy, not rewriting it), links (Team,
Calendar, Sign In, and a contact or social link if one exists), and a copyright line.
On mobile the links sit in one column under the logo.

> **Known issue:** an Ink footer directly under the Ink Call to Action band reads as
> one large dark block. It needs a visible separator between them, or the footer can
> use Cobalt, which the style guide allows as a dark surface. Not decided yet.

### Page rhythm

Content sits in a centered container with side gutters at every width. The grid inside
each section is defined in the style guide.

The page is one continuous scroll with exactly one background change: dark in the
hero, Paper for everything after it. The only later sections that go dark again are
the Call to Action and the footer, so dark reads as the two ends of the page, not a
repeating motif.

## 1. Introduction to LOGICA (the hero)

This section is the whole hero. `CONTENT.md` asks for three things here: the LOGICA
name, a short description, and who LOGICA serves. All three go in this one
full-height block instead of a hero plus a separate "about" block underneath.

### Desktop

A two-part split, roughly 55/45.

The left side holds the copy, top to bottom:

1. The LOGICA name as a small line of display type. The header already shows the logo,
   so this spells the name out rather than repeating the logo.
2. A large headline that says what LOGICA is and does, in LOGICA's own words (see
   [design-direction.md section 6](design-direction.md#6-voice-and-tone)).
3. A shorter line saying who it serves.
4. One primary action: Sign In, or a "See what's coming up" link down to Upcoming
   Events. The board decides which is the stronger door.

The right side is the stage for the mark as an object: the branching-circuit
medallion shown as the physical, lit object from
[design-direction.md section 9](design-direction.md#9-the-hero-tested-with-ai-image-exploration),
not the flat SVG in `public/`. It sits large, slightly right of center, and runs off
the right edge of the viewport so it reads as an object extending past the frame
rather than a centered icon. Soft, warm light falls across the dark background behind
it, the way a lit object sits in a room. Not a flat color or a hard vignette.

### The dark-to-light transition

On first load the hero is close to a full viewport tall. Its background is Ink for
about the first three quarters, then shifts to Paper over the last quarter, so the
hero carries the seam itself instead of cutting hard into the next section.

The shift is a controlled gradient in a straight vertical band, not a soft
photographic fade. A single horizontal Cobalt rule marks the exact seam, a hard,
grid-literal edge in the Torres-García sense rather than a blur. The warm light around
the object should feel like it spills into that gradient, so the change reads as "the
room gets brighter" and not as an unrelated color swap. The Organization Mission
section starts on solid Paper right below the seam.

### Mobile

One column, top to bottom: the name, headline, body line, primary action, then the
object, scaled down and centered. It doesn't run off an edge because there's no spare
width. The object keeps its warm lighting. The dark-to-light gradient still runs,
compressed into a shorter distance, and the Cobalt seam stays a full-width line in the
same relative position.

> **Known issue:** on a 390 by 812 screen, the name, headline, body, button and object
> don't all fit in one viewport. The object lands below the fold.

### Why it looks like this

The hero states plainly who LOGICA is and who it serves, in LOGICA's own words. This
is where the voice does the most work, backed by bold type and a primary-color moment
instead of a generic stock-photo tech hero.

The warm-lit object and the dark-to-light change come straight from the finding in
design-direction.md section 9. The first try at this hero used cold museum staging and
felt intimidating. Warm materials and soft light gave the "exclusive and welcoming at
once" feeling the whole concept is after.

The Cobalt seam rule isn't decoration. It's Torres-García's habit of using a hard,
deliberate line instead of a soft blur, used at the one place on the page where two
backgrounds meet.

### The 3D object and the performance budget

The research finding is a real, physically lit sculpture, and that shouldn't be
watered down. But rendering it as a live, animated 3D scene in the browser (WebGL or
three.js) conflicts with `DESIGN.md`'s bar: Lighthouse 90+ and LCP under 2.5s on a
throttled connection are hard to hit with a real-time 3D scene as the hero's largest
element, especially on the mid-range phones student visitors are likely using.

So the plan is a pre-rendered asset: a few high-quality baked stills, or a short,
heavily compressed looping video or image sequence, matching the exploration. A live
3D version stays a possible future upgrade for capable devices, not the thing the page
depends on. The finding stays the same; only the delivery changes.

This asset doesn't exist yet. Someone with 3D or motion skills has to make it. See
the [README](README.md#open-questions).

## 2. Organization Mission

### Desktop

A bounded grid, not a paragraph. One wide top cell holds the mission statement, set
in one or two confident lines. Below it is a row of three or four equal-width cells,
one per goal or per thing LOGICA gives its members.

Every cell has a visible thin Cobalt or Ink border, following the Torres-García
grid-cell idea the section is built on. One cell in the row has a solid Cempasúchil
fill instead of an outline, the way a Torres-García canvas fills one cell with flat
color among the pictograph cells. Each lower cell has a small relief icon above its
short label and one line of description (icon direction in design-direction.md
section 9).

> **Known issue:** LOGICA's mission statement is 127 characters, so "one or two lines"
> at `text-display-lg` doesn't happen in a 1440px container. It still ran four lines
> at 44px, and 38px was the largest size that fit in three. Either accept three lines
> at a smaller size, or use a shorter version of the statement in this cell.

### Mobile

The grid becomes one column. The mission statement cell stays full width at the top,
and each goal cell stacks full width below it in the same order, keeping its border and
icon. The filled cell keeps its fill. It can move in the stack, but it shouldn't land
first, so the section still opens on the mission statement and not a block of color.

> **Known issue:** on a 390px screen the statement ran eight lines at 26px, so the
> 2rem floor of `text-display-lg` can't be used here.

### Why it looks like this

The bordered grid with one filled cell is the most literal use of Torres-García's
Constructive Universalism on the page: a strict structure that still feels warm,
thanks to the one Cempasúchil cell and the relief icons, instead of reading as cold
minimalism. Mission, goals and what LOGICA provides as clearly bounded blocks is the
"logic" half of the concept made visible.

It's also the only section built as a visible grid of bordered cells, so the
reference stays readable instead of getting spread across every section.

## 3. Upcoming Events

### Desktop

A horizontally scrolling row of event cards, three or four visible at once, with
scroll-snap so no card sits half cut off at rest.

Each card stands on its own:

- A large date block, with the day number prominent in Cobalt and the month and
  weekday smaller above or below it
- The event name
- Time and location on one line
- A short description
- A "View event" link to the event detail page

Each card also carries one unique accent, either a palette color or a small piece of
the pattern language along one edge, so the row reads as a set of individually
considered cards and not one template stamped out four times.

Arrow controls at the ends of the row help with mouse and keyboard scrolling. The row
scrolls natively, so touch and trackpad users never need them.

### Mobile

The same card, one at a time, full width, in a horizontal row you swipe through with
scroll-snap. Not a vertical stack, so the "set you page through" feeling survives the
smaller width instead of turning into an ordinary list.

### Empty state

Per `CONTENT.md`, if there are no upcoming events, the row is replaced with one
centered message inside the same card-shaped frame ("No upcoming events. Check back
soon."). No blank gap, so the section keeps its place in the page's rhythm.

### Why it looks like this

The individually accented repeating card is the mola and Wayuu logic from
design-direction.md section 2: a shared template where every instance still carries a
visible, deliberate variation. The scroll-snap row, rather than a static grid, is what
lets that variation be seen one card at a time, the way a mola panel or a Wayuu
mochila rewards being looked at on its own within a set.

## 4. Featured Content

This is the page's one deliberately singular section, a framed object rather than
another card grid. It's the spotlight from
[design-direction.md section 3](design-direction.md#3-the-community-spotlight).

### Desktop

One large module, not a repeating grid. The featured member's photo takes one side,
about 45% of the section width. The other side has their name, what they did, a short
real description, and a link to their profile page.

The whole module sits inside a visible frame: a thin border with generous padding,
closer to a piece hung on a wall than a content card. If there's more than one
featured item at a time, a small row of controls under the module lets visitors step
through them one at a time. The section never shows two at once, because the point is
a single spotlight, not a feed.

### Mobile

The photo stacks above the text, full width, with the frame border kept. Step controls,
if there's more than one item, sit directly under the module.

### Why it looks like this

This section is deliberately the odd one out. The spotlight only works if it doesn't
compete with the Events row's repeating set. Giving one real member's real result the
visual weight of an art object is the honest version of the role-model idea: no
invented metric, no manufactured testimonial, just one real name and one real story.

## 5. Call to Action

### Desktop and mobile

A full-width band, the second and last dark section on the page. It carries more Rosa
Mexicano than any other section, as a large accent shape or the button fill, not as
the band's background (see the Rosa contrast rules in the style guide).

The content is centered: a specific headline that names what joining actually gets
someone, one supporting line, and two actions. On desktop they sit side by side (a
primary button and a secondary text link). On mobile they stack full width. The links
go to the pages `CONTENT.md` names: Team, Calendar, Sign In.

### Why it looks like this

The heaviest Rosa on the page is here on purpose. This is the moment the page asks
someone to join, so it's where the "exclusive" half of the concept makes the most
sense: something worth wanting in on, not just an invitation. That's also why the
headline has to be specific. "Learn more" doesn't say what joining gets you.

## Other pages

Other pages aren't designed yet, but the same system carries over:

- **Team.** The board member grid reuses the Upcoming Events card logic (a repeating,
  individually accented module), not the Featured Content frame, because Team is a
  full roster, not a spotlight.
- **Calendar.** The Upcoming Events and Past Events lists reuse the landing page's
  event card. The month grid view is a new component that isn't covered here.
- **Sign In, Profile, Feed, Attendance and Forms.** All use the color, type, spacing and
  component rules in the style guide directly. None of their page layouts are designed
  here. The archived reference doc has per-page references and motion ideas for them
  ([archive/Eddie_DESIGN.md](archive/Eddie_DESIGN.md), sections 2 and 6.2), but its
  palette and fonts are out of date.
