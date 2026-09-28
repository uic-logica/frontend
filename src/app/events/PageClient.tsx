"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ClubShell, PageContainer, SectionContainer } from "@/components/club/ClubShell";

type Event = {
  id: string;
  title: string;
  location: string | null;
  startsAt: string;
  description?: string | null;
};

export default function EventsPage() {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [events, setEvents] = useState<Event[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Event[]>("/api/events")
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch((e: Error) => {
        setError(e.message);
        setEvents([]);
      });
  }, []);

  const [now] = useState(() => Date.now());
  const list =
    events?.filter((e) =>
      tab === "upcoming" ? new Date(e.startsAt).getTime() >= now : new Date(e.startsAt).getTime() < now,
    ) ?? [];

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
          <div className="event-tabs mb-8 flex flex-wrap items-center justify-center gap-4">
            <div className="event-tabs-switch">
              {(["upcoming", "past"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  aria-pressed={tab === t}
                  className={`text-lg font-semibold capitalize ${
                    tab === t ? "text-signal underline" : "text-white hover:text-white"
                  }`}
                >
                  {t === "upcoming" ? "Upcoming Events" : "Past Events"}
                </button>
              ))}
            </div>
            <span className="event-tabs-dot text-white">·</span>
            <span className="event-tabs-cal text-white">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M16 3v4M8 3v4M3 10h18" />
              </svg>
              Add to Calendar (soon)
            </span>
          </div>

          {error && <p className="mb-4 text-center text-body text-signal">{error}</p>}
          {events === null && <p className="text-center text-body text-white">Loading…</p>}

          {events && list.length === 0 && (
            <div className="club-card mx-auto w-full max-w-xl p-8">
              <h2 className="type-h3 text-white">
                {tab === "upcoming" ? "No upcoming events scheduled" : "No past events listed"}
              </h2>
              <p className="mt-3 max-w-xl text-body text-white">
                We&apos;re currently planning our next round of events. Check back soon or join
                the newsletter to be notified.
              </p>
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
                  {new Date(e.startsAt).toLocaleString()}
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
                </div>
              </li>
            ))}
          </ul>
        </SectionContainer>

      </PageContainer>
    </ClubShell>
  );
}
