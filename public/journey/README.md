Night art (V3) from `~/Documents/logica.pen`, the "HANDOFF · APPLY · Website" frames.

- `v3-<page>.webp` is a desktop frame (1440 wide, built at 2x) and `v3-<page>-mobile.webp` its phone
  frame (390 wide, built at 3x for 3x phone screens). Only the art layers are in them (painted panels,
  the dark bands between them, the shades); content and glass panels are HTML.
- Built by `~/Documents/logica-assets/v3/compose.py` from 4x upscales (Upscayl, `upscayl-standard-4x`) of
  the source paintings, with the open sky smoothed to remove the sources' compression blocks, then
  `cwebp -q 88 -m 6 -sharp_yuv`.
- Routes without their own frame reuse one of these; see `scenes` in `src/components/club/JourneyBackdrop.tsx`.
- `dashboard-night.webp` is the painting behind the member dashboard.

Each painting is drawn at exactly the page width, so browser zoom never rescales it; a longer page
continues in the painting's bottom colour. Source paintings: `~/Documents/generated*.png` and
`~/Documents/logica-assets/` (`v3-team-uic-cs-night.png`, `generated/*-mobile-v3.png`).
