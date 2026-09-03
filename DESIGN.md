# Frontend design direction

## The concept

LOGICA sits at the intersection of logic and art — the site should look like it. The visual language blends the precision of logic (grids, geometric structure, the kind of exactness kinetic/op art is built on) with the color and narrative energy of Latin American art: muralism, kinetic art, and folk craft. Not a generic SaaS template with a warm color swap — an actual point of view.

## Reference points

No examples here on purpose. Research and pick your own — specific artists, movements, and individual pieces, not generic labels. **Required: cover multiple Latin American countries, not just one or two.** LOGICA represents Latinos broadly; the final set of references has to reflect that, not lean on whichever couple of countries are easiest to find material on.

Document what you land on — the specific pieces, why each one fits, what it contributes (color, pattern, motion, composition) — in the detailed reference doc (see `frontend#18`/`#19`), not here.

## Motif Pivot: The Circuit as a Paracas Border

While the initial design relied on a zig-zag *greca* to signal Latin American influence, the final direction replaces filled planes with **routed line structures (chamfered traces and nodes) resembling a motherboard.** 
This is not an abandonment of the Latin American theme, but a direct translation of it:
- **Andean Textile Arts:** In Paracas textiles, the structural device is the edge, not the fill. Specifically, they use non-contiguous reversed-L borders that wrap fields without enclosing them.
- ***Ñawi awapa* (Eye Borders) & *Chinka chinka*:** These traditional Andean edging techniques translate to "dots or dashes of color" and "eye borders" — a line that runs, turns, and terminates in a node.
- **The Synthesis:** A circuit board and an Andean eye-border share the exact same visual grammar. By using 45° chamfered traces on a dark ground (`ink`), we maintain the precision of logic (LOGICA's tech identity) while strictly adhering to documented Latin American structural rules.

## Color and type

- A saturated palette pulled from the specific pieces documented in the reference doc — not desaturated corporate blue-and-gray, and not invented independently of the actual art. Pick 2-3 as primary plus neutrals; don't use all of them at once on one screen.
- Pair a bold display face (mural-lettering energy) for headings with a clean, highly legible body face. The contrast is the point — don't let decoration hurt readability.
- Encode the palette and type scale as Tailwind theme tokens, not one-off hex codes scattered through components.

## Motion — GSAP + Lottie, but not for everything

- **Default to native CSS first.** Scroll-driven animations (`animation-timeline: scroll()`), transitions, `@starting-style` handle most reveals and parallax cheaply with no JS. Use this for anything simple.
- **Reach for GSAP when you need real orchestration**: ScrollTrigger for scroll-tied mural reveals, SplitText for staggered text reveals, MorphSVG for shape transitions (GreenSock made all plugins free — no club license needed anymore). This is where GSAP earns its weight; don't import it for a single fade-in.
- **Lottie** (`@lottiefiles/dotlottie-react` or `lottie-react`) for vector illustration/animation that would be painful to hand-code in SVG/CSS — a spotlight badge, an empty-state illustration, a loading mark. Use the compressed `.lottie` format, not raw Lottie JSON — it's a fraction of the size.
- Every animation needs a `prefers-reduced-motion` fallback. Not optional.

## "Interactive with purpose," concretely

Motion should communicate something, not just move:

- A scroll-triggered reveal on the landing page tells the club's story in sequence (who we are → what we do → get involved), not a generic fade-up on every div.
- Hover/focus states signal what's actually interactive — don't animate static content just because you can.
- If an effect doesn't change what the user understands or can do, cut it. Same bar `/logica-lean` applies to code — apply it to motion too.

## Performance — the site cannot feel slow

This gets checked, not assumed:

- GSAP/Lottie are dynamically imported only on the pages/components that use them — never in the global bundle.
- The hero renders and is readable immediately. Animation enhances it after load; it never blocks first paint.
- Animate `transform`/`opacity` only. Anything that triggers layout on scroll (`width`, `top`, spreading box-shadow) will jank.
- Compress every Lottie/SVG/image asset before committing it. No multi-megabyte PNGs.
- Rough bar: Lighthouse performance ≥ 90 on the landing page, LCP under 2.5s on a throttled connection. Check the Lighthouse panel before calling a page done.

## Build order: skeleton against the real backend, then design, then polish

Reversed from the earlier design-first plan — backend is shipping faster than frontend right now, so we need working pages hitting the real API to know what we're actually designing for, instead of a mockup built on guesses about response shape. Sequence:

1. **Research** — the art/color/interaction reference doc (multiple Latin American countries, specific pieces, real colors pulled from them — see "Reference points" above). Done, see `logica_DESIGN.md`.
2. **Skeleton** — a functional page wired to the real backend (`NEXT_PUBLIC_API_URL`): real data, real loading/empty/error states, unstyled or minimally styled. This is what proves out the data before any visual decision gets locked in.
3. **Design** — once the skeleton's data shape is proven live, turn the research into an actual visual mockup (Figma, pencil.dev, or equivalent): layout, color, type, key interactions. Share the link via a short `.md` file in this repo, with a preview screenshot so it's reviewable without opening the tool.
4. **Polish** — tune the skeleton in place to match the mockup from step 3: the full Latin American art-influenced treatment (grid, palette, motion).

Performance and accessibility bars above still apply from step 2 onward, not just at the end.
