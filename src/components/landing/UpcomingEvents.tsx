"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { EmptyState } from "@/components/shell/AppShell";
import { FourDots } from "@/components/brand/LogicaMark";

type Event = {
  id: string;
  title: string;
  location: string | null;
  startsAt: string;
  description?: string | null;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return {
    month: d.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    day: d.toLocaleString("en-US", { day: "2-digit" }),
    time: d.toLocaleString("en-US", { hour: "numeric", minute: "2-digit" }),
  };
}

export function UpcomingEvents() {
  const [events, setEvents] = useState<Event[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api<Event[]>("/api/events")
      .then((data) => {
        if (!cancelled) setEvents(Array.isArray(data) ? data.slice(0, 3) : []);
      })
      .catch((e: Error) => {
        if (!cancelled) {
          setError(e.message);
          setEvents([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loading = events === null;

  return (
    <section className="border-t border-ink bg-paper-dim" aria-labelledby="events-heading">
      <div className="mx-auto grid max-w-shell gap-10 px-4 py-14 md:grid-cols-[1.2fr_0.8fr] md:gap-12 md:px-6 md:py-24">
        <div>
          <FourDots />
          <p className="type-label mt-4 text-ink-muted">Upcoming events</p>
          <h2 id="events-heading" className="type-display-2 mt-3">
            On the calendar
          </h2>
          <p className="mt-3 max-w-measure text-body text-ink-muted">
            Live from the backend when it&apos;s up. Empty state keeps mission and nav intact.
          </p>

          <div className="mt-8 space-y-4" aria-live="polite">
            {loading && <p className="text-body-sm text-ink-muted">Loading upcoming events…</p>}
            {!loading && error && (
              <p className="text-body-sm text-signal" role="status">
                Couldn&apos;t reach the events API ({error}). Showing empty state.
              </p>
            )}
            {!loading && events.length === 0 && (
              <EmptyState
                title="No events posted yet"
                body="Check back soon, or open the full calendar once events are published."
                action={
                  <Link href="/events" className="type-label text-signal underline-offset-4 hover:underline">
                    Open events →
                  </Link>
                }
              />
            )}
            {!loading &&
              events.map((event) => {
                const { month, day, time } = formatDate(event.startsAt);
                return (
                  <article key={event.id} className="print-frame p-5 md:p-6">
                    <div className="relative z-[1] flex gap-5">
                      <div className="flex min-w-[4.5rem] flex-col items-start leading-none">
                        <span className="type-label text-signal">{month}</span>
                        <span className="type-h1">{day}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="type-h3 uppercase tracking-wide">{event.title}</h3>
                        <p className="mt-1 text-body-sm text-ink-muted">
                          {time}
                          {event.location ? ` · ${event.location}` : ""}
                        </p>
                        <Link
                          href={`/events#${event.id}`}
                          className="type-label mt-3 inline-block text-signal underline-offset-4 hover:underline"
                        >
                          View details →
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
          </div>
        </div>

        <aside
          id="featured"
          className="flex flex-col justify-between border border-ink bg-ink p-6 text-paper md:p-8"
          aria-labelledby="featured-heading"
        >
          <div>
            <FourDots />
            <p className="type-label mt-4 text-signal">Featured</p>
            <h2 id="featured-heading" className="type-h2 mt-3 text-balance">
              Build with us — board, mentors, and members.
            </h2>
            <p className="mt-4 text-body text-paper/80">
              Meet the people shaping LOGICA. Culture and technology in the same room.
            </p>
          </div>
          <Link
            href="/team"
            className="type-label mt-10 inline-flex min-h-12 items-center text-signal underline-offset-4 hover:underline"
          >
            Meet the team →
          </Link>
        </aside>
      </div>
    </section>
  );
}
