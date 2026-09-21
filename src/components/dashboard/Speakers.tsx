"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { Heading, Empty } from "./Overview";
import { Thread } from "./Thread";
import { type Event, type Speaker, type SessionUser, date, initials } from "./types";

export function Speakers({
  user,
  speakers,
  events,
  onChange,
}: {
  user: SessionUser;
  speakers: Speaker[] | null;
  events: Event[] | null;
  onChange: (s: Speaker[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [credentials, setCredentials] = useState<{
    username: string;
    tempPassword: string;
  } | null>(null);
  const [draftLink, setDraftLink] = useState("");
  const filtered = speakers?.filter(
    (s) =>
      (filter === "ALL" ||
        (filter === "DRAFT"
          ? !s.submittedAt
          : s.status === filter && s.submittedAt)) &&
      `${s.name} ${s.email} ${s.organization}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  async function status(s: Speaker, value: string) {
    setBusy(s.id);
    setError("");
    setMessage("");
    try {
      await api(`/api/speakers/${s.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: value }),
      });
      onChange(await api<Speaker[]>("/api/speakers"));
      setMessage(`${s.name || "Speaker"} ${value.toLowerCase()}.`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }
  /**
   * Attaching the scheduled event is what turns on the speaker's own
   * attendance numbers — until this is set their dashboard has nothing to
   * count. Empty unlinks.
   */
  async function link(s: Speaker, eventId: string) {
    setBusy(s.id);
    setError("");
    setMessage("");
    try {
      await api(`/api/speakers/${s.id}`, {
        method: "PATCH",
        body: JSON.stringify({ eventId: eventId || null }),
      });
      onChange(await api<Speaker[]>("/api/speakers"));
      setMessage(
        eventId
          ? `Linked ${s.name || "speaker"} to their event.`
          : `Unlinked ${s.name || "speaker"} from their event.`,
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }
  async function invite(s: Speaker) {
    setBusy(s.id);
    setError("");
    setCredentials(null);
    try {
      const result = await api<{ username: string; tempPassword: string }>(
        `/api/speakers/${s.id}/invite`,
        { method: "POST" },
      );
      setCredentials(result);
      onChange(await api<Speaker[]>("/api/speakers"));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }
  async function draft(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy("draft");
    setError("");
    try {
      const result = await api<{ id: string }>("/api/speakers/drafts", {
        method: "POST",
        body: JSON.stringify(
          Object.fromEntries([...data.entries()].filter(([, v]) => v)),
        ),
      });
      setDraftLink(`${window.location.origin}/speak/${result.id}`);
      onChange(await api<Speaker[]>("/api/speakers"));
      setAdding(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }
  return (
    <>
      <Heading
        title="Bring new voices in."
        description="From the first introduction to a confirmed guest. Keep every speaker in view."
        action={
          <button className="d-button" onClick={() => setAdding(!adding)}>
            {adding ? "Close draft form" : "+ Add speaker"}
          </button>
        }
      />
      <div className="d-directory-summary">
        {[
          ["Submissions", speakers?.length],
          [
            "Awaiting review",
            speakers?.filter((s) => s.status === "PENDING" && s.submittedAt)
              .length,
          ],
          [
            "Confirmed",
            speakers?.filter((s) => s.status === "CONFIRMED").length,
          ],
          ["Portal accounts", speakers?.filter((s) => s.user).length],
        ].map(([label, count]) => (
          <div key={label}>
            <strong>{count ?? "—"}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      {adding && (
        <form onSubmit={draft} className="d-panel d-form">
          <h2>Start a speaker draft</h2>
          <p>
            Add what you know. You’ll get a private link the speaker can use to
            complete their details.
          </p>
          <div className="d-form-grid">
            <label>
              Name
              <input name="name" />
            </label>
            <label>
              Email
              <input type="email" name="email" />
            </label>
            <label>
              Organization
              <input name="organization" />
            </label>
            <label>
              Referred by
              <input name="referredBy" />
            </label>
          </div>
          <button className="d-button" disabled={!!busy}>
            {busy === "draft" ? "Creating…" : "Create speaker draft"}
          </button>
        </form>
      )}
      {draftLink && (
        <div className="d-success" role="status">
          Draft created. Share this private link with the speaker:{" "}
          <a href={draftLink}>{draftLink}</a>
        </div>
      )}
      {error && (
        <p className="d-error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="d-success" role="status">
          {message}
        </p>
      )}
      {credentials && (
        <div className="d-success" role="status">
          <strong>Portal account created.</strong>
          <p>
            Username: <code>{credentials.username}</code> · Temporary password:{" "}
            <code>{credentials.tempPassword}</code>
          </p>
          <p>
            The speaker must change this password on first sign-in. Save these
            details before dismissing.
          </p>
          <button
            className="d-text-button"
            onClick={() => setCredentials(null)}
          >
            Dismiss credentials
          </button>
        </div>
      )}
      <section className="d-panel d-directory">
        <div className="d-directory-toolbar">
          <label className="d-search">
            <span className="sr-only">Search speakers</span>
            <input
              placeholder="Search name, email, or organization…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label className="d-filter">
            <span>Status</span>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="ALL">All speakers</option>
              <option value="PENDING">Pending review</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="DECLINED">Declined</option>
              <option value="DRAFT">Drafts</option>
            </select>
          </label>
        </div>
        <div className="d-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Speaker</th>
                <th>Organization</th>
                <th>Status</th>
                <th>Portal</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered?.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="d-table-person">
                      <span className="d-avatar">{initials(s.name)}</span>
                      <span>
                        <strong>{s.name || "Untitled draft"}</strong>
                        <small>{s.email || "No email yet"}</small>
                      </span>
                    </div>
                  </td>
                  <td>{s.organization || "Not provided"}</td>
                  <td>
                    <span className={`d-badge ${s.status.toLowerCase()}`}>
                      {!s.submittedAt
                        ? "Draft"
                        : s.status === "PENDING"
                          ? "Pending review"
                          : s.status === "CONFIRMED"
                            ? "Confirmed"
                            : "Declined"}
                    </span>
                  </td>
                  <td>{s.user ? "Active" : "Not invited"}</td>
                  <td>
                    <button
                      className="d-text-button"
                      aria-expanded={open === s.id}
                      onClick={() => setOpen(open === s.id ? null : s.id)}
                    >
                      {open === s.id ? "Close" : "Review"}
                      <span className="sr-only"> {s.name || "draft"}</span> ↗
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered?.length === 0 && (
          <Empty
            title={
              speakers?.length
                ? "No matching speakers"
                : "Your next guest starts here"
            }
          >
            {speakers?.length
              ? "Try a different search or status filter."
              : "Add a speaker draft or share the public speaker application."}
          </Empty>
        )}
        {!speakers && (
          <p className="d-muted">Speaker submissions are not available yet.</p>
        )}
      </section>
      {speakers
        ?.filter((s) => s.id === open)
        .map((s) => (
          <section className="d-panel d-speaker-detail" key={s.id}>
            <div className="d-section-head">
              <h2>{s.name || "Speaker draft"}</h2>
              <button className="d-text-button" onClick={() => setOpen(null)}>
                Close details
              </button>
            </div>
            <dl>
              <div>
                <dt>Talk</dt>
                <dd>{s.talkTitle || "Not named yet"}</dd>
              </div>
              <div>
                <dt>Slides</dt>
                <dd>
                  {s.slidesUrl ? (
                    <a href={s.slidesUrl} target="_blank" rel="noreferrer">
                      Open slides ↗
                    </a>
                  ) : (
                    "Not shared yet"
                  )}
                </dd>
              </div>
              <div>
                <dt>Contact</dt>
                <dd>{s.email || "Not provided"}</dd>
              </div>
              <div>
                <dt>Referred by</dt>
                <dd>{s.referredBy || "Not provided"}</dd>
              </div>
              <div>
                <dt>Equipment & needs</dt>
                <dd>{s.needs || "None specified"}</dd>
              </div>
              <div>
                <dt>Notes</dt>
                <dd>{s.note || "No notes yet"}</dd>
              </div>
              <div>
                <dt>Availability</dt>
                <dd>
                  {s.availability?.length
                    ? s.availability.map((w, i) => (
                        <p key={i}>
                          {w.startDate} to {w.endDate}, {w.startTime}–
                          {w.endTime}
                        </p>
                      ))
                    : "Not shared yet"}
                </dd>
              </div>
            </dl>
            <label className="d-link-event">
              Scheduled event
              <select
                value={s.event?.id ?? ""}
                disabled={busy === s.id}
                onChange={(e) => link(s, e.target.value)}
              >
                <option value="">Not scheduled yet</option>
                {events?.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title} · {date(e.startsAt)}
                  </option>
                ))}
              </select>
              <small>
                Links this speaker to the event so their dashboard can show
                RSVPs and check-ins.
              </small>
            </label>
            <div className="d-actions">
              {s.user?.resumeFilename && (
                <a
                  className="d-button secondary"
                  href={`/api/resume/${s.user.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Download resume ↗
                </a>
              )}
              {s.user?.linkedin && /^https?:\/\//i.test(s.user.linkedin) && (
                <a
                  className="d-button secondary"
                  href={s.user.linkedin}
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn ↗
                </a>
              )}
              {!s.submittedAt && (
                <a className="d-button secondary" href={`/speak/${s.id}`}>
                  Open completion link ↗
                </a>
              )}
              {s.submittedAt && s.status !== "CONFIRMED" && (
                <button
                  className="d-button"
                  disabled={!!busy}
                  onClick={() => status(s, "CONFIRMED")}
                >
                  Confirm speaker
                </button>
              )}
              {s.submittedAt && s.status !== "DECLINED" && (
                <button
                  className="d-button secondary"
                  disabled={!!busy}
                  onClick={() => status(s, "DECLINED")}
                >
                  Decline speaker
                </button>
              )}
              {s.status === "CONFIRMED" &&
                !s.user &&
                user.role === "EXEC_BOARD" && (
                  <button
                    className="d-button"
                    disabled={!!busy}
                    onClick={() => invite(s)}
                  >
                    {busy === s.id
                      ? "Inviting…"
                      : "Create account & email invite"}
                  </button>
                )}
            </div>
            <Thread
              submissionId={s.id}
              user={user}
              events={events}
              title={`Thread with ${s.name || "this speaker"}`}
              description="Shared with every board member. Type [[ to reference an event."
            />
          </section>
        ))}
    </>
  );
}
