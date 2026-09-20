"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ClubShell, PageContainer, SectionContainer } from "@/components/club/ClubShell";
import { PinkLink } from "@/components/club/Typewriter";
import { ButtonLink } from "@/components/ui/ButtonLink";

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
          <h1 className="text-3xl font-bold md:text-4xl text-white">Events</h1>
          <p className="mt-4 max-w-3xl text-body-lg text-white">
            From workshops to socials, hack nights to tech talks — we host events each semester.
          </p>
        </SectionContainer>

        <SectionContainer>
          <div className="mb-8 flex flex-wrap items-center gap-4">
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
            <span className="text-white">·</span>
            <span className="text-white">Add to Calendar (soon)</span>
          </div>

          {error && <p className="mb-4 text-body text-signal">{error}</p>}
          {events === null && <p className="text-body text-white">Loading…</p>}

          {events && list.length === 0 && (
            <div className="rounded-2xl border border-white/20 p-8">
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

          <ul className="space-y-4">
            {list.map((e) => (
              <li
                key={e.id}
                id={e.id}
                className="rounded-2xl border border-white/20 p-6 transition-all hover:translate-y-[-4px] hover:border-signal"
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

        <SectionContainer>
          <div id="speakers" className="mb-12 border-b border-white/20 pb-4">
            <h2 className="type-h2 text-white">Upcoming Speakers</h2>
            <p className="mt-2 text-body-lg text-white">
              People presenting at upcoming LOGICA talks and workshops
            </p>
          </div>
          <div className="rounded-2xl border border-white/20 p-8">
            <h3 className="type-h4 text-white">To be announced</h3>
            <p className="mt-3 text-body text-white">Check back soon for our speaker lineup this semester.</p>
            <PinkLink href="/speak" className="mt-6 text-xl">
              Want to speak at LOGICA? Join the speaker lineup
            </PinkLink>
          </div>
        </SectionContainer>

        <SectionContainer>
          <div className="rounded-2xl border border-white/20 p-8">
            <h2 className="type-h3 text-white">Stay Updated</h2>
            <p className="mt-3 text-body text-white">
              Sign up interest via Join to receive updates about upcoming events and opportunities.
            </p>
            <ButtonLink href="/join" className="mt-6">
              Subscribe
            </ButtonLink>
          </div>
        </SectionContainer>
      </PageContainer>
    </ClubShell>
  );
}
