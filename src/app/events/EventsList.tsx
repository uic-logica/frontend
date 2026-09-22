"use client";

import Link from "next/link";
import { useState } from "react";
import { downloadIcs } from "@/lib/ics";
import { PinkLink } from "@/components/club/Typewriter";

export type ClubEvent = {
  id: string;
  title: string;
  location: string | null;
  startsAt: string;
  description?: string | null;
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
      <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
        {(["upcoming", "past"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`text-lg font-semibold capitalize ${
              tab === t ? "text-signal underline" : "text-white hover:text-white"
            }`}
          >
            {t === "upcoming" ? "Upcoming Events" : "Past Events"}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 text-body text-signal">{error}</p>}

      {list.length === 0 && (
        <div className="club-card mx-auto w-fit max-w-xl p-8">
          <h2 className="type-h3 text-white">
            {tab === "upcoming" ? "No upcoming events scheduled" : "No past events listed"}
          </h2>
          <p className="mt-3 max-w-xl text-body text-white">
            We&apos;re currently planning our next round of events. Check back soon or join
            the newsletter to be notified.
          </p>
          <PinkLink href="/join" className="mt-6 text-xl">
            Stay Updated
          </PinkLink>
        </div>
      )}

      <ul className="mx-auto max-w-3xl space-y-4">
        {list.map((e) => (
          <li
            key={e.id}
            id={e.id}
            className="club-card club-card-interactive p-6"
          >
            <Link href={`/events/${e.id}`} className="hover:underline">
              <h2 className="type-h3 text-white">{e.title}</h2>
            </Link>
            <p className="mt-2 text-body-sm text-white">
              {when.format(new Date(e.startsAt))}
              {e.location ? ` · ${e.location}` : ""}
            </p>
            {e.description && <p className="mt-3 text-body text-white">{e.description}</p>}
            <div className="mt-4 flex flex-wrap gap-4">
              <Link href={`/events/${e.id}`} className="font-semibold text-signal hover:underline">
                Details, materials &amp; notes
              </Link>
              <Link href="/signin" className="font-semibold text-signal hover:underline">
                RSVP (members)
              </Link>
              <button
                type="button"
                onClick={() => downloadIcs(e)}
                className="font-semibold text-signal hover:underline"
              >
                Add to calendar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
