Night art (V3) from `~/Documents/logica.pen`, the "HANDOFF · APPLY · Website" frames.

- `v3-<page>.webp` is a desktop frame (1440 wide) and `v3-<page>-mobile.webp` its phone frame (390 wide),
  both exported at 2x with only the art layers (painted panels, the dark bands between them, and the
  shades). Content and glass panels are HTML, not part of the image.
- Routes without their own frame reuse one of these; see `scenes` in `src/components/club/JourneyBackdrop.tsx`.
- `dashboard-night.webp` is the painting behind the member dashboard.

Each painting is drawn at exactly the page width, so browser zoom never rescales it; a longer page
continues in the painting's bottom colour. Source paintings: `~/Documents/generated*.png` and
`~/Documents/logica-assets/` (`v3-team-uic-cs-night.png`, `generated/*-mobile-v3.png`).
