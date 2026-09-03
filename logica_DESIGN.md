# LOGICA frontend: design system

The working reference for how the site looks and why. Supersedes the palette and
reference set in the first version of this doc — the research there is still good,
but most of what it specified has been replaced. `DESIGN.md` holds the brief and
the build order; this file holds the system.

Everything below is either measured off the LOGICA mark, measured off a cited
source, or verified in the mockup (`logica.pen`). Where a number appears, it was
computed, not chosen.

---

## 1. Direction

**LOGICA is the Latinx Organization for Growth in Computing and Academics at UIC.**
Its stated mission is "increasing the participation and success of students from
Latinx and underrepresented communities pursuing careers in the field of computing
and computer science," and its three pillars are **diversity, growth and
development, community**. The site uses the org's own words wherever it can.

The visual system has one idea: **the page is a circuit board, and the circuit is
an Andean border.** Those are the same object.

- The LOGICA mark is a line-and-node system — a ring, a trunk, branches, round
  pads. Measured off the traced mark, its long runs are **100% orthogonal**, with
  short 45° departures where branches leave the trunk.
- Andean textiles delimit a field by its **edge**, not its fill. Paracas garments
  use non-contiguous reversed-L borders that wrap a field and leave the rest as
  deliberate "breathing space." *Ñawi awapa* translates as **eye border**;
  *chinka chinka* edging makes "dots or dashes of colour."
- A trace that runs, turns and terminates in a node is both of those things at
  once. That coincidence is the whole system.

Two consequences that decide most arguments:

**Colour is signal, not structure.** Sections are not coloured planes. Exactly one
plane exists on the page. Everything else is delimited by line, node and space.

**Identity lives in content, not ornament.** The visual system carries precision;
the culture is carried by the org's words, its members' names, where they are
from, and its actual events. See §7.

---

## 2. Reference set

Revised. The first version leaned on the chromatic wing of Latin American
modernism — Le Parc, Cruz-Diez, Bulcão, Barragán — and specified colour planes
drawn from it. That approach was tested and abandoned (§3). The current set is
line-based, and three of the four are within twenty minutes of campus.

| # | Reference | Country / place | What it drives |
| --- | --- | --- | --- |
| 1 | **Carlos Cortez** (1923–2005), linocut and woodblock, Gato Negro Press; a founder of the National Museum of Mexican Art, Pilsen | Chicago / Mexico | The line-and-relief character of the whole system. Cortez willed his printing blocks to the NMMA on the condition that if his prints ever grew too expensive for working people, the museum should print more and drive the price down — the same access ethic as a $10 membership with a hardship fund. |
| 2 | **Paracas border structures** — *ñawi awapa*, *chinka chinka*; Border Fragment, 450–175 BCE, Met **1994.35.120** (objectID 316945), CC0, 17.1 × 105.1 cm | Peru | The rule that a field is delimited by its edge, and that unembellished space is deliberate. The cited object is a **6:1 strip** — a border, not a field. |
| 3 | **Gego**, *Reticulárea* | Venezuela | Precedent for a line-and-node net as a structural system rather than decoration. |
| 4 | **Joaquín Torres-García**, ruled grid | Uruguay | Orthogonal structure holding irregular content. |

**Institutional context, not a visual reference:** LOGICA is an affiliate of the
**Rafael Cintrón Ortiz Latino Cultural Center**, founded **1976** after Latine
students, faculty and staff demanded a dedicated space at UIC, and named for a
Puerto Rican professor who backed it. This is on the landing page as the Lineage
section, and it is the site's origin story.

**Open:** `DESIGN.md` requires the reference set to span multiple Latin American
countries. The four above cover Mexico/Chicago, Peru, Venezuela and Uruguay. If a
reviewer finds that thin, the answer is not more museum objects — it is a motif
commissioned from a LOGICA member and credited to them (§7).

**Terminology:** the site writes **Latinx**, matching the org's registered name.
The Cultural Center writes *Latine*. This is a board decision, recorded here so it
is deliberate.

---

## 3. Colour

### 3.1 Why there are no coloured planes

Four filled-plane treatments were built and measured against the dark ground
before the plane idea was abandoned. Each failed for a different, measurable
reason:

| plane | measurement | result |
| --- | --- | --- |
| cream `#ECE8DE` | 15.37:1 vs ground | maximum possible separation — reads as a hole punched in the page |
| graphite `#383434` | chroma **0.6**, separation 1.53 | a true neutral; can only separate by lightness, and not enough of it |
| brick `#903732` | L\* 46.1, chroma 12.2 | mid-lightness *and* mid-chroma — the definition of muddy |
| slate / teal | chroma 2.4 / 5.4 | the same two failures, milder |

A plane on this ground has to be dark enough not to detach and chromatic enough
not to be mud, and the window between those is too narrow to use. **A line has no
fill, so it has no separation problem at any chroma.** That is why the system is
built from line.

### 3.2 The palette

One ground, one contrast, one accent, plus a quiet circuit layer.

**Ground and type**

| Token | Hex | Use | Contrast on ground |
| --- | --- | --- | --- |
| `paper` | `#14110F` | the page ground | — |
| `ink` | `#ECE8DE` | body and display type | 15.37 |
| `ink-muted` | `#948C82` | secondary type, captions | 5.67 |
| `rule` | `#6B655E` | hairlines, table rules | 3.27 |

**Accent — two tokens, and the split is forced**

| Token | Hex | Use | Contrast |
| --- | --- | --- | --- |
| `rojo` | `#F2405E` | marks and text on the ground | 5.08 on ground |
| `rojo-plane` | `#C8102E` | the one saturated plane, carrying white | white on it 5.88 |
| `on-rojo` | `#FFFFFF` | text on that plane | — |

Brightening a single accent enough to read on the dark ground drops white-on-accent
to **3.96:1**, failing AA. Hence two tokens. `rojo-plane` is the NMAL red already
documented in the original research. **Never use `rojo` as a fill behind white
text** — that mistake was made once across eight pages and had to be swept out.

Hue matters here: the earlier accent sat at **hue 34–35**, which is Claude's
orange at hue 39 — near-identical, and it read as borrowed. The current pair sits
at **hue 16–22**, a clean crimson.

**The masthead strip** — cream is allowed in small doses, never as a large ground.

| Token | Hex | Contrast |
| --- | --- | --- |
| `strip` | `#ECE8DE` | — |
| `on-strip` | `#14110F` | 15.37 |
| `on-strip-muted` | `#57514B` | 6.40 |

**Circuit layer** — see §6. Deliberately below type contrast.

| Token | Hex | Contrast on ground |
| --- | --- | --- |
| `cir-trace` | `#5C5248` | 2.47 |
| `cir-node` | `#7A7269` | 3.97 |
| `cir-cool` | `#4A6B78` | 3.28 |
| `cir-amber` | `#8A6A3A` | 3.76 |
| `cir-green` | `#5E7C6B` | 4.09 |
| `cir-rojo` | `#9E3B44` | — |

The chromatic circuit values appear **only** on circuit terminals. They never
appear on a control, a chip, a status or anything a user acts on, so "red marks
the live thing" survives intact.

### 3.3 Rules

1. **One plane per page.** Currently the CTA. Everything else sits on the ground.
2. `rojo` marks the live thing: current nav item, open RSVP, primary action, one
   lit node. Never decoration.
3. Cream is for type, the masthead strip, and small elements. Never a section
   background.
4. Circuit colours stay in the circuit layer.
5. A pairing not in the tables above is not approved.

---

## 4. Typography

Unchanged in choice, corrected in use. **Archivo** (display) and **Chivo** (UI and
body) from Omnibus-Type, Buenos Aires, OFL 1.1 — actual Latin American type rather
than a stand-in for it. `Chivo Mono` for functional numerals.

Archivo is used at **normal width, weight 800**, not Expanded. Measured against
the wordmark's own letterforms, Expanded 800 was the *worst* fit tested
(deviation 0.185); normal-width Archivo 800 sits at 0.034.

### The scale

Everything is a token. The mockup previously carried 13 hardcoded sizes while
three tokens went unused; that is the failure mode to avoid.

| Token | px | Used for |
| --- | --- | --- |
| `t-display` | 86 | landing hero only |
| `t-display-2` | 54 | mission statement, CTA |
| `t-h1` | 44 | page titles |
| `t-h2` | 34 | section openers, numerals |
| `t-h3` | 26 | block titles, event dates |
| `t-h4` | 21 | card and sub-block titles |
| `t-body-lg` | 20 | page intros |
| `t-body` | 18 | default body |
| `t-body-sm` | 16 | dense lists, labels, buttons |
| `t-caption` | 14 | timestamps, hints |
| `t-label` | 12 | masthead, credits |
| `t-mono` | 13 | dates, times, codes, provenance, silkscreen |

Letter-spacing scales with size — when a size changes, tracking is recomputed as a
ratio, never left at its old absolute value.

**No numbered mono eyebrows.** The pattern `01 — WHO WE ARE` is banned. It is the
most template-ish device available and it is the specific thing that reads as
machine-generated. Mono survives only where mono is functionally true: dates,
times, codes, seat counts, provenance lines, silkscreen labels.

---

## 5. Layout and components

4px base unit. 12 columns, content capped at **1200px** with **120px** margins.
Body columns cap at 68ch. Radius is **2px** everywhere except avatars, chips and
pads, which are circles or pills.

| Component | Spec |
| --- | --- |
| Input | `min-height: 48px`, 2px `rule` border, 2px radius, 18px type. Error: 2px `rojo` border, message above the field. |
| Button | 48px default (`14px 24px`), 56px large. Primary: `rojo-plane` fill, white label. Secondary: 2px `ink` outline. Flat — no offset block, no shadow. |
| Focus ring | 3px, offset 2px. `focus` on the ground, `focus-on-ink` on a plane. Never removed without replacement. |
| Chip | Pill, `t-mono`, 1px `rule` outline. BOARD and EXEC_BOARD only — MEMBER renders nothing, because a chip means capability, not rank. |
| Avatar | Circle, initials in Archivo 800, block colour keyed deterministically to member id. |
| Provenance line | `t-mono`, `ink-muted`, letterspaced. `PILSEN, CHICAGO · CS '27 · FIRST-GEN` |
| Quote block | 3px `rojo` left rule, `t-h3` quote, name + provenance beneath. |
| Lockup | Wordmark size = **0.55 × mark height**; gap = **0.325 × mark height**. Both stored as variables so the two lockups cannot drift apart. |

**The mark needs a small-size cut.** Its strokes are 2.4% of its diameter, so it
holds at 40px and begins to fill in at 32px. This is a real gap, not a rendering
artifact.

---

## 6. The circuit layer

The page's structure. Two tiers, and the separation between them is the point.

**Geometry — enforced in the generator, with violations printed. Do not eyeball.**

1. All coordinates on a **20px grid** (1200 content = 60 modules, 120 margin = 6).
2. **No segment under 40px.**
3. Turns are **90° with substantial 45° departures** — not chamfered corners. A
   12px chamfer reads as a rounded corner; a 60px diagonal reads as a trace. The
   mark's own branches leave the trunk at 45° and then run orthogonally.
4. Every trace is **anchored** at one end — to a bundle, a component edge, or the
   canvas edge. No floating fragments.
5. Traces are 2px; pads are 10px. That **4.8:1 pad-to-line ratio is measured off
   the mark** and is its single most recognisable proportion.
6. **Nothing encloses space.** A trace that boxes off a region reads as a stray
   empty rectangle.
7. Anchors (component edges, lane positions) override the grid.

**Bundles.** Traces run in parallel groups at 9–10px pitch. When a bundle turns,
each trace turns **one pitch apart** so the group stays parallel through the bend —
this is how real routing behaves and it is why bundles read as a board rather than
as scattered lines. Terminals alternate open rings and filled dots and are
staggered so no two in a bundle end level.

**Clearance — the rule that matters most:**

> **Traces may cross text. Terminals may not.**

A trace passing behind a line of type reads as depth. A ring sitting inside a
letterform reads as a typo. The generator resolves this by moving a terminal past
the blocking text block, or stopping the trace short of it.

**Odd counts.** Branch clusters carry 1 or 3 lines, never 2 or 4. Even groups read
as a mistake; odd groups read as a fan.

**Density follows emptiness.** The circuit fills space the content does not use.
It is not applied evenly and it is never used to fill a region that is already
working.

---

## 7. The identity layer

The visual system carries precision. It does not carry the culture, and asking it
to is how a site ends up decorative. Four devices carry identity, and they are
content, not ornament:

1. **The org's own words.** Mission, three pillars, name. Never paraphrased.
2. **Provenance.** One mono line under a name — where someone is from, their
   major and year, optionally first-gen and languages.
3. **First voice.** One sentence in a member's own words, attributed. Not
   testimonial-marketing.
4. **Stated access.** The $10, the hardship fund, "you do not have to be Latinx to
   join," said plainly. This is the org's values in public, and it is the same
   ethic as Cortez's price condition.

**Identity density follows people-density, not page size.** Team and Profile are
almost entirely people and carry the most. Feed, Landing and Calendar carry
medium. Sign-in, Attendance and Forms are machinery and carry almost none —
forcing identity into a check-in screen at a door with people waiting is
tokenism, not culture.

**All member content in the mockup is placeholder.** Names, hometowns, quotes and
events are invented to show the mechanism. Real content comes from a five-question
intake to the board: where you are from, major and year, one sentence on why you
are in LOGICA, optionally first-gen and languages. Gathering it from members
rather than writing it for them is the method, not an afterthought.

---

## 8. Motion

Native CSS first, GSAP where there is real orchestration, Lottie for vector
illustration. Unchanged from `DESIGN.md`.

The one system-specific rule: **the circuit layer drifts, the content stays
fixed.** Ambient traces and terminals may move slowly; anything a user reads or
acts on does not. Structure holds still, life moves.

Every animation needs a `prefers-reduced-motion: reduce` branch that jumps to the
end state. Animate `transform` and `opacity` only. GSAP and Lottie are dynamically
imported by the components that use them and never enter the global bundle.

---

## 9. Accessibility bar

Checked in review, line by line, and verified by sweep in the mockup rather than
by eye.

* Text at 4.5:1 or better; large text (24px, or 18.66px bold) at 3:1; interface
  boundaries and focus indicators at 3:1. Every pairing in §3.2 carries its
  computed number. **A pairing not in that table is not approved.**
* Current mockup state: **530 text nodes across 8 pages, 0 contrast failures.**
* Interactive targets 44 × 44px or larger, 8px minimum between adjacent targets.
* Visible focus on everything focusable, using the two-token ring.
* A real `<label>` on every input. Placeholder is never a label.
* Error summary at the top of the page takes focus; page `<title>` gets an
  "Error: " prefix; summary wording matches inline wording exactly.
* Colour is never the only carrier of meaning — post types get a label as well as
  a rule colour, attendance states are written out.
* `prefers-reduced-motion` honoured throughout.

**Known caveat:** this design does not survive a thumbnail. 2px hairlines at low
contrast resample away when a 1440px page is shown at ~800px. Review it at 1:1.
If it ever has to read small, traces thicken to 3px — which is the same problem as
the mark needing a small-size cut.

---

## 10. Tailwind tokens

Tailwind v4, in `app/globals.css`. Values are the dark ground, which is the
default and only shipped theme.

```css
@import "tailwindcss";

@theme {
  /* ground and type */
  --color-paper:          #14110F;
  --color-ink:            #ECE8DE;
  --color-ink-muted:      #948C82;
  --color-rule:           #6B655E;

  /* accent — two tokens, see §3.2 */
  --color-rojo:           #F2405E;  /* marks and text on the ground */
  --color-rojo-plane:     #C8102E;  /* the one plane, carries white */
  --color-on-rojo:        #FFFFFF;

  /* masthead strip */
  --color-strip:          #ECE8DE;
  --color-on-strip:       #14110F;
  --color-on-strip-muted: #57514B;

  /* focus */
  --color-focus:          #ECE8DE;
  --color-focus-on-plane: #14110F;

  /* circuit layer */
  --color-cir-trace:      #5C5248;
  --color-cir-node:       #7A7269;
  --color-cir-cool:       #4A6B78;
  --color-cir-amber:      #8A6A3A;
  --color-cir-green:      #5E7C6B;
  --color-cir-rojo:       #9E3B44;

  /* type */
  --font-display: "Archivo", system-ui, sans-serif;      /* weight 800, normal width */
  --font-sans:    "Chivo", system-ui, -apple-system, sans-serif;
  --font-mono:    "Chivo Mono", ui-monospace, SFMono-Regular, Menlo, monospace;

  --text-display:   5.375rem;  --text-display--line-height: 0.9;
  --text-display-2: 3.375rem;  --text-display-2--line-height: 0.96;
  --text-h1:        2.75rem;   --text-h1--line-height: 1.05;
  --text-h2:        2.125rem;  --text-h2--line-height: 1.15;
  --text-h3:        1.625rem;  --text-h3--line-height: 1.25;
  --text-h4:        1.3125rem; --text-h4--line-height: 1.3;
  --text-body-lg:   1.25rem;   --text-body-lg--line-height: 1.55;
  --text-body:      1.125rem;  --text-body--line-height: 1.55;
  --text-body-sm:   1rem;      --text-body-sm--line-height: 1.5;
  --text-caption:   0.875rem;  --text-caption--line-height: 1.45;
  --text-label:     0.75rem;   --text-label--line-height: 1.4;
  --text-mono:      0.8125rem; --text-mono--line-height: 1.4;

  /* shape and layout */
  --radius-none: 0px;
  --radius-sm:   2px;
  --radius-full: 9999px;
  --spacing-shell: 1200px;
}
```

**Mark proportions**, for anywhere the logo is placed programmatically:

```
trace weight / ring radius   0.042
pad radius   / ring radius   0.101
pad diameter / line weight   4.8      <- the mark's signature ratio
wordmark size / mark height  0.55
lockup gap   / mark height   0.325
```

---

## 11. Open questions

1. **A commissioned member motif.** The hero plate currently holds an
   AI-generated placeholder, captioned as such. The real answer is a motif drawn
   by a LOGICA member and credited by name — which is also the only version of
   "multiple countries."
2. **The CTA image.** Currently a stock aerial, monochrome-blended and scrimmed.
   It is not Chicago. Options are a real aerial of Pilsen or the UIC block, or —
   better — a **drawn street grid**, since Chicago's grid is orthogonal and a
   street grid and a printed circuit look the same from above.
3. **The mark's small-size cut** (§5).
4. **The skeleton.** `DESIGN.md` step 2 has still not been built. All mockup
   geometry is positioned against hard-coded coordinates from this specific
   content; when real API data changes section heights, the circuit layer must be
   regenerated, not ported. **The generator is the deliverable, not the
   coordinates.**
