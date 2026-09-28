Artwork from `/Users/nicolasrufino/Documents/logica.pen`, frame "Variant C2 - Mapier-exact city scale".

`journey-c2.webp` (1536 x 12400) is the whole journey as one painting, and every
page opens on a different part of it (see `scenes` in JourneyBackdrop.tsx). It
opens on the Chicago skyline, then the Lake Michigan horizon, Pilsen, the Blue
Line at Halsted, the UIC campus, and golden hour over the city.

Each landmark is scaled so it occupies exactly the pixel height of the
corresponding band in mapier.ai's journey artwork (343, 43, 343, 433, 416 and
454px on a 1536-wide canvas), with ~1900px of open sky and water between them.
That is what keeps the cities small enough for page content to sit over them.

Built by `~/Documents/logica-assets/variant-c2/compose2.py` from the original
generated paintings; the band measurements live in that script. The older
Variant C files (`journey-c.webp` and the single-scene images) are unused.

Update 2026-09-25: `journey-c.webp` (home) and `page-*.webp` are now the 2880px-wide
`-hd` paintings the logica.pen desktop mocks (09, 11–15) use, and `journey-mobile.webp` /
`page-*-mobile.webp` are the phone paintings from the mobile mocks (16–21), all copied from
`~/Documents/logica-assets/variant-c/`.
