"use client";

import Link from "next/link";
import { useState } from "react";
import { downloadIcs } from "@/lib/ics";
import { SubscribeForm } from "./SubscribeForm";

export type ClubEvent = {
  id: string;
  title: string;
  location: string | null;
  startsAt: string;
  description?: string | null;
  link: string | null;
};

// ponytail: fixed to Chicago rather than the viewer's locale — the events are
// in Chicago, and a fixed zone keeps server and client output identical so
// this doesn't hydrate-mismatch.
const when = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Chicago",
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

// ponytail: the upcoming/past split is done on the server, not here — if this
// compared against Date.now() it would read a different clock during hydration
// than the prerender did and React would flag a mismatch.
export function EventsList({
  upcoming,
  past,
  error,
}: {
  upcoming: ClubEvent[];
  past: ClubEvent[];
  error?: string | null;
}) {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const list = tab === "upcoming" ? upcoming : past;

  return (
    <>
      <div className="event-tabs" role="group" aria-label="Which events">
        {(["upcoming", "past"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} aria-pressed={tab === t}>
            <span className="only-d">{t === "upcoming" ? "Upcoming Events" : "Past Events"}</span>
            <span className="only-m">{t === "upcoming" ? "Upcoming" : "Past events"}</span>
          </button>
        ))}
        <span className="only-d" aria-hidden>·</span>
        <span className="only-d">Add to Calendar (soon)</span>
      </div>

      {error && <p className="events-error">{error}</p>}

      {list.length === 0 ? (
        <div className="events-empty">
          <div className="page-card glass">
            <h2>{tab === "upcoming" ? "No upcoming events scheduled" : "No past events listed"}</h2>
            <p className="only-d">
              We&apos;re currently planning our next round of events. Check back soon or join the
              newsletter to be notified.
            </p>
            <p className="only-m">We&apos;re planning the next round. Check back soon or join the newsletter for updates.</p>
            {/* The design's "Notify me": opens the newsletter form in place. */}
            <details>
              <summary className="site-button">Notify me</summary>
              <SubscribeForm />
            </details>
          </div>
        </div>
      ) : (
        <ul className="events-list">
          {list.map((e) => (
            <li key={e.id} id={e.id} className="event-card page-card glass">
              <h2>
                <Link href={`/events/${e.id}`}>{e.title}</Link>
              </h2>
              <p className="event-meta">
                {when.format(new Date(e.startsAt))}
                {e.location ? ` · ${e.location}` : ""}
              </p>
              {e.description && <p>{e.description}</p>}
              <div className="event-actions">
                <Link href={`/events/${e.id}`}>Details</Link>
                {e.link && (
                  <a href={e.link} target="_blank" rel="noopener noreferrer">
                    Event page ↗
                  </a>
                )}
                <button type="button" onClick={() => downloadIcs(e)}>
                  Add to calendar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
