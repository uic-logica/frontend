/** logica.pen "Variant E (night)" paintings (frames 28–33; Events is events-night5, the rest *-night4): [width, height, colour of its bottom edge]. */
const art: Record<string, [number, number, string]> = {
  "journey-c-night": [2880, 9426, "#231923"],
  "page-about-night": [2880, 4160, "#2f2c3b"],
  "page-events-night": [2880, 5160, "#21232e"],
  "page-team-night": [2880, 3480, "#232233"],
  "page-blog-night": [2880, 2240, "#171624"],
  "page-join-night": [2880, 3980, "#241923"],
};

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
  return { source, width, height, ground };
}

/** One painting per page, as in logica.pen: always exactly the window width
 * from the top of the page, never rescaled (so browser zoom can't change it). It scrolls with the content 1:1,
 * so the glass cards and the art behind them never drift apart. */
export function JourneyBackdrop({ pathname }: { pathname: string }) {
  const { source, width, height } = sceneFor(pathname);

  return (
    <div className="journey-backdrop" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/journey/${source}.webp?v=${process.env.NEXT_PUBLIC_ART_VERSION}`} width={width} height={height} alt="" fetchPriority="high" decoding="async" className="journey-paint" />
    </div>
  );
}
