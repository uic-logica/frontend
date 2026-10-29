"use client";
import { useEffect, useRef, useState } from "react";
import { linkParts } from "@/lib/linkify";
import { api, peek } from "@/lib/api";
import { Heading, Empty } from "./Overview";
import { Arrow, Icon } from "./Icon";
import { useUrlState } from "./useUrlState";
import { PartnerAccess } from "./Partners";
import {
  type Event,
  type Engagement,
  type SessionUser,
  type Post,
  date,
  runsWorkspace,
  initials,
  isUpcoming,
  when,
} from "./types";

export function Events({
  user,
  events,
  engagement,
  onEngagement,
  onEvents,
}: {
  user: SessionUser;
  events: Event[] | null;
  engagement: Engagement | null;
  onEngagement: (e: Engagement) => void;
  onEvents: (e: Event[]) => void;
}) {
  // In the URL: a link can open one event (?id=), the create form (?new=1)
  // or check-in (?checkin=1, where /attendance sends people at the door).
  const [filter, setFilter] = useUrlState("filter", "upcoming");
  const [selectedId, setSelectedId] = useUrlState("id");
  const selected = selectedId || null;
  const setSelected = (id: string | null) => setSelectedId(id ?? "", { push: !!id });
  const [newParam, setNewParam] = useUrlState("new");
  const [checkinParam, setCheckinParam] = useUrlState("checkin");
  const checkinDialog = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const creating = newParam === "1";
  const setCreating = (on: boolean) => setNewParam(on ? "1" : "");
  const [editing, setEditing] = useState<string | null>(null);
  // The backend lets the whole board (not only exec) create and edit events.
  const board = user.accountKind === "MEMBER" && (user.role === "BOARD" || user.role === "EXEC_BOARD");
  const visible = events?.filter((e) =>
    e.id === selected ||
    (filter === "mine"
      ? engagement?.rsvps.some(
          (r) => r.eventId === e.id && r.status === "GOING",
        )
      : isUpcoming(e.startsAt) === (filter === "upcoming")),
  );
  // A linked event scrolls into view once the list is there.
  useEffect(() => {
    if (selected && events) requestAnimationFrame(() => document.getElementById(`event-${selected}`)?.scrollIntoView({ block: "start" }));
  }, [selected, events]);
  useEffect(() => {
    if (checkinParam === "1" && !checkinDialog.current?.open) checkinDialog.current?.showModal();
  }, [checkinParam]);
  async function rsvp(eventId: string, going: boolean) {
    setBusy(eventId);
    setError("");
    try {
      await api(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        body: JSON.stringify({ status: going ? "NOT_GOING" : "GOING" }),
      });
      onEngagement(await api<Engagement>("/api/dashboard"));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }
  /** Create (no `event`) or edit an event from the form's fields. */
  async function save(e: React.FormEvent<HTMLFormElement>, event?: Event) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const key = event ? event.id : "create";
    setBusy(key);
    setError("");
    try {
      await api(event ? `/api/events/${event.id}` : "/api/events", {
        method: event ? "PATCH" : "POST",
        body: JSON.stringify(eventBody(data)),
      });
      onEvents(await api<Event[]>("/api/events"));
      if (event) setEditing(null);
      else setCreating(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }
  return (
    <>
      <Heading
        title="Events"
        description={board ? "Plan, publish, and run each event from one timeline." : "Discover what’s next, understand the commitment, and RSVP with confidence."}
        action={
          <div className="d-actions">
            <button className="d-button secondary" onClick={() => setCheckinParam("1")}>
              <Icon name="check" /> Check in
            </button>
            {board && (
              <button className="d-button" onClick={() => setCreating(!creating)}>
                {creating ? "Close event form" : "+ Create event"}
              </button>
            )}
          </div>
        }
      />
      {error && (
        <p className="d-error" role="alert">
          {error}
        </p>
      )}
      <CheckInDialog
        dialog={checkinDialog}
        events={events}
        onClose={() => setCheckinParam("")}
        onCheckedIn={onEngagement}
      />
      {creating && (
        <EventForm
          heading="Create a club event"
          busy={busy === "create"}
          submitLabel="Create event"
          onSubmit={(e) => save(e)}
          onCancel={() => setCreating(false)}
        />
      )}
      <div className="d-tabs" role="group" aria-label="Filter events">
        {[
          ["upcoming", "Upcoming"],
          ["mine", "My RSVPs"],
          ["past", "Past events"],
        ].map(([value, label]) => (
          <button
            key={value}
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <section className="d-panel d-events-list">
        {visible?.map((e) => {
          const going =
            engagement?.rsvps.some(
              (r) => r.eventId === e.id && r.status === "GOING",
            ) ?? false;
          const past = !isUpcoming(e.startsAt);
          return (
            <article key={e.id} id={`event-${e.id}`} className="d-event-item" aria-current={selected === e.id ? "true" : undefined}>
              <div className="d-event-summary">
                <span className="d-date-tile">
                  <small>{date(e.startsAt, { month: "short" })}</small>
                  <strong>{date(e.startsAt, { day: "2-digit" })}</strong>
                </span>
                <div className="d-event-text">
                  <h2>{e.title}</h2>
                  <p>
                    {when(e.startsAt, { weekday: "long", month: "long", day: "numeric" })}
                  </p>
                  <small>
                    {e.location || "Location to be announced"}
                    {e.link && (
                      <>
                        {" · "}
                        <a href={e.link} target="_blank" rel="noopener noreferrer">
                          Event page <Arrow />
                        </a>
                      </>
                    )}
                    {" · "}
                    <a href={`/events/${e.id}`} target="_blank" rel="noopener noreferrer">
                      Public page <Arrow />
                    </a>
                  </small>
                </div>
                {!past && (
                  <button
                    disabled={!!busy || !engagement}
                    className={`d-button ${going ? "secondary" : ""}`}
                    onClick={() => rsvp(e.id, going)}
                  >
                    {busy === e.id
                      ? "Saving…"
                      : going
                        ? "Cancel RSVP"
                        : "RSVP to event"}
                  </button>
                )}
              </div>
              {editing === e.id ? (
                <EventForm
                  event={e}
                  heading={`Edit ${e.title}`}
                  busy={busy === e.id}
                  submitLabel="Save changes"
                  onSubmit={(form) => save(form, e)}
                  onCancel={() => setEditing(null)}
                />
              ) : (
              <p className="d-event-description">
                {e.description
                  ? linkParts(e.description).map((part, i) =>
                      part.href ? <a key={i} href={part.href} target="_blank" rel="noopener noreferrer">{part.text}</a> : part.text,
                    )
                  : "More details will be shared by the organizers."}
              </p>
              )}
              <div className="d-event-links">
              {board && editing !== e.id && (
                <button className="d-text-button" onClick={() => setEditing(e.id)}>
                  Edit event<span className="sr-only"> {e.title}</span>
                </button>
              )}
              <button
                className="d-text-button"
                aria-expanded={selected === e.id}
                onClick={() => setSelected(selected === e.id ? null : e.id)}
              >
                {selected === e.id ? "Hide details" : "Details & materials"}
                <span aria-hidden="true">{selected === e.id ? " ▴" : " ▾"}</span>
              </button>
              </div>
              {selected === e.id && (
                <EventDetails event={e} onCheckedIn={onEngagement} />
              )}
              {selected === e.id && board && <Going event={e} />}
              {selected === e.id && runsWorkspace(user) && <PartnerAccess event={e} />}
            </article>
          );
        })}
        {visible?.length === 0 && (
          <Empty
            title={
              filter === "mine"
                ? "Make room for your next event"
                : "No events here yet"
            }
          >
            {filter === "mine"
              ? "Switch to Upcoming and RSVP to an event you’d like to attend."
              : "Events will appear here when the board adds them."}
          </Empty>
        )}
        {!events && <p className="d-muted">Events are not available yet.</p>}
        {filter === "mine" && !engagement && (
          <p role="status">Your RSVP history is not available yet.</p>
        )}
      </section>
    </>
  );
}
/** `datetime-local` wants local "YYYY-MM-DDTHH:mm", not an ISO string. */
function localInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** What the backend takes from an EventForm: `startsAt` as ISO, the rest as typed. */
export function eventBody(data: FormData) {
  return {
    title: data.get("title"),
    description: data.get("description"),
    location: data.get("location"),
    link: data.get("link"),
    // "Date TBD" ticked, or left empty: the backend stores no date yet.
    startsAt: data.get("dateTbd") || !data.get("startsAt") ? null : new Date(String(data.get("startsAt"))).toISOString(),
  };
}

/** The one form for creating and editing an event. Empty fields clear on save. */
export function EventForm({
  event,
  heading,
  busy,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  /** Partial when prefilling a new event, e.g. from a speaker's talk. */
  event?: Partial<Event>;
  heading: string;
  busy: boolean;
  submitLabel: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  const [tbd, setTbd] = useState(event?.startsAt === null);
  return (
    <form onSubmit={onSubmit} className="d-panel d-form d-event-form">
      <h2>{heading}</h2>
      <div className="d-form-grid">
        <label>
          Event title
          <input name="title" required defaultValue={event?.title} />
        </label>
        <div className="d-event-when">
          <label>
            Date and time (your local time)
            <input name="startsAt" type="datetime-local" required={!tbd} disabled={tbd} defaultValue={event?.startsAt ? localInput(event.startsAt) : undefined} />
          </label>
          <label className="d-event-tbd">
            <input type="checkbox" name="dateTbd" checked={tbd} onChange={(e) => setTbd(e.target.checked)} />
            Date TBD
          </label>
        </div>
      </div>
      <label>
        Location
        <input name="location" defaultValue={event?.location ?? ""} />
      </label>
      <label>
        Description
        <textarea name="description" rows={event ? 6 : 3} defaultValue={event?.description ?? ""} />
      </label>
      <label>
        Event page URL (Luma, Discord, or flyer)
        <input name="link" type="url" defaultValue={event?.link ?? ""} />
      </label>
      <div className="d-actions">
        <button disabled={busy} className="d-button">
          {busy ? "Saving…" : submitLabel}
        </button>
        <button type="button" className="d-button secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

/** Within 12 hours either side of the start: the day check-in makes sense. */
function isToday(iso: string | null) {
  if (!iso) return false;
  return Math.abs(new Date(iso).getTime() - new Date().getTime()) < 12 * 3_600_000;
}

/**
 * One place to check in at the door: the header button and /attendance both
 * open it. Today's event is picked for you; the code comes from the organizer.
 */
function CheckInDialog({
  dialog,
  events,
  onClose,
  onCheckedIn,
}: {
  dialog: React.RefObject<HTMLDialogElement | null>;
  events: Event[] | null;
  onClose: () => void;
  onCheckedIn: (e: Engagement) => void;
}) {
  const near = [...(events ?? [])]
    .filter((e) => e.startsAt && Math.abs(new Date(e.startsAt).getTime() - new Date().getTime()) < 3 * 86_400_000)
    .sort((a, b) => Math.abs(new Date(a.startsAt!).getTime() - new Date().getTime()) - Math.abs(new Date(b.startsAt!).getTime() - new Date().getTime()));
  const [eventId, setEventId] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const chosen = eventId || near[0]?.id || "";
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/attendance/checkin", { method: "POST", body: JSON.stringify({ eventId: chosen, code: code.trim() }) });
      onCheckedIn(await api<Engagement>("/api/dashboard"));
      setDone(`You're checked in to ${near.find((n) => n.id === chosen)?.title ?? "the event"}.`);
      setCode("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      className="d-confirm d-checkin"
      aria-labelledby="d-checkin-title"
      onClose={() => {
        setDone("");
        setError("");
        onClose();
      }}
    >
      <h2 id="d-checkin-title">Check in</h2>
      {done ? (
        <>
          <p className="d-success" role="status">{done}</p>
          <form method="dialog" className="d-actions">
            <button className="d-button">Done</button>
          </form>
        </>
      ) : near.length === 0 ? (
        <>
          <p>There&apos;s no event today or in the next few days to check in to.</p>
          <form method="dialog" className="d-actions">
            <button className="d-button secondary">Close</button>
          </form>
        </>
      ) : (
        <form className="d-form" onSubmit={submit}>
          <label>
            Event
            <select value={chosen} onChange={(e) => setEventId(e.target.value)}>
              {near.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} · {date(e.startsAt)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Check-in code
            <input required autoFocus autoComplete="off" value={code} onChange={(e) => setCode(e.target.value)} placeholder="From the organizer" />
          </label>
          {error && <p className="d-error" role="alert">{error}</p>}
          <div className="d-actions">
            <button type="button" className="d-button secondary" onClick={() => dialog.current?.close()}>
              Cancel
            </button>
            <button className="d-button" disabled={busy}>{busy ? "Checking in…" : "Check in"}</button>
          </div>
        </form>
      )}
    </dialog>
  );
}

type Person = { id: string; name: string | null; email: string };

/** Board: who RSVP'd going on the site, for the headcount. */
function Going({ event }: { event: Event }) {
  const [people, setPeople] = useState<Person[] | null>(() => peek<Person[]>(`/api/events/${event.id}/going`) ?? null);
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    api<Person[]>(`/api/events/${event.id}/going`)
      .then((p) => alive && setPeople(p))
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [event.id]);
  return (
    <div className="d-event-going">
      <h3>Going{people ? ` · ${people.length}` : ""}</h3>
      {error && <p className="d-error" role="alert">{error}</p>}
      {!people && !error && <p className="d-muted">Loading RSVPs…</p>}
      {people?.length === 0 && <p className="d-muted">No RSVPs yet. They come from the RSVP button on the event&apos;s public page.</p>}
      {!!people?.length && (
        <ul className="d-going-list">
          {people.map((p) => <li key={p.id}>{p.name ?? p.email} <span className="d-muted">{p.email}</span></li>)}
        </ul>
      )}
    </div>
  );
}

function EventDetails({
  event,
  onCheckedIn,
}: {
  event: Event;
  onCheckedIn: (e: Engagement) => void;
}) {
  const [materials, setMaterials] = useState<
    { id: string; filename: string; visibility: string }[] | null
  >(() => peek(`/api/events/${event.id}/materials`) ?? null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let alive = true;
    api<{ id: string; filename: string; visibility: string }[]>(
      `/api/events/${event.id}/materials`,
    )
      .then((v) => {
        if (alive) {
          setMaterials(v);
          setError("");
        }
      })
      .catch((e) => {
        if (alive) setError(e.message);
      });
    return () => {
      alive = false;
    };
  }, [event.id, retry]);
  async function checkin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api("/api/attendance/checkin", {
        method: "POST",
        body: JSON.stringify({ eventId: event.id, code: code.trim() }),
      });
      onCheckedIn(await api<Engagement>("/api/dashboard"));
      setMessage("You’re checked in. Your engagement has been updated.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="d-event-details">
      <div>
        <h3>Event materials</h3>
        {materials?.map((m) => (
          <a
            className="d-file"
            key={m.id}
            href={`/api/materials/${m.id}/download`}
            target="_blank"
            rel="noreferrer"
          >
            {m.filename}
            <span>
              {m.visibility === "INTERNAL" ? "Board only" : "Download"} <Arrow />
            </span>
          </a>
        ))}
        {materials?.length === 0 && (
          <p className="d-muted">No materials have been shared yet.</p>
        )}
        {!materials && !error && <p>Loading materials…</p>}
      </div>
      {isToday(event.startsAt) && <form onSubmit={checkin} className="d-form">
        <h3>At the event?</h3>
        <label>
          Check-in code
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter the organizer’s code"
          />
        </label>
        <button className="d-button secondary" disabled={busy}>
          {busy ? "Checking in…" : "Check in to event"}
        </button>
      </form>}
      {error && (
        <p className="d-error" role="alert">
          {error}
          {materials === null && (
            <button onClick={() => setRetry((v) => v + 1)}>
              Retry materials
            </button>
          )}
        </p>
      )}
      {message && (
        <p className="d-success" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
export function Community({ user }: { user: SessionUser }) {
  const [posts, setPosts] = useState<Post[] | null>(() => peek<Post[]>("/api/posts") ?? null);
  const [error, setError] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let alive = true;
    api<Post[]>("/api/posts")
      .then((p) => {
        if (alive) {
          setPosts(p);
          setError("");
        }
      })
      .catch((e) => {
        if (alive) setError(e.message);
      });
    return () => {
      alive = false;
    };
  }, [retry]);
  async function post(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const p = await api<Post>("/api/posts", {
        method: "POST",
        body: JSON.stringify({ body }),
      });
      setPosts((prev) => [p, ...(prev || [])]);
      setBody("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Heading
        title="Community"
        description={runsWorkspace(user) ? "Keep conversation useful, current, and connected to the work." : "Ask, share, and find the threads that help members move forward."}
      />
      <div className="d-community-layout">
        <div>
          <form className="d-panel d-composer" onSubmit={post}>
            <span className="d-avatar">{initials(user.name)}</span>
            <div>
              <label htmlFor="new-post">What’s on your mind?</label>
              <textarea
                id="new-post"
                required
                maxLength={5000}
                rows={3}
                placeholder="Share a project, ask a question, start a conversation…"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
              <div className="d-form-footer">
                <small>Visible to signed-in members and speakers.</small>
                <button className="d-button" disabled={busy || !body.trim()}>
                  {busy ? "Posting…" : "Publish post"}
                </button>
              </div>
            </div>
          </form>
          {error && (
            <p className="d-error" role="alert">
              {error}
              <button onClick={() => setRetry((v) => v + 1)}>
                Reload feed
              </button>
            </p>
          )}
          {posts?.map((p) => (
            <article className="d-panel d-post" key={p.id}>
              <header>
                <span className="d-avatar">{initials(p.author.name)}</span>
                <div>
                  <strong>{p.author.name || "LOGICA member"}</strong>
                  <small>
                    {date(p.createdAt, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </small>
                </div>
              </header>
              <p>{p.body}</p>
            </article>
          ))}
          {posts?.length === 0 && (
            <section className="d-panel">
              <Empty title="Start the conversation">
                Introduce yourself or share something you’re working on.
              </Empty>
            </section>
          )}
          {!posts && !error && <p role="status">Loading the community feed…</p>}
        </div>
        <aside className="d-panel d-note-panel">
          <span className="d-note-icon">
            <Icon name="community" />
          </span>
          <h2>Built together.</h2>
          <p>
            Be curious. Share what you know. Make room for someone else’s
            perspective.
          </p>
          <p>
            A small introduction can be the start of your next collaboration.
          </p>
        </aside>
      </div>
    </>
  );
}
