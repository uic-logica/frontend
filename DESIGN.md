# Frontend design direction

## The concept

LOGICA sits at the intersection of logic and art — the site should look like it. The visual language blends the precision of logic (grids, geometric structure, the kind of exactness kinetic/op art is built on) with the color and narrative energy of Latin American art: muralism, kinetic art, and folk craft. Not a generic SaaS template with a warm color swap — an actual point of view.

## Reference points

No examples here on purpose. Research and pick your own — specific artists, movements, and individual pieces, not generic labels. **Required: cover multiple Latin American countries, not just one or two.** LOGICA represents Latinos broadly; the final set of references has to reflect that, not lean on whichever couple of countries are easiest to find material on.

Document what you land on — the specific pieces, why each one fits, what it contributes (color, pattern, motion, composition) — in the detailed reference doc (see `frontend#18`/`#19`), not here.

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

## Build order: design first, then build it for real

Design happens before code, not alongside it. The old approach here was "ship a rough functional draft, polish it later" — that's gone. Instead:

1. **Research** — the art/color/interaction reference doc (multiple Latin American countries, specific pieces, real colors pulled from them — see "Reference points" above). No code, no visual design tool yet.
2. **Design** — turn that research into an actual visual mockup (Figma or equivalent): layout, color, type, key interactions, all of it. This has to be genuinely good and complete before moving on — not a placeholder to refine later, it's what gets built. Share the link via a short `.md` file in this repo, with a preview screenshot so it's reviewable without opening Figma.
3. **Build** — implement the page directly from the finished design in step 2. This isn't a rough skeleton to be polished afterward — the visual work already happened in step 2, so the code should already look right from the first PR.

Don't start coding a page before step 2 is actually done. Performance and accessibility bars above still apply once you're building.
