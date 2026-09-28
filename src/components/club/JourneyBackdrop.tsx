/** logica.pen "Variant E (night)" paintings (frames 28–33; Events is events-night5, the rest *-night4): [width, height, colour of its bottom edge]. */
const art: Record<string, [number, number, string]> = {
  "journey-c-night": [2880, 9426, "#231923"],
  "page-about-night": [2880, 4160, "#2f2c3b"],
  "page-events-night": [2880, 5160, "#21232e"],
  "page-team-night": [2880, 3480, "#232233"],
  "page-blog-night": [2880, 2240, "#171624"],
  "page-join-night": [2880, 3980, "#241923"],
};

/** Phone paintings from logica.pen "37–42 … Variant E (night) · mobile": [width, height, colour of its bottom edge]. */
const phoneArt: Record<string, [number, number, string]> = {
  "journey-c-night": [780, 7726, "#281b24"],
  "page-about-night": [780, 4716, "#1b2230"],
  "page-events-night": [780, 2530, "#22212a"],
  "page-team-night": [780, 3328, "#6a5d68"],
  "page-blog-night": [780, 2334, "#11172a"],
  "page-join-night": [780, 4850, "#211823"],
};

/** Only real phones get the phone painting: a narrow desktop window (for example at 200% zoom)
 * keeps the desktop one, so zooming never swaps the picture. */
export const PHONE_MEDIA = "(max-width: 799px) and (pointer: coarse)";

/** Which painting each route opens on. Detail routes ("events/*") share their parent's. */
const scenes: Record<string, string> = {
  "": "journey-c-night",
  about: "page-about-night", events: "page-events-night", team: "page-team-night",
  blog: "page-blog-night", join: "page-join-night",
  signin: "page-blog-night", "speaker-signin": "page-blog-night",
  speak: "page-events-night", attendance: "page-events-night",
  feed: "page-team-night", forms: "page-join-night",
  privacy: "page-about-night", terms: "page-about-night", support: "page-about-night",
};

/** The painting for a route: file, size, and the colour that continues below it. */
export function sceneFor(pathname: string) {
  const source = scenes[pathname.split("/")[1] ?? ""] ?? "page-about-night";
  const [width, height, ground] = art[source];
  const phone = phoneArt[source];
  return { source, width, height, ground, phone };
}

/** The painting URL this browser will actually use for a route (phone or desktop). */
export function artUrl(pathname: string) {
  const { source, phone } = sceneFor(pathname);
  const onPhone = phone && typeof window !== "undefined" && window.matchMedia(PHONE_MEDIA).matches;
  return `/journey/${source}${onPhone ? "-mobile" : ""}.webp?v=${process.env.NEXT_PUBLIC_ART_VERSION}`;
}

/** Download and decode the paintings for these routes ahead of time, so switching
 * pages shows the next painting from cache instead of a blank frame while it loads.
 * Skipped when the visitor asked to save data. */
export function warmArt(pathnames: string[]) {
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) return;
  for (const url of new Set(pathnames.map(artUrl))) {
    const img = new Image();
    img.src = url;
    img.decode().catch(() => {});
  }
}

/** One painting per page, as in logica.pen: always exactly the window width
 * from the top of the page, never rescaled (so browser zoom can't change it). It scrolls with the content 1:1,
 * so the glass cards and the art behind them never drift apart. */
export function JourneyBackdrop({ pathname }: { pathname: string }) {
  const { source, width, height, phone } = sceneFor(pathname);
  const v = process.env.NEXT_PUBLIC_ART_VERSION;

  return (
    <div className="journey-backdrop" aria-hidden="true">
      <picture>
        {phone ? <source media={PHONE_MEDIA} srcSet={`/journey/${source}-mobile.webp?v=${v}`} width={phone[0]} height={phone[1]} /> : null}
        { }
        <img src={`/journey/${source}.webp?v=${v}`} width={width} height={height} alt="" fetchPriority="high" decoding="sync" className="journey-paint" />
      </picture>
    </div>
  );
}
