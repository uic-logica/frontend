import Image, { getImageProps } from "next/image";

/**
 * A Chicago painting from public/art in its light and dark versions. The box
 * is sized by its class, so nothing shifts while it loads.
 *
 * Usually both versions are lazy and CSS shows the one for the current theme,
 * so the hidden one is never fetched. The hero (`high`) is the page's largest
 * paint and can't wait for lazy loading: it's a <picture> that picks by the
 * computer's light/dark setting and loads at once. A theme picked on the site
 * that disagrees with the computer swaps it for a lazy copy (site.css,
 * `.art-auto` / `.art-force-*`).
 */
export function Painting({ name, sizes, className = "", high }: { name: string; sizes: string; className?: string; high?: boolean }) {
  const src = (theme: "light" | "dark") => `/art/${name}-${theme}.webp`;
  const lazy = (theme: "light" | "dark", cls: string) => (
    <Image key={theme} className={cls} src={src(theme)} alt="" fill sizes={sizes} />
  );

  if (!high) {
    return (
      <div className={`site-art ${className}`} aria-hidden="true">
        {lazy("light", "only-light")}
        {lazy("dark", "only-dark")}
      </div>
    );
  }

  const { props: dark } = getImageProps({ src: src("dark"), alt: "", fill: true, sizes });
  const { props: light } = getImageProps({ src: src("light"), alt: "", fill: true, sizes, loading: "eager", fetchPriority: "high" });
  return (
    <div className={`site-art ${className}`} aria-hidden="true">
      <picture className="art-auto">
        <source media="(prefers-color-scheme: dark)" srcSet={dark.srcSet} sizes={sizes} />
        {/* eslint-disable-next-line jsx-a11y/alt-text -- alt="" comes from getImageProps */}
        <img {...light} />
      </picture>
      {lazy("light", "art-force-light")}
      {lazy("dark", "art-force-dark")}
    </div>
  );
}
