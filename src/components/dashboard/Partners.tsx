"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Heading, Empty } from "./Overview";
import { EventForm, eventBody } from "./Participation";
import { type Event, date } from "./types";

type Partner = { id: string; name: string | null; email: string; events: { id: string }[] };
type PartnerEvent = Event & { going: number; checkedIn: number };

/**
 * Exec only, inside an event's details: which partner clubs can see and
 * edit this event. A partner account sees nothing it isn't granted here.
 */
export function PartnerAccess({ event }: { event: Event }) {
  const [partners, setPartners] = useState<Partner[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fresh, setFresh] = useState<{ email: string; tempPassword: string } | null>(null);

  useEffect(() => {
    api<Partner[]>("/api/partners").then(setPartners, (e: Error) => setError(e.message));
  }, []);

  async function run(work: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await work();
      setPartners(await api<Partner[]>("/api/partners"));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const grant = (p: Partner, access: boolean) =>
    run(() => api(`/api/partners/${p.id}`, { method: "PATCH", body: JSON.stringify({ eventId: event.id, access }) }));

  function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    run(async () => {
      const made = await api<{ id: string; email: string; tempPassword: string }>("/api/partners", {
        method: "POST",
        body: JSON.stringify({ name: data.get("name"), email: data.get("email") }),
      });
      await api(`/api/partners/${made.id}`, { method: "PATCH", body: JSON.stringify({ eventId: event.id, access: true }) });
      setFresh(made);
      form.reset();
    });
  }

  return (
    <section className="d-settings" aria-label={`Partner clubs for ${event.title}`}>
      <h3>Partner clubs</h3>
      <p className="d-footnote">A partner club can see and edit only the events checked here. It can&apos;t create events or see who RSVPed.</p>
      {error && <p className="d-error" role="alert">{error}</p>}
      {fresh && (
        <div className="d-agent-secret" role="status">
          <p>
            Send these to the partner privately. The password is shown once; they replace it when they first sign in at speaker sign-in.
          </p>
          <div>
            <code>{fresh.email}</code>
            <code>{fresh.tempPassword}</code>
          </div>
          <button className="d-text-button" onClick={() => setFresh(null)}>Done</button>
        </div>
      )}
      {partners?.map((p) => (
        <label className="d-setting-row" key={p.id}>
          <span>
            <strong>{p.name || p.email}</strong>
            <small>{p.email}</small>
          </span>
          <input
            type="checkbox"
            checked={p.events.some((e) => e.id === event.id)}
            disabled={busy}
            onChange={(e) => grant(p, e.target.checked)}
          />
        </label>
      ))}
      {partners === null && !error && <p role="status">Loading partner clubs…</p>}
      <form className="d-agent-new" onSubmit={add}>
        <label className="sr-only" htmlFor={`partner-name-${event.id}`}>Club name</label>
        <input id={`partner-name-${event.id}`} name="name" required maxLength={80} placeholder="Club name" />
        <label className="sr-only" htmlFor={`partner-email-${event.id}`}>Board email</label>
        <input id={`partner-email-${event.id}`} name="email" type="email" required placeholder="Their board email" />
        <button className="d-button secondary" disabled={busy}>
          {busy ? "Working…" : "Add club"}
        </button>
      </form>
    </section>
  );
}

/** A partner club's whole dashboard: the events it was granted, counts, and edit. */
export function PartnerHome() {
  const [events, setEvents] = useState<PartnerEvent[] | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api<PartnerEvent[]>("/api/partner-events").then(setEvents, (e: Error) => setError(e.message));
  }, []);

  async function save(e: React.FormEvent<HTMLFormElement>, event: PartnerEvent) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      await api(`/api/events/${event.id}`, { method: "PATCH", body: JSON.stringify(eventBody(data)) });
      setEvents(await api<PartnerEvent[]>("/api/partner-events"));
      setEditing(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Heading title="Our events" description="The LOGICA events you're collaborating on." />
      {error && <p className="d-error" role="alert">{error}</p>}
      {events === null && !error && <p role="status">Loading…</p>}
      {events?.length === 0 && <Empty title="No shared events yet">LOGICA&apos;s exec board adds the events you collaborate on.</Empty>}
      {events?.map((e) =>
        editing === e.id ? (
          <EventForm
            key={e.id}
            event={e}
            heading={`Edit ${e.title}`}
            busy={busy}
            submitLabel="Save changes"
            onSubmit={(form) => save(form, e)}
            onCancel={() => setEditing(null)}
          />
        ) : (
          <article className="d-panel" key={e.id}>
            <h2>{e.title}</h2>
            <p>
              {date(e.startsAt, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              {" · "}
              {e.location || "Location to be announced"}
            </p>
            <p>
              <strong>{e.going}</strong> going · <strong>{e.checkedIn}</strong> checked in
            </p>
            {e.description && <p className="d-event-description">{e.description}</p>}
            <button className="d-text-button" onClick={() => setEditing(e.id)}>
              Edit event<span className="sr-only"> {e.title}</span>
            </button>
          </article>
        ),
      )}
    </>
  );
}
