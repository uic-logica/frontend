"use client";

import { useEffect, useState } from "react";
import { api, peek } from "@/lib/api";
import { Empty, Heading } from "./Overview";
import { type Application, date, initials } from "./types";

const STATUSES = ["PENDING", "INTERVIEW", "NEEDS_INFO", "ACCEPTED", "DECLINED"] as const;
const LABEL = {
  ALL: "All",
  PENDING: "Pending",
  INTERVIEW: "Interview",
  NEEDS_INFO: "More info requested",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
};
const TRACK = {
  GENERAL: "General",
  SOFTWARE_ENGINEER: "Software engineer",
  MENTORSHIP: "Mentorship",
  BOARD_MEMBER: "Board member",
};
const PROJECT: Record<string, string> = {
  OPPORTUNITY_BOARD: "Opportunity board",
  RESUME_BUILDER: "Resume builder",
  EVENT_REPLAYS: "Event replays",
  MOCK_INTERVIEWER: "Mock interviewer",
};
const projects = (item: Application) => item.projects?.map((p) => PROJECT[p] ?? p).join(" → ");
const githubUrl = (value: string) =>
  /^https?:\/\//.test(value) ? value : `https://github.com/${value.replace(/^@/, "")}`;
const ACTION = {
  PENDING: "Mark pending",
  INTERVIEW: "Move to interview",
  NEEDS_INFO: "Ask for more info",
  ACCEPTED: "Accept application",
  DECLINED: "Decline application",
};
const tone = (status: Application["status"]) =>
  status === "ACCEPTED" ? "confirmed" : status === "DECLINED" ? "declined" : "pending";

export function Applications() {
  const [items, setItems] = useState<Application[] | null>(() => peek<Application[]>("/api/join") ?? null);
  const [status, setStatus] = useState<Application["status"] | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [reload, setReload] = useState(0);
  const [note, setNote] = useState("");
  const [asking, setAsking] = useState(false);
  const [canReapply, setCanReapply] = useState(true);

  useEffect(() => {
    let alive = true;
    api<Application[]>("/api/join")
      .then((data) => {
        if (alive) {
          setItems(data);
          setError("");
        }
      })
      .catch((e: Error) => alive && setError(e.message));
    return () => { alive = false; };
  }, [reload]);

  const count = (value: Application["status"]) =>
    items?.filter((item) => item.status === value).length ?? 0;
  const needle = query.trim().toLowerCase();
  const filtered = items?.filter((item) =>
    (status === "ALL" || item.status === status) &&
    [item.name, item.email, TRACK[item.track], item.major, item.gradYear, item.why, item.github, projects(item), item.skills, item.reviewNote]
      .filter(Boolean).join(" ").toLowerCase().includes(needle),
  );
  // The first match stays selected until you pick another, so the detail
  // pane is never empty while there is something to read.
  const detail = filtered?.find((item) => item.id === open) ?? filtered?.[0];

  async function changeStatus(item: Application, next: Application["status"], extra: Record<string, unknown> = {}) {
    setBusy(true);
    setError("");
    setSaved("");
    try {
      await api(`/api/join/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: next, ...extra }),
      });
      setReload((value) => value + 1);
      setSaved(`${item.name}: status saved as ${LABEL[next].toLowerCase()}.`);
      setAsking(false);
      setNote("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Heading title="Applications" description="Review membership applications and record the next decision." />
      {error && <p className="d-error" role="alert">{error}{" "}
        {!items && <button className="d-text-button" onClick={() => setReload((value) => value + 1)}>Retry loading</button>}
      </p>}
      {saved && <p className="d-muted" role="status">{saved}</p>}
      <div className="d-split-toolbar">
        <div className="d-tabs d-stage-tabs" aria-label="Filter applications by status">
          {(["ALL", ...STATUSES] as const).map((value) => (
            <button key={value} aria-pressed={status === value} onClick={() => setStatus(value)}>
              {LABEL[value]} <span>{items ? value === "ALL" ? items.length : count(value) : "—"}</span>
            </button>
          ))}
        </div>
        <label className="d-search">
          <span className="sr-only">Search applications</span>
          <input type="search" placeholder="Search name, email, track, project, skills…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
      </div>
      {(items || !error) && <div className="d-split">
        <section className="d-panel d-split-list" aria-label="Membership applications">
          {!items && !error && <p className="d-muted" role="status">Loading applications…</p>}
          {filtered?.length === 0 && <Empty title={items?.length ? "No matching applications" : "No applications yet"}>
            {items?.length ? "Try another status or a different search." : "Applications submitted through the join page will appear here."}
          </Empty>}
          {!!filtered?.length && <ul>
            {filtered.map((item) => (
              <li key={item.id}>
                <button
                  aria-current={detail?.id === item.id ? "true" : undefined}
                  aria-controls="application-detail"
                  onClick={() => {
                    setOpen(item.id);
                    setAsking(false);
                    setNote("");
                    // Stacked on narrow screens: bring the detail into view.
                    if (matchMedia("(max-width: 900px)").matches)
                      requestAnimationFrame(() => document.getElementById("application-detail")?.scrollIntoView());
                  }}
                >
                  <span className="d-avatar">{initials(item.name)}</span>
                  <span>
                    <strong>{item.name}</strong>
                    <small>{TRACK[item.track]}{item.major ? ` · ${item.major}` : ""}{item.gradYear ? ` ’${String(item.gradYear).slice(-2)}` : ""}</small>
                  </span>
                  <span className="d-split-meta">
                    <time dateTime={item.createdAt}>{date(item.createdAt)}</time>
                    {status === "ALL" && <span className={`d-badge ${tone(item.status)}`}>{LABEL[item.status]}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>}
        </section>
      {detail && <section id="application-detail" className="d-panel d-speaker-detail d-split-detail" aria-labelledby="application-detail-title">
        <div className="d-split-head">
          <span className="d-avatar d-avatar-large">{initials(detail.name)}</span>
          <div>
            <h2 id="application-detail-title">{detail.name}</h2>
            <a href={`mailto:${detail.email}`}>{detail.email}</a>
          </div>
          <span className={`d-badge ${tone(detail.status)}`}>{LABEL[detail.status]}</span>
        </div>
        <dl>
          <div><dt>Track</dt><dd>{TRACK[detail.track]}</dd></div>
          {detail.track === "SOFTWARE_ENGINEER" && detail.github && <>
            <div><dt>GitHub</dt><dd><a href={githubUrl(detail.github)} target="_blank" rel="noreferrer">{detail.github}</a></dd></div>
            <div><dt>Hours a week</dt><dd>{detail.hoursPerWeek ?? "Not provided"}</dd></div>
            <div><dt>Projects, ranked</dt><dd>{projects(detail) || "None picked"}</dd></div>
            <div><dt>Skills</dt><dd>{detail.skills || "Not provided"}</dd></div>
            <div><dt>Resume</dt><dd>
              {detail.resumeOnFile && detail.userId && <a href={`/api/resume/${detail.userId}`}>Download PDF</a>}
              {detail.resumeOnFile && detail.resumeUrl && " · "}
              {detail.resumeUrl && <a href={detail.resumeUrl} target="_blank" rel="noreferrer">Open link ↗</a>}
              {!detail.resumeOnFile && !detail.resumeUrl && "Not provided"}
            </dd></div>
          </>}
          <div><dt>Major / graduation</dt><dd>{detail.major || "Not provided"} · {detail.gradYear ?? "Year not provided"}</dd></div>
          <div><dt>Applied</dt><dd>{date(detail.createdAt, { month: "long", day: "numeric", year: "numeric" })}</dd></div>
          {detail.reviewNote && <div><dt>Review note</dt><dd>{detail.reviewNote}</dd></div>}
          {detail.reviewedAt && <div><dt>Info requested</dt><dd>{date(detail.reviewedAt, { month: "long", day: "numeric", year: "numeric" })}</dd></div>}
          {detail.decidedAt && <div><dt>Decision recorded</dt><dd>{date(detail.decidedAt, { month: "long", day: "numeric", year: "numeric" })}</dd></div>}
          {detail.status === "DECLINED" && <div><dt>May reapply</dt><dd>{detail.canReapply ? "Yes, after the waiting period" : "No"}</dd></div>}
          <div className="d-split-wide"><dt>{detail.track === "SOFTWARE_ENGINEER" ? "Why are you special?" : "Why do you want to join?"}</dt><dd>{detail.why || "No answer provided"}</dd></div>
        </dl>
        {asking && <form className="d-review-form" onSubmit={(event) => { event.preventDefault(); void changeStatus(detail, "NEEDS_INFO", { note: note.trim() }); }}>
          <label htmlFor="application-review-note">What should the applicant add?</label>
          <textarea id="application-review-note" required minLength={10} maxLength={1000} rows={4} value={note} onChange={(event) => setNote(event.target.value)} />
          <div className="d-actions"><button className="d-button" type="submit" disabled={busy}>Send request</button><button className="d-button secondary" type="button" onClick={() => setAsking(false)}>Cancel</button></div>
        </form>}
        <div className="d-actions" aria-busy={busy}>
          {STATUSES.filter((value) => value !== "DECLINED").map((value) => <button key={value} className="d-button secondary" disabled={busy || detail.status === value} onClick={() => value === "NEEDS_INFO" ? setAsking(true) : changeStatus(detail, value)}>{ACTION[value]}</button>)}
        </div>
        <form className="d-decline-action" onSubmit={(event) => { event.preventDefault(); void changeStatus(detail, "DECLINED", { canReapply }); }}>
          <label><input type="checkbox" checked={canReapply} onChange={(event) => setCanReapply(event.target.checked)} /> Can reapply later</label>
          <button className="d-button secondary" type="submit" disabled={busy || detail.status === "DECLINED"}>{ACTION.DECLINED}</button>
        </form>
        {busy && <p className="d-muted" role="status">Saving status…</p>}
      </section>}
      </div>}
    </>
  );
}
