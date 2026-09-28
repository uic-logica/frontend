export type MarqueeLogo = {
  name: string;
  src: string;
  /** Render height in px */
  height?: number;
  /** Photo-style artwork with no transparent silhouette: round its corners. */
  photo?: boolean;
};

/** A partner logo in its brand colors. */
export function PartnerLogo({
  name,
  src,
  height = 40,
  photo = false,
  hidden = false,
}: MarqueeLogo & { hidden?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={hidden ? "" : `${name} logo`}
      aria-hidden={hidden}
      className={`partner-logo shrink-0 object-contain ${photo ? "rounded-md" : ""}`}
      style={{ height, width: "auto" }}
    />
  );
}

/**
 * Logo strip in brand colors that keeps sliding.
 */
export function LogoMarquee({
  items,
  className = "",
}: {
  items: MarqueeLogo[];
  className?: string;
}) {
  const row = [...items, ...items];

  return (
    <div className={`marquee-mask relative overflow-hidden py-4 ${className}`}>
      <div className="flex w-max animate-marquee items-center">
        {row.map((item, i) => (
          <div key={`${item.name}-${i}`} className="mr-16 shrink-0">
            <PartnerLogo {...item} hidden={i >= items.length} />
          </div>
        ))}
      </div>
    </div>
  );
}
