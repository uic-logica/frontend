export type MarqueeLogo = {
  name: string;
  src: string;
  /** Render height in px */
  height?: number;
  /** If true, stay monochrome on hover (like some YCS logos). */
  mono?: boolean;
  /** If true, skip the grayscale filter — for full-color photo-style artwork that has no transparent silhouette to reveal. */
  photo?: boolean;
};

/** Shared grayscale-by-default, brand-colors-on-hover logo treatment. */
export function PartnerLogo({
  name,
  src,
  height = 40,
  mono,
  photo = false,
  hidden = false,
}: MarqueeLogo & { hidden?: boolean }) {
  const colorOnHover = mono
    ? "hover:opacity-100"
    : "hover:opacity-100 hover:brightness-100 hover:invert-0";
  const filterClasses = photo
    ? "opacity-80 hover:opacity-100"
    : `opacity-50 brightness-0 invert ${colorOnHover}`;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={hidden ? "" : `${name} logo`}
      aria-hidden={hidden}
      className={`shrink-0 cursor-pointer object-contain transition duration-300 ${photo ? "rounded-md" : ""} ${filterClasses}`}
      style={{ height, width: "auto" }}
    />
  );
}

/**
 * YCS-style logo strip: white/gray by default, brand colors on hover.
 * The strip keeps sliding while hovered; the color reveal is per-logo.
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
