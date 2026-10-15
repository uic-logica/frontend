"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { ClubShell } from "@/components/club/ClubShell";
import { SiteIcon } from "@/components/site/icons";
import { ApiError, api } from "@/lib/api";
import { eventDate, type ClubEvent } from "@/lib/events";
import { downloadIcs } from "@/lib/ics";
import { Description } from "../EventsList";

/** Public event details (logica.pen V4 "04 Event detail"). Board tools (materials, check-in) live in the dashboard's Events section. */
export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [event, setEvent] = useState<ClubEvent | null>(null);
  const [eventError, setEventError] = useState<"missing" | "failed" | null>(null);

  useEffect(() => {
    api<ClubEvent>(`/api/events/${id}`)
      .then(setEvent)
      // A bad or stale URL is permanent; telling someone to "try again later"
      // sends them back to the same 404 forever.
      .catch((e: unknown) => setEventError(e instanceof ApiError && e.status === 404 ? "missing" : "failed"));
  }, [id]);

  const d = event && eventDate(event.startsAt);

  return (
    <ClubShell>
      <main className="site-page event-page">
        <Link href="/events" className="site-back"><SiteIcon name="arrow" /> All events</Link>
        {event && d ? (
          <>
            <header className="event-head">
              <span className="site-date event-date"><b>{d.month}</b><span>{d.day}</span></span>
              <h1 className="serif">{event.title}</h1>
            </header>
            <ul className="event-meta">
              <li><SiteIcon name="calendar" /> {d.full}</li>
              {event.location && <li><SiteIcon name="pin" /> {event.location}</li>}
            </ul>
            <div className="event-actions">
              {event.link && (
                <a href={event.link} target="_blank" rel="noopener noreferrer" className="site-btn">RSVP</a>
              )}
              <button type="button" className="site-btn secondary" onClick={() => downloadIcs(event)}>Add to calendar</button>
            </div>
            {event.description && (
              <section className="event-about" aria-labelledby="about-event">
                <h2 id="about-event" className="serif">About this event</h2>
                <Description text={event.description} className="event-description" />
              </section>
            )}
          </>
        ) : eventError ? (
          <header className="site-page-head event-missing">
            <h1 className="serif">{eventError === "missing" ? "Event not found" : "Event details"}</h1>
            <p>
              {eventError === "missing" ? (
                <>That event doesn&apos;t exist, or it&apos;s been taken down. <Link href="/events">See what&apos;s coming up</Link>.</>
              ) : (
                "Event details are not available right now. Please try again later."
              )}
            </p>
          </header>
        ) : (
          <p className="site-muted" role="status">Loading…</p>
        )}
      </main>
    </ClubShell>
  );
}
