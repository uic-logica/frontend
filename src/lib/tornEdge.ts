/**
 * Deterministic torn-paper edge: a jagged clip-path so a panel reads as cut
 * from the wallpaper's own paper-collage material instead of a plain rect.
 * Seeded (not Math.random) so server and client render the identical
 * polygon — otherwise React would hydration-mismatch on every panel.
 */
export function seededRandom(seed: number) {
  let t = seed;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashSeed(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return h;
}

/** `jag` is the max tooth depth as a percent of the panel's own height. */
export function tornEdgeClipPath(seed: string, points = 10, jag = 2) {
  const rand = seededRandom(hashSeed(seed));
  const top: string[] = [];
  const bottom: string[] = [];
  for (let i = 0; i <= points; i++) {
    const x = (i / points) * 100;
    const yTop = Math.max(0, (rand() - 0.3) * jag * 2).toFixed(2);
    const yBottom = (100 - Math.max(0, (rand() - 0.3) * jag * 2)).toFixed(2);
    top.push(`${x.toFixed(2)}% ${yTop}%`);
    bottom.push(`${x.toFixed(2)}% ${yBottom}%`);
  }
  return `polygon(${top.join(", ")}, ${bottom.reverse().join(", ")})`;
}
