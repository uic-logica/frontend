import { ClubShell, PageContainer, SectionContainer } from "@/components/club/ClubShell";
import { PinkLink } from "@/components/club/Typewriter";
import { EventsList, type ClubEvent } from "./EventsList";
import { SubscribeForm } from "./SubscribeForm";

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

export default async function EventsPage() {
  const { upcoming, past, error } = await getEvents();

  return (
    <ClubShell>
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

        <SectionContainer>
          <div id="speakers" className="mx-auto mb-12 max-w-3xl border-b border-white/20 pb-4 text-center">
            <h2 className="type-h2 text-white">Upcoming Speakers</h2>
            <p className="mt-2 text-body-lg text-white">
              People presenting at upcoming LOGICA talks and workshops
            </p>
          </div>
          <div className="club-card mx-auto w-fit max-w-xl p-8">
            <h3 className="type-h4 text-white">To be announced</h3>
            <p className="mt-3 text-body text-white">Check back soon for our speaker lineup this semester.</p>
            <PinkLink href="/speak" className="mt-6 text-xl">
              Want to speak at LOGICA? Join the speaker lineup
            </PinkLink>
          </div>
        </SectionContainer>

        <div id="subscribe">
          <SectionContainer>
            <SubscribeForm />
          </SectionContainer>
        </div>
      </PageContainer>
    </ClubShell>
  );
}
