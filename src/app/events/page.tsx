import { pageMetadata, siteUrl } from "@/lib/seo";
import { ClubShell, PageContainer, SectionContainer } from "@/components/club/ClubShell";
import { EventsList, type ClubEvent } from "./EventsList";

export const metadata = pageMetadata("Events & Workshops", "Explore LOGICA events at UIC, including computing workshops, company visits, guest speakers, and community gatherings.", "/events");

// ponytail: fetched on the server and cached, so the page arrives with the
// events already in the HTML — no "Loading…" flash on every visit. Next
// revalidates in the background, so a new event shows up within 5 minutes
// without anyone redeploying.
const REVALIDATE_SECONDS = 300;

type EventsData = { upcoming: ClubEvent[]; past: ClubEvent[]; error: string | null };

function split(events: ClubEvent[], error: string | null): EventsData {
  const now = Date.now();
  return {
    upcoming: events.filter((e) => new Date(e.startsAt).getTime() >= now),
    past: events.filter((e) => new Date(e.startsAt).getTime() < now),
    error,
  };
}

async function getEvents(): Promise<EventsData> {
  // The browser goes through next.config.ts's /api/* rewrite; on the server
  // there's no origin to be relative to, so hit the backend directly.
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  try {
    const res = await fetch(`${base}/api/events`, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const body = await res.json();
    return split(Array.isArray(body) ? body : [], null);
  } catch {
    // A backend blip shouldn't blank the whole page — the rest is static copy.
    return split([], "Couldn't load events right now.");
  }
}

/** Layout is logica.pen "30 Events — Variant E (night)": title, tabs, events. */
export default async function EventsPage() {
  const { upcoming, past, error } = await getEvents();

  return (
    <ClubShell>
      {upcoming.map((event) => (
        <script
          key={event.id}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org", "@type": "Event", name: event.title,
            startDate: event.startsAt, eventStatus: "https://schema.org/EventScheduled",
            eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
            ...(event.description ? { description: event.description } : {}),
            ...(event.location ? { location: { "@type": "Place", name: event.location } } : {}),
            url: new URL(`/events/${event.id}`, siteUrl).href,
            organizer: { "@type": "Organization", name: "LOGICA @ UIC", url: siteUrl.href },
          }).replace(/</g, "\\u003c") }}
        />
      ))}
      <PageContainer>
        <SectionContainer>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="type-title text-3xl text-white md:text-4xl">Events</h1>
            <p className="mt-4 text-body-lg text-white">
              From workshops to socials, hack nights to tech talks — we host events each semester.
            </p>
          </div>
        </SectionContainer>

        <SectionContainer>
          <EventsList upcoming={upcoming} past={past} error={error} />
        </SectionContainer>
      </PageContainer>
    </ClubShell>
  );
}
