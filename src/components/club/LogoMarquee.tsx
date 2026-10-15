import Image from "next/image";

export type MarqueeLogo = {
  name: string;
  /** A file in public/logos, brand colours on transparent, readable on white. */
  src: string;
  /** Intrinsic size, so the tile reserves its box before the logo loads. */
  width: number;
  height: number;
};

/**
 * Optical size: every logo gets about the same ink area, so a long wordmark
 * (Morningstar) and a square mark (Space Apps) look equally heavy. Capped to
 * the tile's inner box (104×44).
 */
function fit(width: number, height: number) {
  const ratio = width / height;
  const h = Math.min(44, Math.sqrt(2600 / ratio), 104 / ratio);
  return { width: Math.round(h * ratio), height: Math.round(h) };
}

/** A logo in its brand colours on a white tile (white in dark mode too, so every brand reads). */
export function LogoTile({ name, src, width, height, hidden = false }: MarqueeLogo & { hidden?: boolean }) {
  return (
    <span className="site-logo-tile">
      <Image src={src} alt={hidden ? "" : name} {...fit(width, height)} sizes="208px" />
    </span>
  );
}

/** "Where our members land": the tiles keep sliding; hover or reduced motion stops them. */
export function LogoMarquee({ items }: { items: MarqueeLogo[] }) {
  return (
    <div className="site-marquee">
      <ul className="site-marquee-track">
        {[...items, ...items].map((item, i) => (
          <li key={`${item.name}-${i}`} aria-hidden={i >= items.length || undefined}>
            <LogoTile {...item} hidden={i >= items.length} />
          </li>
        ))}
      </ul>
    </div>
  );
}
