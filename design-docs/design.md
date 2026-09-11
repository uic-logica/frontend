# LOGICA Landing Page: Design Synthesis

This is the connective tissue between `mockup.md` (how the page is laid out)
and `style-guide.md` (the reusable rules), explaining how the two together
actually express the research in `design-direction.md`. It is written for
someone who wants the reasoning, not a rulebook; the rules themselves live in
the other two documents and are not repeated here.

## Introduction to LOGICA (the hero)

The hero's warm-lit, dimensional object treatment and its dark-to-light
transition are `design-direction.md` section 10's central finding, applied
directly: the first attempt at this hero used cold, museum staging and read
as intimidating, and swapping to warm materials and soft light produced the
"exclusive and welcoming at once" feeling the brief's whole concept (section
1) is chasing. The Cobalt seam rule that caps the transition is not a
stylistic flourish; it is the Torres-García habit of using a hard, deliberate
line rather than a soft blur, applied to the one place on the page where two
backgrounds meet.

## Organization Mission

The bordered, unevenly filled grid of cells is the most literal expression of
Torres-García's Constructive Universalism on the page: a strict structure
that still carries warmth, via the one solid Cempasúchil cell and the
dimensional relief icons, rather than reading as cold minimalism. It is the
section `design-direction.md` section 8 explicitly calls out as "the natural
place" for this logic, and it is the only section built as a visible grid of
bordered cells rather than a looser composition, so the reference stays
legible instead of diffusing into every section on the page.

## Upcoming Events

The individually accented, repeating card is the mola and Wayuu logic from
section 2: a shared template where every instance still carries a visible,
considered variation, not a single stamp repeated identically. The
scroll-snap row (rather than a static grid) is what lets that variation
actually be felt one card at a time, the way a mola panel or a Wayuu mochila
rewards being looked at individually within a set.

## Featured Content

This section is deliberately the odd one out, a single framed module instead
of another card grid, because section 3's spotlight mechanism only works if
it does not compete visually with Events' repeating-set logic. Treating a real
member's real outcome as "closer to a piece hung on a wall than a content
card" is the honest version of the brief's role-model ambition: no invented
metric, no manufactured testimonial, just one real name and one real story
given the visual weight of an art object, which is the entire case section 3
makes for why this mechanism is allowed to feel special.

## Call to Action

The heaviest concentration of Rosa Mexicano on the page belongs here on
purpose: section 8 names this as the section that should carry the most of
that color, and section 1's "exclusive" half of the brief's emotional target
is easiest to justify at the exact moment the page is asking someone to
actually join, not throughout.

## Where the research met a practical wall

**The hero's literal 3D object.** Section 10 validates a real, physically
lit sculpture as the mark treatment, and that finding should not be
softened. But rendering it as a live, real-time 3D scene in the browser
(a genuine WebGL or three.js render, animated, lit, on every device) sits in
direct tension with `DESIGN.md`'s performance bar: Lighthouse 90+ and LCP
under 2.5s on a throttled connection are hard to hit alongside a real-time 3D
scene as the hero's largest visual element, especially on the mid-range
mobile hardware a student org's visitors are likely using. The practical
resolution, not a silent workaround: produce the object as a pre-rendered
asset, a small set of high-quality baked stills or a short, heavily
compressed looping video/image sequence, exactly as validated in the
exploration, with the live-3D version reserved as a possible future
progressive enhancement for capable devices rather than the load-bearing
implementation. This keeps the finding intact; it changes only how the pixels
get to the screen.

**The display typeface.** `style-guide.md` names a specific candidate
(Barricada Pro) rather than leaving the choice fully open, since a real,
licensable, Sudtipos-foundry face with the right sign-painting character does
exist and is worth naming now. But its exact licensing path (an Adobe Fonts
web-embed dependency versus a purchased self-hosted license) was not resolved
in this pass, and should be confirmed before it is wired into the codebase,
so it does not become a runtime dependency on a service nobody signed off on.
