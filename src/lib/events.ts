export type ClubEvent = {
  id: string;
  title: string;
  location: string | null;
  startsAt: string;
  description?: string | null;
  link: string | null;
};

export type EventsData = { upcoming: ClubEvent[]; past: ClubEvent[]; error: string | null };

// ponytail: fetched on the server and cached, so pages arrive with the events
// already in the HTML (no "Loading…" flash). Next revalidates in the
// background, so a new event shows up within 5 minutes without a redeploy.
const REVALIDATE_SECONDS = 300;

// ponytail: the upcoming/past split is done here on the server, not in the
// browser: comparing against Date.now() during hydration would read a
// different clock than the prerender did and React would flag a mismatch.
export function splitEvents(events: ClubEvent[], error: string | null, now = Date.now()): EventsData {
  const at = (e: ClubEvent) => new Date(e.startsAt).getTime();
  return {
    upcoming: events.filter((e) => at(e) >= now).sort((a, b) => at(a) - at(b)),
    past: events.filter((e) => at(e) < now),
    error,
  };
}

export async function getEvents(): Promise<EventsData> {
  // The browser goes through next.config.ts's /api/* rewrite; on the server
  // there's no origin to be relative to, so hit the backend directly.
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  try {
    const res = await fetch(`${base}/api/events`, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const body = await res.json();
    return splitEvents(Array.isArray(body) ? body : [], null);
  } catch {
    // A backend blip shouldn't blank the whole page; the rest is static copy.
    return splitEvents([], "Couldn't load events right now.");
  }
}

// Fixed to Chicago rather than the viewer's locale: the events are in Chicago,
// and a fixed zone keeps server and client output identical (no hydration mismatch).
const zone = { timeZone: "America/Chicago" } as const;
const month = new Intl.DateTimeFormat("en-US", { ...zone, month: "short" });
const day = new Intl.DateTimeFormat("en-US", { ...zone, day: "2-digit" });
const weekdayTime = new Intl.DateTimeFormat("en-US", { ...zone, weekday: "short", hour: "numeric", minute: "2-digit" });
const time = new Intl.DateTimeFormat("en-US", { ...zone, hour: "numeric", minute: "2-digit" });
const full = new Intl.DateTimeFormat("en-US", { ...zone, weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" });

/** The pieces the event cards show: "OCT" / "21" / "Tue 6:00 PM" / "6:00 PM" / "Tuesday, October 21, 6:00 PM". */
export function eventDate(startsAt: string) {
  const d = new Date(startsAt);
  return {
    month: month.format(d).toUpperCase(),
    day: day.format(d),
    weekdayTime: weekdayTime.format(d).replace(",", ""),
    time: time.format(d),
    full: full.format(d),
  };
}
