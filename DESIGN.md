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

## Build order: functional first, polished second

Ship a working version before a polished one. Standard incremental delivery: something complete and usable at every stage, not a finished piece you only get at the very end.

1. **First:** real page structure, real content hierarchy, Tailwind tokens in place, one interaction proven working end to end. Not polished. Functional.
2. **Then:** the actual visual treatment described above — real motion, real illustration — built on top of the structure from step 1, not replacing it.

Don't skip to step 2. A polished animation on a page with no real structure under it is a worse deliverable than a plain page that's actually there.
