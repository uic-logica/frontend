"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Heading, Empty } from "./Overview";
import { EventForm, eventBody } from "./Participation";
import { Thread } from "./Thread";
import { useConfirm } from "./useConfirm";
import { useUrlState } from "./useUrlState";
import { Arrow } from "./Icon";
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
  onEvents,
  onChange,
}: {
  user: SessionUser;
  speakers: Speaker[] | null;
  events: Event[] | null;
  onEvents: (e: Event[]) => void;
  onChange: (s: Speaker[]) => void;
}) {
  // In the URL, so refresh, Back and a pasted link keep the open guest and filters.
  const [query, setQuery] = useUrlState("q");
  const [filter, setFilter] = useUrlState("status", "ALL");
  const [openId, setOpenId] = useUrlState("id");
  const open = openId || null;
  const setOpen = (id: string | null) => setOpenId(id ?? "", { push: !!id });
  // Which surface a message belongs to: the open guest's detail, or the page top.
  const [scope, setScope] = useState<string>("top");
  const [confirm, confirmDialog] = useConfirm();
  const [adding, setAdding] = useState(false);
  const [creatingEvent, setCreatingEvent] = useState<string | null>(null);
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
    setScope(s.id);
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
  const inTab = (s: Speaker, tab: string) =>
    tab === "ALL" || (tab === "DRAFT" ? !s.submittedAt : s.status === tab && !!s.submittedAt);
  const filtered = speakers?.filter(
    (s) =>
      inTab(s, filter) &&
      `${s.name} ${s.email} ${s.organization}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  async function remove(s: Speaker) {
    const ok = await confirm({
      title: `Delete ${s.name || "this guest"}?`,
      body: "Their details, thread and speaker sign-in are gone for good. A linked event stays on the calendar.",
      action: "Delete",
      danger: true,
    });
    if (!ok) return;
    setBusy(s.id);
    setScope(s.id);
    setError("");
    setMessage("");
    try {
      await api(`/api/speakers/${s.id}`, { method: "DELETE" });
      setOpen(null);
      onChange(await api<Speaker[]>("/api/speakers"));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function status(s: Speaker, value: string) {
    setBusy(s.id);
    setScope(s.id);
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
          ? `${s.name || "Candidate"} is now a speaker. Their talk details and event numbers are unlocked.`
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
    setScope(s.id);
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
  /** Creates the talk's event and links it in one call, so it's on the speaker's dashboard at once. */
  async function createEvent(e: React.FormEvent<HTMLFormElement>, s: Speaker) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(s.id);
    setScope(s.id);
    setError("");
    setMessage("");
    try {
      await api(`/api/speakers/${s.id}`, {
        method: "PATCH",
        body: JSON.stringify({ newEvent: eventBody(data) }),
      });
      onChange(await api<Speaker[]>("/api/speakers"));
      onEvents(await api<Event[]>("/api/events"));
      setCreatingEvent(null);
      setMessage(`Event created and linked. ${s.name || "The speaker"} can see it on their dashboard.`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }
  async function invite(s: Speaker) {
    setBusy(s.id);
    setScope(s.id);
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
    setScope("top");
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
  const detail = speakers?.find((s) => s.id === open) ?? null;
  const hasDetail = !!detail;
  // On a narrow screen the detail stacks under the list: bring it into view.
  useEffect(() => {
    if (open && matchMedia("(max-width: 900px)").matches)
      requestAnimationFrame(() => document.getElementById("speaker-detail")?.scrollIntoView());
  }, [open, hasDetail]);
  const stage = (s: Speaker) =>
    !s.submittedAt ? "Draft" : s.status === "PENDING" ? "Candidate" : s.status === "CONFIRMED" ? "Speaker" : "Declined";
  const banners = (
    <>
      {error && <p className="d-error" role="alert">{error}</p>}
      {message && <p className="d-success" role="status">{message}</p>}
      {draftLink && (
        <div className="d-invite-link" role="status">
          <div>
            <strong>Send them this.</strong>
            <small>
              Works once, expires in 14 days, and won&apos;t be shown again. Copy it now. They set their own email
              and password on it.
            </small>
          </div>
          <code>{draftLink}</code>
          <div className="d-actions">
            <button className="d-button" onClick={copyLink}>{copied ? "Copied" : "Copy link"}</button>
            <button className="d-text-button" onClick={() => setDraftLink("")}>Done</button>
          </div>
        </div>
      )}
      {credentials && (
        <div className="d-success" role="status">
          <strong>Portal account created.</strong>
          <p>
            Username: <code>{credentials.username}</code> · Temporary password: <code>{credentials.tempPassword}</code>
          </p>
          <p>The speaker must change this password on first sign-in. Save these details before dismissing.</p>
          <button className="d-text-button" onClick={() => setCredentials(null)}>Dismiss credentials</button>
        </div>
      )}
    </>
  );
  const TABS: [string, string][] = [
    ["ALL", "All"],
    ["PENDING", "Candidates"],
    ["CONFIRMED", "Confirmed"],
    ["DECLINED", "Declined"],
    ["DRAFT", "Drafts"],
  ];
  return (
    <>
      {confirmDialog}
      <Heading
        title="Speakers"
        description="Guests we've invited, and where each one stands."
        action={
          <button className="d-button" onClick={() => setAdding(!adding)}>
            {adding ? "Close draft form" : "+ Invite a guest"}
          </button>
        }
      />
      {adding && (
        <form onSubmit={draft} className="d-panel d-form">
          <h2>Invite a guest</h2>
          <p>
            Add what you know, all of it optional. You get one link to send them; they pick a password and
            they&apos;re set up, no second step from you.
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
      {scope === "top" && banners}
      <div className="d-split-toolbar">
        <div className="d-tabs d-stage-tabs" role="group" aria-label="Filter speakers by stage">
          {TABS.map(([value, label]) => (
            <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>
              {label} <span>{speakers ? speakers.filter((s) => inTab(s, value)).length : "—"}</span>
            </button>
          ))}
        </div>
        <label className="d-search">
          <span className="sr-only">Search speakers</span>
          <input type="search" placeholder="Search name, email, or organization…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
      </div>
      <div className="d-split">
        <section className="d-panel d-split-list" aria-label="Speakers">
          {!speakers && <p className="d-muted">Speaker submissions are not available yet.</p>}
          {filtered?.length === 0 && (
            <Empty title={speakers?.length ? "No matching speakers" : "Your next guest starts here"}>
              {speakers?.length
                ? "Try a different search or stage."
                : "Invite a guest, or share the public speaker application."}
            </Empty>
          )}
          {!!filtered?.length && (
            <ul>
              {filtered.map((s) => (
                <li key={s.id}>
                  <button
                    aria-current={open === s.id ? "true" : undefined}
                    aria-controls="speaker-detail"
                    onClick={() => {
                      setOpen(s.id);
                      setScope(s.id);
                      setMessage("");
                      setError("");
                    }}
                  >
                    <span className="d-avatar">{initials(s.name)}</span>
                    <span>
                      <strong>{s.name || "Untitled draft"}</strong>
                      <small>
                        {s.organization || s.email || "No details yet"} · {VISIT_LABEL[s.kind ?? "TALK"]}
                      </small>
                    </span>
                    <span className="d-split-meta">
                      <span className={`d-badge ${s.submittedAt ? s.status.toLowerCase() : "pending"}`}>{stage(s)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
        {detail ? (
          <section id="speaker-detail" className="d-panel d-speaker-detail d-split-detail" aria-labelledby="speaker-detail-title">
            <button className="d-text-button d-split-back" onClick={() => setOpen(null)}>
              ← All speakers
            </button>
            <div className="d-split-head">
              <span className="d-avatar d-avatar-large">{initials(detail.name)}</span>
              <div>
                <h2 id="speaker-detail-title">{detail.name || "Speaker draft"}</h2>
                {detail.email ? <a href={`mailto:${detail.email}`}>{detail.email}</a> : <small>No email yet</small>}
              </div>
              <span className={`d-badge ${detail.submittedAt ? detail.status.toLowerCase() : "pending"}`}>{stage(detail)}</span>
            </div>
            {scope === detail.id && banners}
            <SpeakerFacts s={detail} />
            <div className="d-speaker-schedule">
            <label className="d-link-event">
              Scheduled event
              <select value={detail.event?.id ?? ""} disabled={busy === detail.id} onChange={(e) => link(detail, e.target.value)}>
                <option value="">Not scheduled yet</option>
                {events?.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title} · {date(e.startsAt)}
                  </option>
                ))}
              </select>
              <small>Links this speaker to the event so their dashboard can show RSVPs and check-ins.</small>
            </label>
            {!detail.event &&
              (creatingEvent === detail.id ? (
                <EventForm
                  event={{
                    title: detail.talkTitle ?? "",
                    // The first window they offered, as a starting point; datetime-local reads it as local time.
                    startsAt: detail.availability?.[0]
                      ? `${detail.availability[0].startDate}T${detail.availability[0].startTime}`
                      : undefined,
                  }}
                  heading={`New event for ${detail.name || "this guest"}`}
                  busy={busy === detail.id}
                  submitLabel="Create and link"
                  onSubmit={(e) => createEvent(e, detail)}
                  onCancel={() => setCreatingEvent(null)}
                />
              ) : (
                <button className="d-button secondary" onClick={() => setCreatingEvent(detail.id)}>
                  + Create an event for this talk
                </button>
              ))}
            </div>
            <div className="d-actions d-speaker-actions">
              {detail.user?.resumeFilename && (
                <a className="d-button secondary" href={`/api/resume/${detail.user.id}`} target="_blank" rel="noreferrer">
                  Download resume <Arrow />
                </a>
              )}
              {detail.user?.linkedin && /^https?:\/\//i.test(detail.user.linkedin) && (
                <a className="d-button secondary" href={detail.user.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn <Arrow />
                </a>
              )}
              {/* The link itself is unrecoverable by design, so the only honest
                  affordance is "make a new one", which kills the old. */}
              {!detail.user && (
                <button
                  className="d-button secondary"
                  disabled={!!busy}
                  onClick={async () => {
                    if (
                      !detail.inviteLive ||
                      (await confirm({
                        title: "Replace their link?",
                        body: "The link they already have stops working. You'll get a new one to send.",
                        action: "Replace link",
                        danger: true,
                      }))
                    )
                      void newLink(detail);
                  }}
                >
                  {busy === detail.id ? "Making a link…" : detail.inviteLive ? "Replace their link" : "Make a sign-up link"}
                </button>
              )}
              {detail.submittedAt && detail.status !== "CONFIRMED" && (
                <button
                  className="d-button"
                  disabled={!!busy}
                  title={detail.availabilityConfirmedAt ? undefined : "They haven't confirmed their availability yet."}
                  onClick={() => status(detail, "CONFIRMED")}
                >
                  Confirm as speaker
                </button>
              )}
              {detail.status === "CONFIRMED" && (
                <button className="d-button secondary" disabled={!!busy} onClick={() => status(detail, "PENDING")}>
                  Move back to candidate
                </button>
              )}
              {detail.submittedAt && detail.status !== "DECLINED" && (
                <button
                  className="d-button secondary"
                  disabled={!!busy}
                  onClick={async () => {
                    if (
                      await confirm({
                        title: `Decline ${detail.name || "this guest"}?`,
                        body: "They'll see they weren't picked this time. You can move them back later.",
                        action: "Decline",
                        danger: true,
                      })
                    )
                      void status(detail, "DECLINED");
                  }}
                >
                  Decline
                </button>
              )}
              {detail.submittedAt && detail.status !== "DECLINED" && !detail.user && user.role === "EXEC_BOARD" && (
                <button className="d-button" disabled={!!busy} onClick={() => invite(detail)}>
                  {busy === detail.id
                    ? "Inviting…"
                    : detail.status === "CONFIRMED"
                      ? "Create account & email invite"
                      : "Invite as candidate"}
                </button>
              )}
            </div>
            <Thread
              submissionId={detail.id}
              user={user}
              events={events}
              windows={detail.availability ?? []}
              title={`Thread with ${detail.name || "this speaker"}`}
              description="Shared with every board member"
            />
            <div className="d-delete-row">
              <button className="d-button secondary danger" disabled={!!busy} onClick={() => remove(detail)}>
                Delete guest
              </button>
            </div>
          </section>
        ) : (
          !!filtered?.length && (
            <section className="d-panel d-split-detail d-split-empty">
              <p className="d-muted">Pick a guest to see their details, availability and thread.</p>
            </section>
          )
        )}
      </div>
    </>
  );
}

/** What we know about a guest so far; talk details unlock once they're confirmed. */
function SpeakerFacts({ s }: { s: Speaker }) {
  return (
    <dl>
      <div>
        <dt>Stage</dt>
        <dd>
          {!s.submittedAt
            ? "Draft, not submitted"
            : s.status === "PENDING"
              ? "Candidate, deciding whether a date works"
              : s.status === "CONFIRMED"
                ? "Speaker, talk details unlocked"
                : "Declined"}
        </dd>
      </div>
      <div>
        <dt>Asking for</dt>
        <dd>{VISIT_LABEL[s.kind ?? "TALK"]}{s.organization ? ` · ${s.organization}` : ""}</dd>
      </div>
      <div>
        <dt>Talk</dt>
        <dd>{s.status === "CONFIRMED" ? s.talkTitle || "Not named yet" : "Unlocks when confirmed"}</dd>
      </div>
      <div>
        <dt>Slides</dt>
        <dd>
          {s.status !== "CONFIRMED" ? (
            "Unlocks when confirmed"
          ) : s.slidesUrl ? (
            <a href={s.slidesUrl} target="_blank" rel="noreferrer">
              Open slides <Arrow />
            </a>
          ) : (
            "Not shared yet"
          )}
        </dd>
      </div>
      <div>
        <dt>Referred by</dt>
        <dd>{s.referredBy || "Not provided"}</dd>
      </div>
      <div>
        <dt>Portal</dt>
        <dd>{s.user ? "Account active" : s.inviteLive ? "Sign-up link sent" : "No account yet"}</dd>
      </div>
      <div>
        <dt>Equipment & needs</dt>
        <dd>{s.needs || "None specified"}</dd>
      </div>
      <div>
        <dt>Notes</dt>
        <dd>{s.note || "No notes yet"}</dd>
      </div>
      <div className="d-split-wide">
        <dt>
          Availability
          {s.availabilityConfirmedAt ? (
            <span className="d-badge confirmed">Confirmed {date(s.availabilityConfirmedAt)}</span>
          ) : s.availability?.length ? (
            <span className="d-badge pending">Still editing</span>
          ) : null}
        </dt>
        <dd>
          {s.availability?.length
            ? s.availability.map((w, i) => (
                <p key={i}>
                  {w.startDate} to {w.endDate}, {w.startTime} to {w.endTime}
                </p>
              ))
            : "Not shared yet"}
        </dd>
      </div>
    </dl>
  );
}
