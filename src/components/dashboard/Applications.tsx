"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, peek } from "@/lib/api";
import { Empty, Heading } from "./Overview";
import { useConfirm } from "./useConfirm";
import { windowLabel } from "./Thread";
import { useUrlState } from "./useUrlState";
import { type Application, date, initials } from "./types";
import { Arrow, Icon } from "./Icon";

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
  // In the URL, so refresh, Back and a pasted link keep the applicant and filters.
  const [statusParam, setStatus] = useUrlState("status", "ALL");
  const status = statusParam as Application["status"] | "ALL";
  const [query, setQuery] = useUrlState("q");
  const [openId, setOpenId] = useUrlState("id");
  const open = openId || null;
  const setOpen = (id: string) => setOpenId(id, { push: true });
  const [confirm, confirmDialog] = useConfirm();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [reload, setReload] = useState(0);
  const [note, setNote] = useState("");
  // The team an accepted Software Teams applicant goes on; defaults to their 1st pick.
  const [teamPick, setTeamPick] = useState<{ id: string; team: string } | null>(null);
  // Accepted people's current teams, by user id.
  const [teams, setTeams] = useState<Record<string, string> | null | "error">(null);
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
    api<{ members: { id: string; team: string }[] }>("/api/board/teams")
      .then((data) => alive && setTeams(Object.fromEntries(data.members.map((m) => [m.id, m.team]))))
      .catch(() => alive && setTeams("error"));
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
  // The open applicant stays in the detail even after a decision moves them
  // out of the current tab, so the next click never lands on someone else.
  // With nothing picked, the first match shows, so the pane is never empty.
  const detail = items?.find((item) => item.id === open) ?? filtered?.[0];
  const next = filtered?.find((item) => item.id !== detail?.id);
  // Their current team, once accepted ("" = not placed; undefined = not loaded).
  const current = detail?.userId && teams && teams !== "error" ? teams[detail.userId] ?? "" : undefined;
  const team = detail && teamPick?.id === detail.id ? teamPick.team : current || detail?.projects?.[0] || "";

  async function place(item: Application, next: string) {
    setBusy(true);
    setError("");
    setSaved("");
    try {
      await api(`/api/board/teams/${item.userId}`, { method: "PUT", body: JSON.stringify({ team: next || null }) });
      setReload((value) => value + 1);
      setSaved(next ? `${item.name}: placed on ${PROJECT[next]}.` : `${item.name}: taken off their team.`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(item: Application, next: Application["status"], extra: Record<string, unknown> = {}) {
    setBusy(true);
    setError("");
    setSaved("");
    try {
      await api(`/api/join/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: next, ...extra }),
      });
      setOpenId(item.id);
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
      {confirmDialog}
      <Heading title="Applications" description="Review membership applications and record the next decision." />
      {error && <p className="d-error" role="alert">{error}{" "}
        {!items && <button className="d-text-button" onClick={() => setReload((value) => value + 1)}>Retry loading</button>}
      </p>}
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
                    setSaved("");
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
      {detail && <section id="application-detail" className="d-panel d-speaker-detail d-split-detail d-app-detail" aria-labelledby="application-detail-title">
        <div className="d-split-head">
          <span className="d-avatar d-avatar-large">{initials(detail.name)}</span>
          <div>
            <h2 id="application-detail-title">{detail.name}</h2>
            <a href={`mailto:${detail.email}`}>{detail.email}</a>
          </div>
          <span className={`d-badge ${tone(detail.status)}`}>{LABEL[detail.status]}</span>
        </div>
        {saved && (
          <p className="d-success" role="status">
            {saved}{" "}
            {next && (
              <button className="d-text-button" onClick={() => { setSaved(""); setOpen(next.id); }}>
                Next: {next.name} <Arrow />
              </button>
            )}
          </p>
        )}
        {error && items && <p className="d-error" role="alert">{error}</p>}
        {detail.track === "SOFTWARE_ENGINEER" && detail.status === "ACCEPTED" && (
          <section aria-labelledby="application-team">
            <h3 id="application-team" className="d-subhead">Team</h3>
            {!detail.userId ? <p className="d-muted">No account yet, so they can&apos;t be placed. They&apos;ll show up in Software Teams once they sign up.</p>
              : teams === "error" ? <p className="d-muted">Couldn&apos;t load teams. Place them from <Link href="/dashboard/teams">Software Teams</Link>.</p>
              : <form className="d-app-place" onSubmit={(event) => { event.preventDefault(); void place(detail, team); }}>
                  <label className="sr-only" htmlFor="application-team-select">Team for {detail.name}</label>
                  <select id="application-team-select" value={team} disabled={!teams} onChange={(event) => setTeamPick({ id: detail.id, team: event.target.value })}>
                    <option value="">Not on a team</option>
                    {Object.entries(PROJECT).map(([value, name]) => <option key={value} value={value}>{name}</option>)}
                  </select>
                  <button className="d-button secondary" type="submit" disabled={busy || !teams || team === current}>{current ? "Move" : "Place on team"}</button>
                  <span className="d-muted">{!teams ? "Loading…" : current ? `On ${PROJECT[current]}` : "Not placed yet"}</span>
                </form>}
          </section>
        )}
        <p className="d-app-summary">
          {[TRACK[detail.track], [detail.major, detail.gradYear && `’${String(detail.gradYear).slice(-2)}`].filter(Boolean).join(" "),
            detail.hoursPerWeek != null && `${detail.hoursPerWeek} hrs/week`].filter(Boolean).join(" · ")}
        </p>
        {detail.track === "SOFTWARE_ENGINEER" && <dl className="d-app-facts">
          <div><dt>Picks</dt><dd>{detail.projects?.length ? <ol>{detail.projects.map((p) => <li key={p}>{PROJECT[p] ?? p}</li>)}</ol> : "None picked"}</dd></div>
          <div><dt>Skills</dt><dd>{detail.skills || "Not provided"}</dd></div>
        </dl>}
        {(detail.track === "SOFTWARE_ENGINEER" || detail.github || detail.resumeUrl) && <div className="d-actions d-app-links">
          {detail.resumeOnFile && detail.userId && <a className="d-button secondary" href={`/api/resume/${detail.userId}`} download><Icon name="download" /> Download resume</a>}
          {detail.resumeUrl && <a className="d-button secondary" href={detail.resumeUrl} target="_blank" rel="noreferrer">Resume link <Arrow /></a>}
          {detail.github && <a className="d-button secondary" href={githubUrl(detail.github)} target="_blank" rel="noreferrer">GitHub · {detail.github} <Arrow /></a>}
          {!detail.resumeOnFile && !detail.resumeUrl && <span className="d-muted">No resume provided</span>}
        </div>}
        <dl>
          {detail.reviewNote && <div><dt>Review note</dt><dd>{detail.reviewNote}</dd></div>}
          {detail.reviewedAt && <div><dt>Info requested</dt><dd>{date(detail.reviewedAt, { month: "long", day: "numeric", year: "numeric" })}</dd></div>}
          {detail.status === "INTERVIEW" && (
            <div className="d-split-wide">
              <dt>Interview availability</dt>
              <dd>
                {detail.interviewAvailability?.length ? (
                  <>
                    <ul className="d-interview-times">
                      {detail.interviewAvailability.map((w, i) => <li key={i}>{windowLabel(w)}</li>)}
                    </ul>
                    {detail.interviewAvailabilityAt && <small className="d-muted">Shared {date(detail.interviewAvailabilityAt, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</small>}
                  </>
                ) : (
                  <span className="d-muted">Waiting on them. Their interview email has a link to share times.</span>
                )}
              </dd>
            </div>
          )}
          {detail.status === "DECLINED" && <div><dt>May reapply</dt><dd>{detail.canReapply ? "Yes, after the waiting period" : "No"}</dd></div>}
        </dl>
        <h3 className="d-subhead">{detail.track === "SOFTWARE_ENGINEER" ? "Why are you special?" : "Why do you want to join?"}</h3>
        <p className="d-app-why">{detail.why || "No answer provided"}</p>
        <p className="d-muted d-app-dates">
          Applied {date(detail.createdAt, { month: "short", day: "numeric", year: "numeric" })}
          {detail.decidedAt && ` · Decided ${date(detail.decidedAt, { month: "short", day: "numeric", year: "numeric" })}`}
        </p>
        {asking && <form className="d-review-form" onSubmit={(event) => { event.preventDefault(); void changeStatus(detail, "NEEDS_INFO", { note: note.trim() }); }}>
          <label htmlFor="application-review-note">What should the applicant add?</label>
          <textarea id="application-review-note" required minLength={10} maxLength={1000} rows={4} value={note} onChange={(event) => setNote(event.target.value)} />
          <div className="d-actions"><button className="d-button" type="submit" disabled={busy}>Send request</button><button className="d-button secondary" type="button" onClick={() => setAsking(false)}>Cancel</button></div>
        </form>}
        {detail.track === "SOFTWARE_ENGINEER" && detail.status !== "ACCEPTED" && (
          <label className="d-accept-team">Team when accepted
            <select value={team} onChange={(event) => setTeamPick({ id: detail.id, team: event.target.value })}>
              <option value="">Decide later (Software Teams tab)</option>
              {Object.entries(PROJECT).map(([value, name]) => <option key={value} value={value}>{name}</option>)}
            </select>
          </label>
        )}
        <div className="d-actions" aria-busy={busy}>
          {STATUSES.filter((value) => value !== "DECLINED").map((value) => <button key={value} className="d-button secondary" disabled={busy || detail.status === value} onClick={() => value === "NEEDS_INFO" ? setAsking(true) : changeStatus(detail, value, value === "ACCEPTED" && detail.track === "SOFTWARE_ENGINEER" && team ? { team } : {})}>{ACTION[value]}</button>)}
        </div>
        <form className="d-decline-action" onSubmit={async (event) => {
          event.preventDefault();
          if (await confirm({
            title: `Decline ${detail.name}?`,
            body: canReapply ? "They'll be told, and can apply again after the waiting period." : "They'll be told, and can't apply again.",
            action: "Decline",
            danger: true,
          })) void changeStatus(detail, "DECLINED", { canReapply });
        }}>
          <label><input type="checkbox" checked={canReapply} onChange={(event) => setCanReapply(event.target.checked)} /> Can reapply later</label>
          <button className="d-button secondary" type="submit" disabled={busy || detail.status === "DECLINED"}>{ACTION.DECLINED}</button>
        </form>
        {busy && <p className="d-muted" role="status">Saving status…</p>}
        {detail.status !== "PENDING" && (
          <p className="d-resend">
            <button
              className="d-text-button"
              disabled={busy}
              onClick={async () => {
                if (!(await confirm({
                  title: `Email ${detail.name} again?`,
                  body: `They get their "${LABEL[detail.status]}" email again${detail.status === "INTERVIEW" ? ", with a new link to share their availability" : ""}.`,
                  action: "Send email",
                }))) return;
                setBusy(true);
                setError("");
                setSaved("");
                try {
                  await api(`/api/join/${detail.id}/notify`, { method: "POST" });
                  setSaved(`${detail.name}: "${LABEL[detail.status]}" email sent again.`);
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Resend status email
            </button>
          </p>
        )}
        <div className="d-delete-row">
          <button
            className="d-button secondary danger"
            disabled={busy}
            onClick={async () => {
              if (!(await confirm({ title: `Delete ${detail.name}'s application?`, body: "It's gone for good. Their account, if they have one, stays.", action: "Delete", danger: true }))) return;
              setBusy(true);
              setError("");
              try {
                await api(`/api/join/${detail.id}`, { method: "DELETE" });
                setOpenId("");
                setSaved("");
                setReload((value) => value + 1);
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            Delete application
          </button>
        </div>
      </section>}
      </div>}
    </>
  );
}
