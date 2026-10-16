"use client";

import Link from "next/link";
import { useState } from "react";
import { downloadIcs } from "@/lib/ics";
import { linkParts } from "@/lib/linkify";
import { eventDate, type ClubEvent } from "@/lib/events";

export type { ClubEvent };

// ponytail: the upcoming/past split comes from the server (lib/events.ts), so
// nothing here reads the clock during hydration.
export function EventsList({ upcoming, past, error }: { upcoming: ClubEvent[]; past: ClubEvent[]; error?: string | null }) {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const list = tab === "upcoming" ? upcoming : past;

  return (
    <div className="events-list-wrap">
      <div className="site-tabs" role="group" aria-label="Which events">
        {(["upcoming", "past"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} aria-pressed={tab === t}>
            {t === "upcoming" ? "Upcoming" : "Past"}
          </button>
        ))}
      </div>

      {error && <p className="site-error" role="alert">{error}</p>}

      {list.length === 0 ? (
        <p className="site-empty">{tab === "upcoming" ? "No upcoming events scheduled" : "No past events listed"}</p>
      ) : (
        <ul className="events-list">
          {list.map((e) => {
            const d = eventDate(e.startsAt);
            return (
              <li key={e.id} id={e.id}>
                <span className="site-date"><b>{d.month}</b><span>{d.day}</span></span>
                <div className="events-item-text">
                  <h2><Link href={`/events/${e.id}`}>{e.title}</Link></h2>
                  <p>{[d.weekdayTime, e.location].filter(Boolean).join(" · ")}</p>
                </div>
                <div className="events-item-actions">
                  {e.startsAt && <button type="button" className="site-btn secondary sm" onClick={() => e.startsAt && downloadIcs({ ...e, startsAt: e.startsAt })}>Add to calendar</button>}
                  {e.link && (
                    <a href={e.link} target="_blank" rel="noopener noreferrer" className="site-btn secondary sm">RSVP</a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** An event description as written: line breaks kept (CSS), http(s) links clickable. */
export function Description({ text, className }: { text: string; className?: string }) {
  return (
    <p className={className}>
      {linkParts(text).map((part, i) =>
        part.href ? (
          <a key={i} href={part.href} target="_blank" rel="noopener noreferrer">
            {part.text}
          </a>
        ) : (
          part.text
        ),
      )}
    </p>
  );
}
