"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteIcon } from "@/components/site/icons";
import { ApiError, api } from "@/lib/api";
import type { ClubEvent } from "@/lib/events";
import { downloadIcs } from "@/lib/ics";

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

/** The buttons under an event: the only part of its page that needs the browser. */
export function EventActions({ event, rsvpOpen }: { event: ClubEvent; rsvpOpen: boolean }) {
  return (
    <div className="event-actions">
      {rsvpOpen && <Rsvp id={event.id} />}
      {event.link && (
        <a href={event.link} target="_blank" rel="noopener noreferrer" className="site-btn secondary">More info <SiteIcon name="external" /></a>
      )}
      {event.startsAt && <button type="button" className="site-btn secondary" onClick={() => event.startsAt && downloadIcs({ ...event, startsAt: event.startsAt })}>Add to calendar</button>}
    </div>
  );
}
