# Frontend design direction

## The concept

LOGICA sits at the intersection of logic and art — the site should look like it. The visual language blends the precision of logic (grids, geometric structure, the kind of exactness kinetic/op art is built on) with the color and narrative energy of Latin American art: muralism, kinetic art, and folk craft. Not a generic SaaS template with a warm color swap — an actual point of view.

## Reference points (research these — don't copy them)

- **Mexican Muralism** (Diego Rivera, David Alfaro Siqueiros, José Clemente Orozco) — bold flat color blocking, large-scale narrative composition.
- **Venezuelan kinetic/op art** (Carlos Cruz-Diez, Jesús Rafael Soto) — color and line that shift as the viewer moves. This one translates directly to the web: it's basically what scroll- and pointer-driven motion already does.
- **Joaquín Torres-García's Constructivismo Universal** (Uruguay) — geometric grids with pictographic symbols, a precursor to modern info-graphic design.
- **Papel picado and Talavera tile patterns** (Mexico) — repeating cut/geometric patterns. Good source material for section dividers and background texture instead of plain rectangles.
- **Wifredo Lam** (Cuba), **Oaxacan alebrijes** — biomorphic, vivid. Good source material for icon/illustration accents (spotlight, empty states) instead of a generic icon pack.

## Color and type

- A warm, saturated palette drawn from the above — not desaturated corporate blue-and-gray: marigold/cempasúchil orange, cobalt/talavera blue, deep magenta, terracotta, forest green. Pick 2-3 as primary plus neutrals; don't use all of them at once on one screen.
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

## Build order: skateboard, not wheels

Ship the functional version before the beautiful one. This is the standard incremental-delivery idea (Henrik Kniberg's "walking skeleton"/MVP illustration): a skateboard is a complete, ridable thing at every stage; a wheel by itself, or an axle, or a chassis, is not — you only get something usable at the very end if you build it wheel-first.

1. **Skateboard (first):** real page structure, real content hierarchy, Tailwind tokens in place, GSAP/Lottie installed with one interaction proven working end to end. Not pretty. Functional.
2. **Bike → car (after):** the actual visual treatment described above — real motion, real illustration, built on top of the structure from step 1, not replacing it.

Don't skip to step 2. A polished animation sitting on a page with no real structure under it is a worse deliverable than a plain page that's actually there.
