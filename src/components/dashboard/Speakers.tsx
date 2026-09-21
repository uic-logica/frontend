"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { Heading, Empty } from "./Overview";
import { Thread } from "./Thread";
import {
  type Event,
  type Speaker,
  type SessionUser,
  date,
  initials,
  inviteUrl,
  VISIT_LABEL,
} from "./types";

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
  const [copied, setCopied] = useState(false);

  /**
   * The link only exists in this response — the server keeps a hash, so it
   * can never be shown again. Regenerating is the recovery path.
   */
  async function newLink(s: Speaker) {
    setBusy(s.id);
    setError("");
    setMessage("");
    try {
      const { inviteToken } = await api<{ inviteToken: string }>(
        `/api/speakers/${s.id}/invite-link`,
        { method: "POST" },
      );
      setDraftLink(inviteUrl(inviteToken));
      setCopied(false);
      onChange(await api<Speaker[]>("/api/speakers"));
      setMessage(
        `New link for ${s.name || "this guest"}. The previous one stopped working.`,
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(draftLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }
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
      setMessage(
        value === "CONFIRMED"
          ? `${s.name || "Candidate"} is now a speaker — their talk details and event numbers are unlocked.`
          : value === "PENDING"
            ? `${s.name || "Speaker"} moved back to candidate.`
            : `${s.name || "Speaker"} declined.`,
      );
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
      const result = await api<{ id: string; inviteToken: string }>(
        "/api/speakers/drafts",
        {
          method: "POST",
          body: JSON.stringify(
            Object.fromEntries([...data.entries()].filter(([, v]) => v)),
          ),
        },
      );
      setDraftLink(inviteUrl(result.inviteToken));
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
            "Candidates",
            speakers?.filter((s) => s.status === "PENDING" && s.submittedAt)
              .length,
          ],
          [
            "Ready to decide",
            speakers?.filter(
              (s) => s.status === "PENDING" && s.availabilityConfirmedAt,
            ).length,
          ],
          [
            "Confirmed speakers",
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
          <h2>Invite a guest</h2>
          <p>
            Add what you know — all of it optional. You get one link to send
            them; they pick a password and they&apos;re set up, no second step
            from you.
          </p>
          <div className="d-form-grid">
            <label>
              What are we asking for
              <select name="kind" defaultValue="TALK">
                <option value="TALK">A talk</option>
                <option value="WORKSHOP">A workshop</option>
                <option value="COMPANY_VISIT">A company visit</option>
              </select>
            </label>
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
            {busy === "draft" ? "Creating…" : "Create the link"}
          </button>
        </form>
      )}
      {draftLink && (
        <div className="d-invite-link" role="status">
          <div>
            <strong>Send them this.</strong>
            <small>
              Works once, expires in 14 days, and won&apos;t be shown again —
              copy it now. They set their own email and password on it.
            </small>
          </div>
          <code>{draftLink}</code>
          <div className="d-actions">
            <button className="d-button" onClick={copyLink}>
              {copied ? "Copied" : "Copy link"}
            </button>
            <button className="d-text-button" onClick={() => setDraftLink("")}>
              Done
            </button>
          </div>
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
                  <td>
                    {s.organization || "Not provided"}
                    <small>{VISIT_LABEL[s.kind ?? "TALK"]}</small>
                  </td>
                  <td>
                    <span className={`d-badge ${s.status.toLowerCase()}`}>
                      {!s.submittedAt
                        ? "Draft"
                        : s.status === "PENDING"
                          ? "Candidate"
                          : s.status === "CONFIRMED"
                            ? "Speaker"
                            : "Declined"}
                    </span>
                  </td>
                  <td>
                    {s.user ? (
                      "Active"
                    ) : s.inviteLive ? (
                      <span className="d-badge pending">Link sent</span>
                    ) : (
                      "No account"
                    )}
                  </td>
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
                <dt>Stage</dt>
                <dd>
                  {!s.submittedAt
                    ? "Draft — not submitted"
                    : s.status === "PENDING"
                      ? "Candidate — deciding whether a date works"
                      : s.status === "CONFIRMED"
                        ? "Speaker — talk details unlocked"
                        : "Declined"}
                </dd>
              </div>
              <div>
                <dt>Talk</dt>
                <dd>
                  {s.status === "CONFIRMED"
                    ? s.talkTitle || "Not named yet"
                    : "Unlocks when confirmed"}
                </dd>
              </div>
              <div>
                <dt>Slides</dt>
                <dd>
                  {s.status !== "CONFIRMED" ? (
                    "Unlocks when confirmed"
                  ) : s.slidesUrl ? (
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
                <dt>
                  Availability
                  {s.availabilityConfirmedAt ? (
                    <span className="d-badge confirmed">
                      Confirmed {date(s.availabilityConfirmedAt)}
                    </span>
                  ) : s.availability?.length ? (
                    <span className="d-badge pending">Still editing</span>
                  ) : null}
                </dt>
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
              {/* The link itself is unrecoverable by design, so the only
                  honest affordance is "make a new one" — which kills the
                  old. Board-wide, not exec: sending someone a link is not
                  the same power as handing out an account by email. */}
              {!s.user && (
                <button
                  className="d-button secondary"
                  disabled={!!busy}
                  onClick={() => newLink(s)}
                >
                  {busy === s.id
                    ? "Making a link…"
                    : s.inviteLive
                      ? "Replace their link"
                      : "Make a sign-up link"}
                </button>
              )}
              {s.submittedAt && s.status !== "CONFIRMED" && (
                <button
                  className="d-button"
                  disabled={!!busy}
                  title={
                    s.availabilityConfirmedAt
                      ? undefined
                      : "They haven't confirmed their availability yet."
                  }
                  onClick={() => status(s, "CONFIRMED")}
                >
                  Confirm as speaker
                </button>
              )}
              {s.status === "CONFIRMED" && (
                <button
                  className="d-button secondary"
                  disabled={!!busy}
                  onClick={() => status(s, "PENDING")}
                >
                  Move back to candidate
                </button>
              )}
              {s.submittedAt && s.status !== "DECLINED" && (
                <button
                  className="d-button secondary"
                  disabled={!!busy}
                  onClick={() => status(s, "DECLINED")}
                >
                  Decline
                </button>
              )}
              {s.submittedAt &&
                s.status !== "DECLINED" &&
                !s.user &&
                user.role === "EXEC_BOARD" && (
                  <button
                    className="d-button"
                    disabled={!!busy}
                    onClick={() => invite(s)}
                  >
                    {busy === s.id
                      ? "Inviting…"
                      : s.status === "CONFIRMED"
                        ? "Create account & email invite"
                        : "Invite as candidate"}
                  </button>
                )}
            </div>
            <Thread
              submissionId={s.id}
              user={user}
              events={events}
              windows={s.availability ?? []}
              title={`Thread with ${s.name || "this speaker"}`}
              description="Shared with every board member"
            />
          </section>
        ))}
    </>
  );
}
