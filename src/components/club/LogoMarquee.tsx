import Image from "next/image";

export type MarqueeLogo = {
  name: string;
  /** A file in public/logos, brand colours on transparent, readable on white. */
  src: string;
  /** Intrinsic size, so the tile reserves its box before the logo loads. */
  width: number;
  height: number;
};

/** A logo in its brand colours on a white tile (white in dark mode too, so every brand reads). */
export function LogoTile({ name, src, width, height, hidden = false }: MarqueeLogo & { hidden?: boolean }) {
  return (
    <span className="site-logo-tile">
      <Image src={src} alt={hidden ? "" : name} width={width} height={height} sizes="200px" />
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
