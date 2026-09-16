"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ClubShell, Section } from "@/components/club/ClubShell";
import { PinkLink } from "@/components/club/Typewriter";

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
      <div className="mb-20 pt-16 sm:pt-20 lg:pt-24">
        <Section>
          <h1 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">Events</h1>
          <p className="mt-4 max-w-3xl text-lg text-white/80">
            From workshops to socials, hack nights to tech talks — we host events each semester.
          </p>
        </Section>

        <Section>
          <div className="mb-8 flex flex-wrap items-center gap-4">
            {(["upcoming", "past"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`text-lg font-semibold capitalize ${
                  tab === t ? "text-signal underline" : "text-white/60 hover:text-white"
                }`}
              >
                {t === "upcoming" ? "Upcoming Events" : "Past Events"}
              </button>
            ))}
            <span className="text-white/40">·</span>
            <span className="text-white/50">Add to Calendar (soon)</span>
          </div>

          {error && <p className="mb-4 text-signal">{error}</p>}
          {events === null && <p className="text-white/60">Loading…</p>}

          {events && list.length === 0 && (
            <div className="border border-white/20 p-8">
              <h2 className="text-2xl font-bold text-white">
                {tab === "upcoming" ? "No upcoming events scheduled" : "No past events listed"}
              </h2>
              <p className="mt-3 max-w-xl text-white/70">
                We&apos;re currently planning our next round of events. Check back soon or join
                the newsletter to be notified.
              </p>
              <PinkLink href="/join" className="mt-6 text-xl">
                Stay Updated
              </PinkLink>
            </div>
          )}

          <ul className="space-y-4">
            {list.map((e) => (
              <li
                key={e.id}
                id={e.id}
                className="border border-white/20 p-6 transition-all hover:translate-y-[-4px] hover:border-signal"
              >
                <h2 className="text-2xl font-bold text-white">{e.title}</h2>
                <p className="mt-2 text-white/60">
                  {new Date(e.startsAt).toLocaleString()}
                  {e.location ? ` · ${e.location}` : ""}
                </p>
                {e.description && <p className="mt-3 text-white/75">{e.description}</p>}
                <Link href="/signin" className="mt-4 inline-block font-semibold text-signal hover:underline">
                  RSVP (members)
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        <Section>
          <div id="speakers" className="mb-12 border-b border-zinc-800 pb-4">
            <h2 className="text-3xl font-bold text-white md:text-4xl">Upcoming Speakers</h2>
            <p className="mt-2 text-lg text-zinc-400">
              People presenting at upcoming LOGICA talks and workshops
            </p>
          </div>
          <div className="border border-white/20 p-8">
            <h3 className="text-xl font-bold text-white">To be announced</h3>
            <p className="mt-3 text-white/70">Check back soon for our speaker lineup this semester.</p>
          </div>
        </Section>

        <Section>
          <div className="border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-white">Stay Updated</h2>
            <p className="mt-3 text-white/70">
              Sign up interest via Join to receive updates about upcoming events and opportunities.
            </p>
            <Link
              href="/join"
              className="mt-6 inline-flex min-h-12 items-center bg-signal px-6 font-bold text-white shadow-block"
            >
              Subscribe
            </Link>
          </div>
        </Section>
      </div>
    </ClubShell>
  );
}
