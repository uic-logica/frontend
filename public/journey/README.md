Night art ("Variant E (night)") from `/Users/nicolasrufino/Documents/logica.pen`, frames 28–33.

- `journey-c-night.webp` (home) and `page-*-night.webp` (About, Events, Team, Blog, Join; the
  other routes reuse these, see `scenes` in `src/components/club/JourneyBackdrop.tsx`) are
  2880px wide, built by `~/Documents/logica-assets/variant-c/compose_night.py`
  (the `*-night2.webp` outputs, copied here without the "2").
- `skyline-`, `lake-`, `pilsen-`, `blue-line-`, `campus-`, `golden-hour-night.webp` are the single
  night scenes behind the member dashboard sections.

Each painting is drawn at exactly the page width and anchored to the bottom of the page, so
browser zoom never rescales it; extra height above it is filled with its own sky colour.
There are no phone-specific night paintings yet: phones show the centre of the desktop art.

The earlier orange (Variant C) and dusk (Variant D) art lives in git history: commit 0ee0ee9
on `redesign/variant-c`.
