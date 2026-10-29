"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { ClubShell } from "@/components/club/ClubShell";
import { SiteIcon } from "@/components/site/icons";
import { ApiError, api } from "@/lib/api";
import { eventDate, type ClubEvent } from "@/lib/events";
import { downloadIcs } from "@/lib/ics";
import { Description } from "../EventsList";

type Answer = "GOING" | "NOT_GOING" | null;

/**
 * RSVP on our own site. Signed in: one tap, a confirmation email and a
 * reminder the day before. Signed out: sign in (or create an account) and
 * come straight back here.
 */
function Rsvp({ id }: { id: string }) {
  const [status, setStatus] = useState<Answer | "signed-out" | "loading">("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    api<{ status: Answer }>(`/api/events/${id}/rsvp`)
      .then((r) => setStatus(r.status))
      .catch((e: unknown) => setStatus(e instanceof ApiError && e.status === 401 ? "signed-out" : null));
  }, [id]);

  async function answer(next: "GOING" | "NOT_GOING") {
    setBusy(true);
    setError("");
    try {
      await api(`/api/events/${id}/rsvp`, { method: "POST", body: JSON.stringify({ status: next }) });
      setStatus(next);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (status === "signed-out")
    return (
      <>
        <Link className="site-btn" href={`/signin?next=${encodeURIComponent(`/events/${id}`)}`}>RSVP</Link>
        <p className="event-rsvp-note">Sign in or create an account to RSVP.</p>
      </>
    );
  return (
    <>
      {status === "GOING" ? (
        <>
          <span className="site-badge event-going" role="status"><SiteIcon name="check" /> You&apos;re going</span>
          <button type="button" className="site-btn secondary" disabled={busy} onClick={() => answer("NOT_GOING")}>Can&apos;t make it</button>
        </>
      ) : (
        <button type="button" className="site-btn" disabled={busy || status === "loading"} onClick={() => answer("GOING")}>
          {busy ? "Saving…" : "RSVP"}
        </button>
      )}
      {status === "GOING" && <p className="event-rsvp-note">You&apos;ll get a reminder the day before.</p>}
      {error && <p className="event-rsvp-note site-error" role="alert">{error}</p>}
    </>
  );
}

/** Public event details (logica.pen V4 "04 Event detail"). Board tools (materials, check-in) live in the dashboard's Events section. */
export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [event, setEvent] = useState<ClubEvent | null>(null);
  const [eventError, setEventError] = useState<"missing" | "failed" | null>(null);
  // RSVPs stay open until two hours after the start (or always, with no date yet).
  const [rsvpOpen, setRsvpOpen] = useState(false);

  useEffect(() => {
    api<ClubEvent>(`/api/events/${id}`)
      .then((e) => {
        setEvent(e);
        setRsvpOpen(!e.startsAt || new Date(e.startsAt).getTime() > Date.now() - 2 * 3600_000);
      })
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
              {rsvpOpen && <Rsvp id={event.id} />}
              {event.link && (
                <a href={event.link} target="_blank" rel="noopener noreferrer" className="site-btn secondary">More info <SiteIcon name="external" /></a>
              )}
              {event.startsAt && <button type="button" className="site-btn secondary" onClick={() => event.startsAt && downloadIcs({ ...event, startsAt: event.startsAt })}>Add to calendar</button>}
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
