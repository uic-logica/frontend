# LOGICA frontend: art, color and interaction reference

This is the my reseach half for the design. I spent a couple of hours in museum records, design system docs and the stylesheets of sites that have already built something close to what we are after.

We can honestly take from this anything that fits plus anything else later down the line. I tried to get ahead in terms of styling mock-ups, palette, fonts, sizing, etc. 

---

## 1. Direction

We want the precision of logic, meaning grids and geometric structure, combined with
the color and narrative energy of Latin American art. Looking at Latin American constructivism and kinetic art with artists like Torres-García who built a grid and filled the cells with
pictograms. Le Parc worked in ordered color sequences. Cruz-Diez treated color as a
physical event you could measure. Bulcão made tiles that combine. It is rule-based and
saturated at the same time, which is the whole brief sitting inside one tradition.

So the site is a strict grid on a cream ground, a small number of very saturated
planes, heavy display type, and motion that only fires when it changes what someone
understands. 

---

## 2. Reference set

The references have to span multiple Latin American countries, and the same one should
not turn up on every page. The way I held myself to that was to give each page its own
reference and make every one of them answer for a specific decision, so nothing in
here is a picture I liked the look of. Also, while I did try to incorporate a diverse amount of latin art, with diverse styles, we can always shorten the list and use specific ones I listed, we can maybe even try to revolve images so it's not always the same. Regardless, take a look at some of these, they're pretty cool!

| # | Page (`CONTENT.md`) | Country | Reference | What it drives |
| --- | --- | --- | --- | --- |
| 1 | Landing | Uruguay | Joaquín Torres-García, *América Invertida* (1943), pen and ink, and his "Escuela del Sur" manifesto | The page structure: a visible ruled grid with symbols set into cells. Hero mark is the inverted continent as a single-weight line drawing. |
| 2 | Team / roles | Puerto Rico | DIVEDCO Graphic Arts Workshop; Lorenzo Homar, its director from 1952, roughly 30 posters between 1951 and 1957 | Board member cards built as small silkscreen posters: name set large, three flat colors, no photo effects. |
| 3 | Sign-in | Cuba | ICAIC screenprint posters. Workshop opened 1960, over 1,700 posters, uniform 20 x 30 in vertical format, "flat swathes of color" | The sign-in panel: one flat color field, one shape, one line of type, in a 2:3 vertical panel. |
| 4 | Profile | Peru and Guatemala | Paracas block-color embroidery, c. 700 BCE to 200 CE (worked example: Met 1994.35.120, *Border Fragment*, 450-175 BCE, cotton and camelid hair); Guatemalan huipiles | Avatar fallback and involvement summary: one repeated motif whose colorway changes per member. Smarthistory records that Paracas colorways "vary across the composition and do not fit into any discernible pattern," which is the behavior a deterministic per-member color reproduces. |
| 5 | Feed | Brazil | Athos Bulcão's azulejo panels for Brasília, 20 x 20 cm modules, with Niemeyer; Hélio Oiticica, *Metaesquema No. 348* (1958, MoMA) | The post grid: a fixed module varied by rotation and offset rather than by size. MoMA describes the Metaesquemas as squares and rectangles against a pale background that seem to shift rhythmically, which is the feed's resting state. |
| 6 | Calendar | Argentina | Julio Le Parc, *Fourteen Colors - Sequence* (1959), gouache over graphite, Met 2019.111, described as a grid formed with squares and circles in primary and secondary colors | Event category colors come from one fixed ordered sequence rather than a color picker. The month view is that grid. |
| 7 | Attendance | Venezuela | Carlos Cruz-Diez, *Physichromie 21* (1960) and *Ambientación de Color Aditivo* (1974), Simón Bolívar airport floor, Maiquetía | Check-in confirmation as an additive-color event: red and green resolving into a yellow that is not painted anywhere. Cruz-Diez's colour-event depends on the viewer moving, so the motion is tied to the user's action. |
| 8 | Forms | Chile | Brigada Ramona Parra, founded 1968 by resolution of the VI Congress of the Communist Youth of Chile; collective mural brigades working in public space, for example *El primer gol del pueblo chileno* (1971, 25 m x 4 m, with Roberto Matta) | Form controls: flat fills, hard outlines, no gradients, no soft shadows. A form is the one screen a stranger has to read correctly on first contact. |
| G1 | Global structure | Mexico | Luis Barragán, Cuadra San Cristóbal (1966-68) and Casa Gilardi (1976); Diego Rivera, *Detroit Industry Murals* (1932-33, DIA) | Whole-plane color blocking: one large saturated plane per page section, cream everywhere else. A page is a wall split into a few large panels rather than forty small cards. |
| G2 | Empty states | Colombia | Omar Rayo, geometric intaglio and painting | Empty-state marks are black line geometry on cream, with no color, so an empty state never competes with real content. |

Countries covered: Uruguay, Puerto Rico, Cuba, Peru, Guatemala, Brazil, Argentina,
Venezuela, Chile, Mexico, Colombia.

---

## 3. Color

### 3.1 Where the palette came from

For the pallete, I mostly went looking for Latino institutions that had
already shipped one and read what they actually run in production.

The Smithsonian National Museum of the American Latino was the best thing I found.
Their stylesheet hands you a complete named token set on `:root`, and the whole site
sits on a warm cream ground instead of white with saturated hues layered over it. 

Techqueria publishes a nine-color brand palette and runs Rubik everywhere. Their live
CSS registers the same values as theme presets, so the brand page and the running site
agree with each other, which is rarer than it should be.

SHPE's logo usage guide gives six colors with Pantone, CMYK and RGB equivalents. That
makes it the most portable of the three if we ever need print.


The values themselves:

| Source | Type of source | Values |
| --- | --- | --- |
| Smithsonian NMAL, `latino.si.edu` | Live CSS custom properties | `--yellow #F9C138`, `--red #C8102E`, `--blue #0049DA`, `--green #00B74F`, `--pink #D92585`, `--orange #D84001`, `--aqua #028281`, `--gray-darker #242021`, `--gray-lightest #FFF9EC`, `--gray-lighter #E9E0D1`, `--gray-light #CFC6B7`, `--body-bg #E8E8E8`, `--footer-bg #0857C3` |
| Techqueria | Brand page, confirmed in live CSS | gold `#FABF67`, flamingo `#FF551F`, rust `#9F2600`, amazon green `#4C895C`, madison `#2F4052`, boston blue `#3F8DB9`, fun blue `#1756A9`, kabul `#5A4640`, rebel `#46352F`; body text `#363636` |
| SHPE | Logo usage guide (PDF) | red-orange `#D33A02` (Pantone 485), navy `#001F5B` (281), dark blue `#0070C0` (660), orange `#FD652F` (1655), light blue `#72A9BE` (7695), gray `#626366` (446) |

### 3.2 The palette

Overall, I tried to balance the pallette with colors that I **feel** like LOGICA has already reserved for itself, and other colors that added vibrance in tune with the latinx art that I found in research.

**Neutrals**

| Token | Hex | Source | Use | Contrast |
| --- | --- | --- | --- | --- |
| `ink` | `#242021` | NMAL `--gray-darker` | Body text, headings, outlines | 15.35:1 on `surface` |
| `ink-muted` | `#5A5350` | Derived | Timestamps, captions, hint text | 7.18:1 on `surface` |
| `surface` | `#FFF9EC` | NMAL `--gray-lightest` | The page ground, in place of white | n/a |
| `surface-raised` | `#FFFFFF` | Derived | Cards that need to lift off the cream | n/a |
| `surface-sunken` | `#E9E0D1` | NMAL `--gray-lighter` | Section bands, table stripes | n/a |
| `rule` | `#8C8275` | Derived from NMAL `--gray-light` | Input borders, card outlines, dividers | 3.60:1 on `surface` |


**Chromatics**

| Token | Hex | Source | Reference it carries | Text pairings |
| --- | --- | --- | --- | --- |
| `azul` | `#0049DA` | NMAL `--blue` | Le Parc and Cruz-Diez primary blue | White 7.08:1; as text on cream 6.75:1 |
| `naranja` | `#D33A02` | SHPE Pantone 485 | Mural earth-red, Rivera register | White 4.80:1; as text on cream 4.57:1 |
| `oro` | `#F9C138` | NMAL `--yellow` | Cruz-Diez additive yellow, Barragán light | `ink` 9.75:1. White fails. |
| `verde` | `#00B74F` | NMAL `--green` | Cruz-Diez red and green pair | `ink` 6.05:1. White fails at 2.66:1. |
| `rosa` | `#D92585` | NMAL `--pink` | Rosa mexicano, Barragán planes | White 4.61:1. As text on cream 4.40:1, so fills only. |
| `noche` | `#001F5B` | SHPE Pantone 281 | ICAIC poster ground, night field | White 15.59:1, cream 14.86:1, `oro` 9.44:1 |

### 3.3 Rules

1. In my opinion we should stick to Two chromatics per screen at most, plus neutrals. 
2. Saturated warm color carries dark ink, not white. `oro` and `verde` are fills that
   hold `ink`. `azul`, `naranja`, `rosa` and `noche` are fills that hold white. This
   one rule does more work than anything else in the palette, and it is the difference
   between the Smithsonian, whose large pill buttons run `#FFBF3F` with `#303030` text
   at 8.03:1, and the counter-example above.
3. `rosa` never sets body copy on cream. At 4.40:1 it misses AA by 0.1. Use it as a
   fill, a rule, or a chip background.
4. One plane per section. A section either sits on cream or on one saturated plane,
   edge to edge. No gradients and no tints of tints.
5. Category colors come from an ordered sequence. Calendar events are assigned in Le
   Parc order: `azul`, `naranja`, `verde`, `rosa`, `oro`, `noche`, then the same
   sequence again in the ink-outlined variant. Colors are never picked per event.

---

## 4. Typography

### 4.1 What comparable sites run

All of this came out of DevTools, except the USWDS body size, which I did not write down at the time.

| Site | Headings | Body | Body size / line-height |
| --- | --- | --- | --- |
| Smithsonian NMAL | Barlow 700 | Hanken Grotesk | 16px / 24px |
| Techqueria | Rubik 900 | Rubik | 18px / 26.1px |
| Latinas in Tech | Raleway 700 | system stack | 16px / 24px |
| Remezcla | Venus SB | Benton Sans, compressed and condensed cuts loaded | 16px / 18px |
| GOV.UK Design System | GDS Transport 700, h1 32px / 35px | GDS Transport | 19px / 25px |
| USWDS | Public Sans 700, h1 40px / 48px | Public Sans, Source Sans Pro | not recorded |

Two things came out of that. Body text in this category lives between 16 and 19px, so
18px is a defensible middle rather than a guess. And every one of them pairs a heavy
or condensed display cut against a plain text cut, which is the contrast we are after
between display and body.

### 4.2 The stack

Display and text both come from Omnibus-Type, a collective type foundry in Buenos
Aires, under the SIL Open Font License. I wanted the type itself to be Latin American
work rather than a stand-in for it, and these happen to also be free and
self-hostable, so there is nothing to argue about on cost or on privacy.

The foundry describes Archivo as reminiscent of late nineteenth century American
typefaces and originally drawn for highlights and headlines. That is the same
wood-type poster register the DIVEDCO and ICAIC posters sit in, which is why it is the
display face instead of a geometric sans.

| Role | Family | Designer and foundry | License |
| --- | --- | --- | --- |
| Display | Archivo Black | Héctor Gatti and the Omnibus-Type team, Buenos Aires | OFL 1.1 |
| UI and body | Chivo | Omnibus-Type, Buenos Aires. Their specimen: "Chivo (*goat* in Spanish) is Omnibus-Type's first grotesque family" | OFL 1.1 |
| Numerals in codes | System mono stack | `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` | n/a |
| Optional long-form serif | Alegreya | Juan Pablo del Peral, Huerta Tipográfica. Designed for literature; selected at ATypI Letter2 (2011) among the top text type systems | OFL 1.1 |

Load both through `next/font/google`. It self-hosts, subsets and preloads them, and it
kills the swap-related layout shift that would otherwise count against CLS (#7). If
someone wants a third loaded family, one of these has to come out.

### 4.3 The scale

Base size is 18px on a 4px vertical grid. `rem` values assume a 16px root; the root
stays at 16px so browser text zoom keeps working (WCAG 1.4.4).

| Token | Size | Fluid | Line-height | Tracking | Face and weight | Used for |
| --- | --- | --- | --- | --- | --- | --- |
| `display-1` | 72px / 4.5rem | `clamp(2.5rem, 8vw, 4.5rem)` | 0.92 (66px) | -0.03em | Archivo Black | Landing hero only |
| `display-2` | 56px / 3.5rem | `clamp(2.25rem, 6vw, 3.5rem)` | 0.95 (53px) | -0.025em | Archivo Black | Section openers |
| `h1` | 44px / 2.75rem | `clamp(2rem, 5vw, 2.75rem)` | 1.05 (46px) | -0.02em | Archivo Black | Page title |
| `h2` | 34px / 2.125rem | `clamp(1.625rem, 3.5vw, 2.125rem)` | 1.15 (39px) | -0.015em | Chivo 800 | Page section |
| `h3` | 26px / 1.625rem | fixed | 1.25 (32px) | -0.01em | Chivo 700 | Card and block titles |
| `h4` | 21px / 1.3125rem | fixed | 1.3 (27px) | 0 | Chivo 700 | Sub-blocks |
| `body-lg` | 20px / 1.25rem | fixed | 1.55 (31px) | 0 | Chivo 400 | Page intros |
| `body` | 18px / 1.125rem | fixed | 1.55 (28px) | 0 | Chivo 400 | Default |
| `body-sm` | 16px / 1rem | fixed | 1.5 (24px) | 0 | Chivo 400 | Dense lists, table cells |
| `caption` | 14px / 0.875rem | fixed | 1.45 (20px) | 0 | Chivo 400 | Timestamps, hints |
| `label` | 13px / 0.8125rem | fixed | 1.4 (18px) | 0.06em, uppercase | Chivo 700 | Chips, role labels, eyebrows |
| `code` | 16px / 1rem | fixed | 1.5 | 0.12em, uppercase | mono | Check-in codes |
| `code-display` | 96px / 6rem | `clamp(3rem, 12vw, 6rem)` | 1.0 | 0.16em | mono | The check-in code on the console screen (`CONTENT.md` #7) |

Body columns cap at `68ch`, which works out to roughly 65 characters at these sizes
and sits inside the 50 to 75 character band readability research keeps landing on.
Post bodies in the feed keep that cap even when the card around them is wider.

`display-1` and `display-2` only ever get set in `ink`, `surface` or `oro`, and never
over a photograph unless there is a solid plane behind them.

---

## 5. Layout and components

### 5.1 Grid and spacing

Base unit is 4px, with a scale of 4, 8, 12, 16, 24, 32, 48, 64, 96 and 128. Layout is
12 columns with a 24px gutter on desktop and 16px on tablet, dropping to 4 columns
and a 16px gutter on mobile. Content caps at 1200px, and text-only pages at 68ch.
Sections carry 96px of space above and below on desktop and 56px on mobile.
Breakpoints are 480, 768, 1024 and 1280.

One layout rule comes straight from the reference set. In the feed and the team grid
the module keeps a fixed size and only its contents change, the way Bulcão's tile
panels work. No masonry.

### 5.2 Buttons

I measured the button on every system worth comparing against. They land anywhere
between 32 and 64px tall, which is a wider spread than I expected going in.

| System | Font | Padding | Radius | Height |
| --- | --- | --- | --- | --- |
| GOV.UK `.govuk-button` | 19px / 19px lh | `8px 10px 7px` plus 2px border | 0 | 38px, 40px including the 2px offset shadow |
| USWDS `.usa-button` | 16.96px / 15.26px lh, 700 | `12px 20px` | 4px | 39.25px |
| Techqueria primary | 18px, 500 | `13.86px 25.92px 12px` | pill (9999px) | about 47px |
| Smithsonian NMAL primary | 22px, 600 | `9px 20px 6px` | 40px (pill) | 64px |
| Latinas in Tech secondary | 14px, 600 | `6px 12px` | 2px | 32px, below the accessible floor |

The floor the standards set is lower than any of them. WCAG 2.2 SC 2.5.8 Target Size
(Minimum), Level AA, is 24 x 24 CSS px. SC 2.5.5 Target Size (Enhanced), Level AAA, is
44 x 44. Apple's HIG says 44 x 44 pt and Material says 48 x 48 dp.

I put our default at 48px. It clears AAA and Material at once, and it matches how the
attendance flow in `CONTENT.md` #7 actually gets used, which is one-handed, standing,
at a door with people waiting behind you. Buttons set their own line-height instead of
inheriting the body scale, so the heights below are exact arithmetic of
`padding-top + line-height + padding-bottom`. Adjacent targets keep at least 8px
between them.

| Size | Height | Padding | Type | Where |
| --- | --- | --- | --- | --- |
| `sm` | 40px | `11px 16px` | 15px / 18px, Chivo 700, `0.01em` | Dense table rows only |
| `md` | 48px | `14px 24px` | 17px / 20px, Chivo 700, `0.01em` | Default |
| `lg` | 56px | `18px 32px` | 20px / 20px, Chivo 700, `0.01em` | Landing CTA, check-in submit |

Radius is 2px. The reference set is hard-edged the whole way through, from
Torres-García's ruled grid to Bulcão's square tiles to ICAIC's flat panels to Rayo's
geometry, and a soft 12px corner would quietly undo most of it. Three exceptions and
no more: avatars are circles, chips and role labels are pills, and the check-in QR
frame is square.

Primary buttons get an offset color block instead of a drop shadow. This is the detail
I would defend hardest in review. DIVEDCO and ICAIC posters were printed one flat
color per stencil pass, and a hair of misalignment between passes is the visual
signature of silkscreen, so the offset is a direct quote from the reference set rather
than a style I picked. It is also not a risk to ship: GOV.UK puts a `0 2px 0` block
under every button on one of the most user-tested interfaces on the web. Ours is
bigger and runs diagonally.

```css
/* primary button */
box-shadow: 4px 4px 0 var(--color-ink);

/* :active */
transform: translate(2px, 2px);
box-shadow: 2px 2px 0 var(--color-ink);
```

### 5.3 Components

Inputs are sized to the same 48px target as buttons, and the type in them never drops
below 16px because iOS Safari zooms the viewport on focus when it does. Error styling
matches what `CONTENT.md` #8 already specifies: the message sits between hint and
input, and the border changes color.

Focus rings need two tokens, not one. I tried to get away with a single ring color and
the numbers do not allow it. `azul` reaches 6.75:1 on cream but falls to 2.27:1 on
`ink`, so dark and saturated surfaces switch to `oro` at 9.75:1. `outline: none` never
ships without a replacement.

Cards take their depth from the offset block rather than blur, which means there is no
drop shadow anywhere in the system.

Role chips show capability rather than rank. That is why MEMBER renders nothing at all
(`CONTENT.md` #4): a chip should tell you this person can post or run check-in, not
where they sit in a hierarchy.

Avatar monograms are the Paracas colorway rotation made literal. The block color is
picked deterministically from the member id, so a member always gets the same one, and
the initial color follows the ink-or-white rule from #3.3.

Empty-state marks are the Rayo reference, black line geometry with no color in it, so
an empty state never reads louder than real content.

| Component | Spec |
| --- | --- |
| Input | `min-height: 48px`, `padding: 0 14px`, `line-height: 1.4`, 2px `rule` border, 2px radius, `body` (18px). Error state: 2px `naranja` border. |
| Textarea | As input, plus `padding: 12px 14px` and `min-height: 120px` |
| Focus ring, light surfaces | `outline: 3px solid azul`, `outline-offset: 2px`. Token `--focus-on-light`. |
| Focus ring, dark or saturated surfaces | `outline: 3px solid oro`, `outline-offset: 2px`. Token `--focus-on-dark`. |
| Card | `surface-raised`, 1px `rule` border, 2px radius, no `box-shadow` |
| Chip / role label | Pill, `label` type, 24px height, 8px horizontal padding. BOARD `azul` on white, EXEC_BOARD `noche` on white, MEMBER not rendered. |
| Avatar monogram | Circle, initials in Archivo Black. Block from `oro`, `verde`, `rosa`, `azul` or `naranja`, keyed to the member id. `oro` and `verde` take `ink` initials; `rosa`, `azul` and `naranja` take white. |
| Empty-state mark | 96px black line geometry, then `h3` title, one line of `body`, one button |

---

## 6. Motion

### 6.1 Approach

The order is native CSS first, GSAP where there is real orchestration to do, Lottie for vector illustration. I see no reason to depart from it.

Native CSS covers most of what we need. Scroll-linked reveals and parallax use
`animation-timeline: scroll()` and `view()`, hover and focus states use `transition`,
and anything entering the DOM uses `@starting-style`. Nothing simple gets a library
thrown at it.

GSAP earns its place where several elements have to be sequenced against one scroll
position or against each other. On this site that is two things: the landing page's
three-beat story reveal, using ScrollTrigger and SplitText, and the shape transition
on the check-in confirmation, using MorphSVG. Which plugins we reach for is no longer
a budget question either, since GSAP 3.13 on 29 April 2025 made every former Club
plugin free under Webflow, including SplitText, MorphSVG, ScrollSmoother, DrawSVG,
Flip and Draggable.

Lottie is for vector illustration that would be miserable to hand-code in SVG or CSS,
which here means the check-in success mark and the empty-state illustrations. Ship the
compressed dotLottie format (`.lottie`) rather than raw Lottie JSON; it is a fraction
of the size.

### 6.2 What moves, per page

| Page | What moves | What it communicates |
| --- | --- | --- |
| Landing | Three-beat story reveal (GSAP ScrollTrigger and SplitText), with a `rosa` or `azul` plane wiping in behind each beat | Sequences the club's story: who we are, what we do, how to get involved |
| Team | Card lifts 2px and the offset block tightens on hover and focus | Marks the card as a link through to a profile |
| Sign-in | Nothing beyond focus states and the code field's own state changes | Someone mid-authentication has one job |
| Feed | New posts fade in over 150ms; nothing animates on scroll | Scroll motion would compete with reading |
| Calendar | Category color fills the day cell on hover and focus | Identifies the event type without a trip to the legend |
| Attendance | On success, a red plane and a green plane slide together and the overlap resolves to `oro` for 600ms, then the confirmation lands | The Cruz-Diez additive-color event, used as the confirmation itself. It also makes success readable from a few feet away in a loud room. |
| Forms | Error summary takes focus with no animation; field borders transition over 100ms | Animated errors cost time for screen reader users and anyone already stuck |

### 6.3 Rules

Every animation needs a `prefers-reduced-motion: reduce` branch that jumps straight to
the end state, not a slower version of the same thing. Animate `transform` and
`opacity` only, since `width`, `top`, `height` and a spreading box-shadow will all
jank on scroll. GSAP and Lottie get imported dynamically by the components that use
them and never enter the global bundle. The check-in confirmation runs 600ms, which
keeps it inside Nielsen's one-second limit for holding someone's train of thought, and
that flow is running against a queue of people so it matters.

---

## 7. Accessibility bar

This is the list I want checked in review, line by line, rather than taken on trust.

* Text contrast at 4.5:1 or better; large text, meaning 24px or 18.66px bold and
  above, at 3:1 or better; interface boundaries and focus indicators at 3:1 or better
  (WCAG 1.4.3 and 1.4.11). #3.2 carries the computed number for every pairing in the
  system. A pairing that is not in that table is not approved.
* Interactive targets at 44 x 44px or larger, above the 24 x 24 floor in SC 2.5.8,
  with at least 8px between adjacent targets.
* Visible focus on everything focusable, using the two-token ring in #5.3.
* A real `<label>` on every input. Placeholder text is never a label.
* Error summary at the top of the page takes focus, the page `<title>` gets an
  "Error: " prefix, and summary wording matches inline wording exactly
  (`CONTENT.md` #8).
* Color is never the only carrier of meaning. Post types get a label as well as a
  left rule color, calendar categories get a label as well as a fill, and attendance
  states are written out as "Attended" or "RSVP'd, didn't check in".
* `prefers-reduced-motion` honored throughout.
* The check-in flow and the form flow are both completable by keyboard alone.

---

## 8. Tailwind tokens

The palette and scale live as theme tokens rather than loose hex sitting in components. 

**Tailwind v4, in `app/globals.css`:**

```css
@import "tailwindcss";

@theme {
  /* neutrals */
  --color-ink:            #242021;
  --color-ink-muted:      #5A5350;
  --color-surface:        #FFF9EC;
  --color-surface-raised: #FFFFFF;
  --color-surface-sunken: #E9E0D1;
  --color-rule:           #8C8275;

  /* chromatics */
  --color-azul:    #0049DA;
  --color-naranja: #D33A02;
  --color-oro:     #F9C138;
  --color-verde:   #00B74F;
  --color-rosa:    #D92585;
  --color-noche:   #001F5B;

  /* type */
  --font-display: "Archivo Black", "Archivo", system-ui, sans-serif;
  --font-sans:    "Chivo", system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-mono:    ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;

  --text-display-1: 4.5rem;   --text-display-1--line-height: 0.92;
  --text-display-2: 3.5rem;   --text-display-2--line-height: 0.95;
  --text-h1:        2.75rem;  --text-h1--line-height: 1.05;
  --text-h2:        2.125rem; --text-h2--line-height: 1.15;
  --text-h3:        1.625rem; --text-h3--line-height: 1.25;
  --text-h4:        1.3125rem;--text-h4--line-height: 1.3;
  --text-body-lg:   1.25rem;  --text-body-lg--line-height: 1.55;
  --text-body:      1.125rem; --text-body--line-height: 1.55;
  --text-body-sm:   1rem;     --text-body-sm--line-height: 1.5;
  --text-caption:   0.875rem; --text-caption--line-height: 1.45;
  --text-label:     0.8125rem;--text-label--line-height: 1.4;

  /* shape */
  --radius-none: 0px;
  --radius-sm:   2px;
  --radius-full: 9999px;

  /* the offset block */
  --shadow-block:        4px 4px 0 var(--color-ink);
  --shadow-block-active: 2px 2px 0 var(--color-ink);
}
```

**Tailwind v3, in `tailwind.config.ts`, same values:**

```ts
import type { Config } from "tailwindcss";

export default {
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#242021", muted: "#5A5350" },
        surface: { DEFAULT: "#FFF9EC", raised: "#FFFFFF", sunken: "#E9E0D1" },
        rule: "#8C8275",
        azul: "#0049DA", naranja: "#D33A02", oro: "#F9C138",
        verde: "#00B74F", rosa: "#D92585", noche: "#001F5B",
      },
      fontFamily: {
        display: ['"Archivo Black"', '"Archivo"', "system-ui", "sans-serif"],
        sans: ['"Chivo"', "system-ui", "-apple-system", '"Segoe UI"', "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      fontSize: {
        "display-1": ["4.5rem",   { lineHeight: "0.92", letterSpacing: "-0.03em" }],
        "display-2": ["3.5rem",   { lineHeight: "0.95", letterSpacing: "-0.025em" }],
        h1:          ["2.75rem",  { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        h2:          ["2.125rem", { lineHeight: "1.15", letterSpacing: "-0.015em" }],
        h3:          ["1.625rem", { lineHeight: "1.25", letterSpacing: "-0.01em" }],
        h4:          ["1.3125rem",{ lineHeight: "1.3" }],
        "body-lg":   ["1.25rem",  { lineHeight: "1.55" }],
        body:        ["1.125rem", { lineHeight: "1.55" }],
        "body-sm":   ["1rem",     { lineHeight: "1.5" }],
        caption:     ["0.875rem", { lineHeight: "1.45" }],
        label:       ["0.8125rem",{ lineHeight: "1.4", letterSpacing: "0.06em" }],
      },
      borderRadius: { none: "0", sm: "2px", full: "9999px" },
      boxShadow: {
        block: "4px 4px 0 #242021",
        "block-active": "2px 2px 0 #242021",
      },
      maxWidth: { measure: "68ch", shell: "1200px" },
    },
  },
} satisfies Config;
```

---
