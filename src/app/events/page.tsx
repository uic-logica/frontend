import { pageMetadata, siteUrl } from "@/lib/seo";
import { getEvents } from "@/lib/events";
import { ClubShell } from "@/components/club/ClubShell";
import { EventsList } from "./EventsList";
import { SubscribeForm } from "./SubscribeForm";

export const metadata = pageMetadata("Events & Workshops", "Explore LOGICA events at UIC, including computing workshops, company visits, guest speakers, and community gatherings.", "/events");

/** Layout is logica.pen V4 "03 Events": tabs, the list, the newsletter beside it. */
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
      <main className="site-page">
        <header className="site-page-head">
          <h1 className="serif">Events</h1>
        </header>
        <div className="events-columns">
          <EventsList upcoming={upcoming} past={past} error={error} />
          <aside className="site-card events-aside" aria-labelledby="notify-title">
            <h2 id="notify-title">Never miss one</h2>
            <p>One email a week with what&apos;s coming up. No spam, unsubscribe any time.</p>
            <SubscribeForm />
          </aside>
        </div>
      </main>
    </ClubShell>
  );
}
