"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Heading, Empty } from "./Overview";
import { Icon } from "./Icon";
import {
  type Event,
  type Engagement,
  type SessionUser,
  type Post,
  date,
  runsWorkspace,
  initials,
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
  const [filter, setFilter] = useState("upcoming");
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const visible = events?.filter((e) =>
    filter === "mine"
      ? engagement?.rsvps.some(
          (r) => r.eventId === e.id && r.status === "GOING",
        )
      : new Date(e.startsAt) >= new Date() === (filter === "upcoming"),
  );
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
  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy("create");
    setError("");
    try {
      await api("/api/events", {
        method: "POST",
        body: JSON.stringify({
          title: data.get("title"),
          description: data.get("description"),
          location: data.get("location"),
          startsAt: new Date(String(data.get("startsAt"))).toISOString(),
        }),
      });
      onEvents(await api<Event[]>("/api/events"));
      setCreating(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }
  return (
    <>
      <Heading
        title="See you at the next one."
        description="Gatherings, conversations, and opportunities to get involved."
        action={
          runsWorkspace(user) && (
            <button className="d-button" onClick={() => setCreating(!creating)}>
              {creating ? "Close event form" : "+ Create event"}
            </button>
          )
        }
      />
      {error && (
        <p className="d-error" role="alert">
          {error}
        </p>
      )}
      {creating && (
        <form onSubmit={create} className="d-panel d-form">
          <h2>Create a club event</h2>
          <div className="d-form-grid">
            <label>
              Event title
              <input name="title" required />
            </label>
            <label>
              Date and time (your local time)
              <input name="startsAt" type="datetime-local" required />
            </label>
          </div>
          <label>
            Location
            <input name="location" />
          </label>
          <label>
            Description
            <textarea name="description" rows={3} />
          </label>
          <button disabled={!!busy} className="d-button">
            {busy === "create" ? "Creating…" : "Create event"}
          </button>
        </form>
      )}
      <div className="d-tabs" aria-label="Filter events">
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
          const past = new Date(e.startsAt) < new Date();
          return (
            <article key={e.id} className="d-event-item">
              <div className="d-event-summary">
                <span className="d-date-tile">
                  <small>{date(e.startsAt, { month: "short" })}</small>
                  <strong>{date(e.startsAt, { day: "2-digit" })}</strong>
                </span>
                <div className="d-event-text">
                  <h2>{e.title}</h2>
                  <p>
                    {date(e.startsAt, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    ·{" "}
                    {new Date(e.startsAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                  <small>{e.location || "Location to be announced"}</small>
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
              <p>
                {e.description ||
                  "More details will be shared by the organizers."}
              </p>
              <button
                className="d-text-button"
                aria-expanded={selected === e.id}
                onClick={() => setSelected(selected === e.id ? null : e.id)}
              >
                {selected === e.id
                  ? "Hide details"
                  : "Details, materials & check-in"}{" "}
                <span aria-hidden="true">↗</span>
              </button>
              {selected === e.id && (
                <EventDetails event={e} onCheckedIn={onEngagement} />
              )}
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
function EventDetails({
  event,
  onCheckedIn,
}: {
  event: Event;
  onCheckedIn: (e: Engagement) => void;
}) {
  const [materials, setMaterials] = useState<
    { id: string; filename: string; visibility: string }[] | null
  >(null);
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
              {m.visibility === "INTERNAL" ? "Board only" : "Download"} ↗
            </span>
          </a>
        ))}
        {materials?.length === 0 && (
          <p className="d-muted">No materials have been shared yet.</p>
        )}
        {!materials && !error && <p>Loading materials…</p>}
      </div>
      <form onSubmit={checkin} className="d-form">
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
      </form>
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
  const [posts, setPosts] = useState<Post[] | null>(null);
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
        title="A good place to say hello."
        description="Questions, ideas, and updates from the people of LOGICA."
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
