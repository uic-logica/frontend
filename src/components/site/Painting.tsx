import Image from "next/image";

/**
 * A Chicago painting from public/art in its light and dark versions. CSS shows
 * the one for the current theme; the box is sized by its class, so nothing
 * shifts while it loads.
 * ponytail: both versions are lazy, so the hidden one is never fetched. That
 * includes the hero: no preload, because the server can't know a saved theme.
 */
export function Painting({ name, sizes, className = "", high }: { name: string; sizes: string; className?: string; high?: boolean }) {
  return (
    <div className={`site-art ${className}`} aria-hidden="true">
      {(["light", "dark"] as const).map((theme) => (
        <Image
          key={theme}
          className={`only-${theme}`}
          src={`/art/${name}-${theme}.webp`}
          alt=""
          fill
          sizes={sizes}
          fetchPriority={high ? "high" : undefined}
        />
      ))}
    </div>
  );
}
