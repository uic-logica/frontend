"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { ClubShell } from "@/components/club/ClubShell";
import { ApiError, api } from "@/lib/api";
import { Description } from "../EventsList";

type Event = { id: string; title: string; description: string | null; location: string | null; startsAt: string; link: string | null };

// Same fixed zone as the events list: the events are in Chicago.
const when = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Chicago",
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

/** Public event details. Board tools (materials, check-in) live in the dashboard's Events section. */
export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [event, setEvent] = useState<Event | null>(null);
  const [eventError, setEventError] = useState<"missing" | "failed" | null>(null);

  useEffect(() => {
    api<Event>(`/api/events/${id}`)
      .then(setEvent)
      // A bad or stale URL is permanent; telling someone to "try again later"
      // sends them back to the same 404 forever.
      .catch((e: unknown) =>
        setEventError(e instanceof ApiError && e.status === 404 ? "missing" : "failed"),
      );
  }, [id]);

  return (
    <ClubShell>
      <main className="site-page event-page">
        {event ? (
          <>
            <header className="page-head">
              <h1>{event.title}</h1>
              <p className="page-kicker">
                {when.format(new Date(event.startsAt))}
                {event.location ? ` · ${event.location}` : ""}
              </p>
            </header>
            {(event.description || event.link) && (
              <section className="event-body page-card glass">
                {event.description && <Description text={event.description} className="event-description" />}
                {event.link && (
                  <a href={event.link} target="_blank" rel="noopener noreferrer" className="site-button">
                    RSVP ↗
                  </a>
                )}
              </section>
            )}
            <Link href="/events" className="event-back">← All events</Link>
          </>
        ) : eventError ? (
          <header className="page-head">
            <h1>{eventError === "missing" ? "Event not found" : "Event details"}</h1>
            <p>
              {eventError === "missing" ? (
                <>
                  That event doesn&apos;t exist, or it&apos;s been taken down.{" "}
                  <Link href="/events" className="font-bold text-signal hover:underline">
                    See what&apos;s coming up
                  </Link>
                  .
                </>
              ) : (
                "Event details are not available right now. Please try again later."
              )}
            </p>
          </header>
        ) : (
          <p className="text-body-sm text-white">Loading…</p>
        )}
      </main>
    </ClubShell>
  );
}
