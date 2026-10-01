/** logica.pen "HANDOFF · APPLY · Website · Desktop" frames (V3), exported at 2x with only their art
 * layers (panels, transitions, shades): [width, height, colour of its bottom edge]. */
const art: Record<string, [number, number, string]> = {
  "v3-home": [2880, 9426, "#080b1c"],
  "v3-about": [2880, 2832, "#191521"],
  "v3-events": [2880, 2424, "#0e101e"],
  "v3-team": [2880, 3480, "#080b1c"],
  "v3-blog": [2880, 2240, "#090b1c"],
  "v3-join": [2880, 3980, "#0d0d1c"],
  "v3-signin": [2880, 2424, "#090d1d"],
};

/** The matching "Website · Mobile" frames, also 2x: [width, height, colour of its bottom edge]. */
const phoneArt: Record<string, [number, number, string]> = {
  "v3-home": [780, 5640, "#0d1124"],
  "v3-about": [780, 2670, "#0e1228"],
  "v3-events": [780, 1690, "#070b15"],
  "v3-team": [780, 2410, "#060a15"],
  "v3-blog": [780, 1590, "#070a1c"],
  "v3-join": [780, 4030, "#2c2331"],
  "v3-signin": [780, 1830, "#0b1121"],
};

/** Only real phones get the phone painting: a narrow desktop window (for example at 200% zoom)
 * keeps the desktop one, so zooming never swaps the picture. */
export const PHONE_MEDIA = "(max-width: 799px) and (pointer: coarse)";

/** Which painting each route opens on. Detail routes ("events/*") share their parent's. */
const scenes: Record<string, string> = {
  "": "v3-home",
  about: "v3-about", events: "v3-events", team: "v3-team", blog: "v3-blog", join: "v3-join",
  signin: "v3-signin", signup: "v3-signin", "speaker-signin": "v3-signin", invite: "v3-signin",
  speak: "v3-events", attendance: "v3-events", partner: "v3-events",
  feed: "v3-team", forms: "v3-join",
  privacy: "v3-about", terms: "v3-about", support: "v3-about",
};

/** The painting for a route: file, size, and the colour that continues below it. */
export function sceneFor(pathname: string) {
  const source = scenes[pathname.split("/")[1] ?? ""] ?? "v3-about";
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
