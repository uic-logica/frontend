/** Variant C2 art (see public/journey/README.md): intrinsic sizes for each file. */
const art: Record<string, [number, number]> = {
  "journey-c2": [1536, 12400],
  "journey-c": [2880, 9425], lake: [1536, 1789], skyline: [1536, 1762], pilsen: [1536, 1872],
  "blue-line": [1536, 1788], campus: [1536, 1927], "golden-hour": [1536, 1843],
  "page-about": [2880, 4160], "page-events": [2880, 2360], "page-team": [2880, 3480],
  "page-blog": [2880, 2240], "page-join": [2880, 3980],
};

/** Phone-width paintings from the logica.pen mobile mocks (16–21), used below 800px. */
const mobileArt: Record<string, [string, number, number]> = {
  "journey-c": ["journey-mobile", 780, 7738],
  "page-about": ["page-about-mobile", 780, 4716], "page-events": ["page-events-mobile", 780, 2530],
  "page-team": ["page-team-mobile", 780, 3328], "page-blog": ["page-blog-mobile", 780, 2334],
  "page-join": ["page-join-mobile", 780, 4850],
};

/** Every page opens on its own landmark in the one painting: [image, start as
 * a fraction of the image height]. The journey opens on the Chicago skyline, so
 * the homepage starts at 0. Other starts are that route's band top in
 * journey-c2, less half a viewport, so the landmark sits low in the opening
 * frame. Detail routes ("events/*") start a little further in. */
const scenes: Record<string, [string, number]> = {
  "": ["journey-c", 0], // logica.pen "09 Home — Variant C mock": the painting at page width.
  signin: ["page-blog", 0], terms: ["journey-c2", 0.02],
  feed: ["journey-c2", 0.25],
  "speaker-signin": ["journey-c2", 0.338],
  "speaker-signin/*": ["journey-c2", 0.36], "forms/*": ["journey-c2", 0.35],
  "events/*": ["journey-c2", 0.53],
  speak: ["journey-c2", 0.45], "speak/*": ["journey-c2", 0.56],
  attendance: ["journey-c2", 0.63],
  privacy: ["journey-c2", 0.807],
  support: ["journey-c2", 0.1],
  // logica.pen "Variant C mock" pages: one painting per page, sized to it.
  about: ["page-about", 0], events: ["page-events", 0], team: ["page-team", 0],
  blog: ["page-blog", 0], join: ["page-join", 0],
};

/** The painting for a route: [file, start, width, height, phone art]. */
export function sceneFor(pathname: string) {
  const [first = "", detail] = pathname.split("/").slice(1);
  const [source, start] = scenes[detail ? `${first}/*` : first] ?? scenes[first] ?? ["campus", 0];
  const [width, height] = art[source];
  return { source, start, width, height, mobile: mobileArt[source] };
}

/** The painting is part of the page: it scrolls with the content 1:1, so the
 * glass cards and the art behind them never drift apart. It opens at the
 * page's start point and covers the whole page. */
export function JourneyBackdrop({ pathname }: { pathname: string }) {
  const { source, start, width, height, mobile } = sceneFor(pathname);

  return (
    <div className="journey-backdrop" aria-hidden="true">
      <picture>
        {mobile ? <source media="(max-width: 799px)" srcSet={`/journey/${mobile[0]}.webp`} width={mobile[1]} height={mobile[2]} /> : null}
        { }
        <img
          src={`/journey/${source}.webp`}
          width={width}
          height={height}
          alt=""
          fetchPriority="high"
          className="journey-paint"
          data-mobile={mobile ? "" : undefined}
          style={start ? { transform: `translateY(${-start * 100}%)` } : undefined}
        />
      </picture>
    </div>
  );
}
