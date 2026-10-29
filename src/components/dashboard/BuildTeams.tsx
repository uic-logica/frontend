"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ResumeUpload } from "@/components/shell/ResumeUpload";
import { api, peek } from "@/lib/api";
import { projects as PROJECT_PAGES, teamPage } from "@/lib/projects";
import { MyApplication } from "./MyApplication";
import { Empty, Heading } from "./Overview";
import { type Profile, type SessionUser, date, runsWorkspace } from "./types";

const PROJECTS = [
  { value: "OPPORTUNITY_BOARD", label: "Opportunity board" },
  { value: "RESUME_BUILDER", label: "Resume builder" },
  { value: "EVENT_REPLAYS", label: "Event replays in 3D" },
  { value: "MOCK_INTERVIEWER", label: "Mock interviewer" },
] as const;
const RANKS = ["1st choice", "2nd choice", "3rd choice"];
const STEPS = ["Pick projects", "Apply", "Interview", "Join your team"];
type Team = (typeof PROJECTS)[number]["value"];
// OPPORTUNITY_BOARD → opportunity-board, the slug lib/projects and GitHub labels use.
const slug = (team: string) => team.toLowerCase().replace(/_/g, "-");
const page = (team: string) => PROJECT_PAGES.find((p) => p.slug === slug(team));
const CONTRIBUTING = "https://github.com/uic-logica/.github/blob/main/CONTRIBUTING.md";
const teamIssues = (team: string) =>
  `https://github.com/search?type=issues&q=${encodeURIComponent(`org:uic-logica is:issue is:open label:"team: ${slug(team)}"`)}`;

type Task = { title: string; url: string; repo: string; number: number };
type MyTeam = { team: Team | null; github: string | null; mine: Task[] | null; open: Task[] | null };
const STATUS = {
  PENDING: "Received, under review",
  INTERVIEW: "Interview, check your email",
  NEEDS_INFO: "More information requested",
  ACCEPTED: "Accepted, you're on a team",
  DECLINED: "Not this round",
} as const;

type Mine = {
  id: string;
  track: string;
  status: keyof typeof STATUS;
  name: string;
  major: string;
  gradYear: number;
  why: string;
  github: string | null;
  hoursPerWeek: number | null;
  projects: string[];
  skills: string | null;
  resumeUrl: string | null;
  reviewNote: string | null;
  canReapply: boolean;
  decidedAt: string | null;
  createdAt: string;
};

const HINT = "logica.softwareTeamsHint";
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;
export function teamsHintHidden(): boolean {
  try {
    const value = localStorage.getItem(HINT);
    return value === "applied" || Number(value) > Date.now();
  } catch { return true; }
}
export function snoozeTeamsHint() {
  try {
    if (localStorage.getItem(HINT) !== "applied") localStorage.setItem(HINT, String(Date.now() + SNOOZE_MS));
  } catch {}
}
export function retireTeamsHint() {
  try { localStorage.setItem(HINT, "applied"); } catch {}
}

const label = (value: string) => PROJECTS.find((project) => project.value === value)?.label ?? value;
type Draft = { name: string; major: string; gradYear: string; github: string; hours: string; picks: string[]; skills: string; why: string; resumeUrl: string };
const EMPTY: Draft = { name: "", major: "", gradYear: "", github: "", hours: "", picks: ["", "", ""], skills: "", why: "", resumeUrl: "" };
const draftKey = (userId: string) => `logica.softwareTeamsDraft.${userId}`;
function loadDraft(userId: string): Draft {
  try { return { ...EMPTY, ...JSON.parse(localStorage.getItem(draftKey(userId)) ?? "{}") }; }
  catch { return EMPTY; }
}
function applicationDraft(item: Mine): Draft {
  return {
    name: item.name, major: item.major, gradYear: String(item.gradYear), github: item.github ?? "",
    hours: item.hoursPerWeek ? String(item.hoursPerWeek) : "", picks: [...item.projects, "", ""].slice(0, 3),
    skills: item.skills ?? "", why: item.why, resumeUrl: item.resumeUrl ?? "",
  };
}
function reapplyDate(value: string) {
  const result = new Date(value);
  result.setUTCDate(result.getUTCDate() + 90);
  return result;
}

export function BuildTeams({ user, profile }: { user: SessionUser; profile: Profile | null }) {
  return runsWorkspace(user) ? <TeamsBoard /> : <MemberTeams user={user} profile={profile} />;
}

/** Where the member is on the path, one step at a time; the last step names their team once they have one. */
function Path({ at, team }: { at: number; team?: string }) {
  return (
    <ol className="d-tracker d-tracker-four" aria-label="Software Teams steps">
      {STEPS.map((label, i) => (
        <li key={label} className={i < at ? "done" : i === at ? "current" : undefined} aria-current={i === at ? "step" : undefined}>
          {i === 3 && team ? team : label}
        </li>
      ))}
    </ol>
  );
}

function MemberTeams({ user, profile }: { user: SessionUser; profile: Profile | null }) {
  const [team, setTeam] = useState<MyTeam | null>(() => peek<MyTeam>("/api/teams/mine") ?? null);
  const initial = loadDraft(user.id);
  const [mine, setMine] = useState<Mine[] | null>(() => peek<Mine[]>("/api/join/mine")?.filter((row) => row.track === "SOFTWARE_ENGINEER") ?? null);
  const [draft, setDraft] = useState<Draft>({
    ...initial,
    name: initial.name || profile?.name || user.name || "",
    major: initial.major || profile?.major || "",
    gradYear: initial.gradYear || (profile?.gradYear ? String(profile.gradYear) : ""),
  });
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [resumeFile, setResumeFile] = useState<string | null>(profile?.resumeFilename ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const uic = user.email.toLowerCase().endsWith("@uic.edu");
  const { name, major, gradYear, github, hours, picks, skills, why, resumeUrl } = draft;
  const needsInfo = mine?.find((item) => item.status === "NEEDS_INFO");
  const open = mine?.find((item) => ["PENDING", "INTERVIEW", "ACCEPTED"].includes(item.status));
  const declined = mine?.find((item) => item.status === "DECLINED");
  const reapplicationOpen = !declined || (
    declined.canReapply && (!declined.decidedAt || reapplyDate(declined.decidedAt) <= new Date())
  );

  const set = (patch: Partial<Draft>) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    try { localStorage.setItem(draftKey(user.id), JSON.stringify(next)); setSavedAt(new Date()); } catch {}
  };

  useEffect(() => {
    // No team yet (or an older backend without the route) reads the same: the path.
    api<MyTeam>("/api/teams/mine").then(setTeam).catch(() => setTeam({ team: null, github: null, mine: [], open: [] }));
  }, []);

  useEffect(() => {
    snoozeTeamsHint();
    api<Mine[]>("/api/join/mine").then((rows) => {
      const own = rows.filter((row) => row.track === "SOFTWARE_ENGINEER");
      if (own.length) retireTeamsHint();
      const editable = own.find((row) => row.status === "NEEDS_INFO");
      if (editable) setDraft(applicationDraft(editable));
      setMine(own);
    }).catch((cause: Error) => setError(cause.message));
  }, []);

  function toggle(value: string) {
    const ranked = picks.filter(Boolean);
    const next = ranked.includes(value) ? ranked.filter((p) => p !== value) : ranked.length < 3 ? [...ranked, value] : ranked;
    set({ picks: [...next, "", "", ""].slice(0, 3) });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!picks.some(Boolean)) {
      setError("Pick at least one project.");
      return;
    }
    if (!resumeUrl.trim() && !resumeFile) {
      setError("Upload a PDF on your profile or paste an https resume link.");
      return;
    }
    setBusy(true); setError(""); setSuccess("");
    const body = JSON.stringify({
      track: "SOFTWARE_ENGINEER", name: name.trim(), email: user.email, major: major.trim(),
      gradYear: Number(gradYear), why: why.trim(), github: github.trim(), hoursPerWeek: Number(hours),
      projects: picks.filter(Boolean), skills: skills.trim(), resumeUrl: resumeUrl.trim() || null,
    });
    try {
      const updated = needsInfo
        ? await api<Mine>(`/api/join/mine/${needsInfo.id}`, { method: "PATCH", body })
        : await api<{ id: string }>("/api/join", { method: "POST", body });
      try { localStorage.removeItem(draftKey(user.id)); } catch {}
      retireTeamsHint();
      const rows = await api<Mine[]>("/api/join/mine");
      setMine(rows.filter((row) => row.track === "SOFTWARE_ENGINEER"));
      setSuccess(needsInfo && "status" in updated && updated.status === "PENDING"
        ? "Application updated and returned to pending review." : "Application submitted for review.");
    } catch (cause) { setError((cause as Error).message); }
    finally { setBusy(false); }
  }

  const showForm = mine && !open && uic && (needsInfo || reapplicationOpen);
  const placed = team?.team ?? null;
  const at = placed || open?.status === "ACCEPTED" ? 3 : open?.status === "INTERVIEW" ? 2 : open || needsInfo ? 1 : 0;
  const loading = (!mine || !team) && !error;
  return <>
    <Heading title="Software Teams" description="Build real software with other members, one team per product." />
    {error && <p className="d-error" role="alert">{error}</p>}
    {success && <p className="d-success" role="status">{success}</p>}
    {loading && <p className="d-muted" role="status">Loading…</p>}
    {!loading && <Path at={at} team={placed ? label(placed) : undefined} />}

    {placed && team && <TeamHome team={placed} mine={team} />}

    {!placed && open?.status === "ACCEPTED" && <section className="d-panel d-now">
      <span className="d-now-label">Almost there</span>
      <h2>You&apos;re in. The board is picking your team.</h2>
      <p className="d-small">You&apos;ll get a notification as soon as you&apos;re placed, and your first-week steps will show up right here. You ranked {open.projects.map(label).join(" → ")}.</p>
    </section>}

    {!placed && open?.status === "INTERVIEW" && <MyApplication track="SOFTWARE_ENGINEER" path={false} />}

    {!placed && open?.status === "PENDING" && <section className="d-panel d-now">
      <span className="d-now-label">Nothing to do yet</span>
      <h2>The board is reading your application</h2>
      <p className="d-small">You&apos;ll get an email and a notification here when it moves. Meanwhile, see what your picks are building.</p>
      <div className="d-actions">{open.projects.map((p) => <a key={p} className="d-button secondary" href={teamPage(slug(p))} target="_blank" rel="noopener noreferrer">{label(p)} plan</a>)}</div>
      <p className="d-small d-muted">Sent {date(open.createdAt, { month: "long", day: "numeric" })} · {open.hoursPerWeek ?? "—"} hours a week</p>
    </section>}

    {showForm && !needsInfo && <section className="d-panel d-now">
      <span className="d-now-label">Do this now</span>
      <h2>Pick up to three projects you&apos;d want to build</h2>
      <p className="d-small">Tap them in order of preference, then fill in the rest. It takes about ten minutes. After you send it, the board reads it and you&apos;ll hear back here and by email.</p>
    </section>}

    {declined && !open && !needsInfo && <section className="d-panel d-application-decision">
      <div className="d-section-head"><h2>Previous application</h2><span className="d-badge declined">{STATUS.DECLINED}</span></div>
      <p>{declined.canReapply ? `You can apply again ${declined.decidedAt && reapplyDate(declined.decidedAt) > new Date() ? `on ${date(reapplyDate(declined.decidedAt).toISOString(), { month: "long", day: "numeric", year: "numeric" })}` : "now"}.` : "The board marked this role as unavailable for reapplication."}</p>
    </section>}

    {mine && !open && !uic && <section className="d-panel"><h2>Software Teams need a @uic.edu account</h2><p className="d-muted">You&apos;re signed in as {user.email}. Create an account with your UIC email to apply.</p></section>}

    {showForm && <form className={`d-panel d-form ${needsInfo ? "d-needs-info" : ""}`} onSubmit={submit}>
      <div className="d-section-head"><h2>{needsInfo ? "Update your application" : "Apply for the software role"}</h2><span className="d-muted">Applying as {user.email}</span></div>
      {needsInfo && <div className="d-review-note" role="note"><strong>The board needs a little more:</strong><p>{needsInfo.reviewNote}</p></div>}
      <fieldset className="d-team-picks">
        <legend>Projects, in order of preference (1 to 3)</legend>
        <div>
          {PROJECTS.map((project) => {
            const rank = picks.indexOf(project.value);
            const info = page(project.value);
            return (
              <button key={project.value} type="button" className="d-team-pick" aria-pressed={rank >= 0} onClick={() => toggle(project.value)}>
                <span className="d-team-pick-head"><strong>{project.label}</strong>{rank >= 0 && <span className="d-badge confirmed">{RANKS[rank]}</span>}</span>
                {info && <small>{info.line}</small>}
                {info && <small className="d-muted">You learn: {info.learn}{info.demo ? ` · Demo ${info.demo}` : ""}</small>}
              </button>
            );
          })}
        </div>
      </fieldset>
      <div className="d-form-grid">
        <label>Full name<input required maxLength={100} autoComplete="name" value={name} onChange={(event) => set({ name: event.target.value })} /></label>
        <label>Major<input required maxLength={100} value={major} onChange={(event) => set({ major: event.target.value })} /></label>
        <label>Graduation year<input type="number" inputMode="numeric" required min={1900} max={2100} placeholder="2028" value={gradYear} onChange={(event) => set({ gradYear: event.target.value })} /></label>
        <label>GitHub username<input required maxLength={100} autoCapitalize="none" spellCheck={false} placeholder="octocat" value={github} onChange={(event) => set({ github: event.target.value })} /></label>
        <label>Hours a week you can commit<input type="number" inputMode="numeric" required min={1} max={40} placeholder="4" value={hours} onChange={(event) => set({ hours: event.target.value })} /></label>
      </div>
      <label>Skills<textarea required minLength={3} rows={3} maxLength={500} placeholder="React, Python, computer vision, design…" value={skills} onChange={(event) => set({ skills: event.target.value })} /></label>
      <fieldset className="d-resume"><legend>Resume</legend><p className="d-small">Upload a PDF on <Link className="d-text-link" href="/dashboard/profile">your profile</Link>, or paste an https link. One is required.</p><ResumeUpload filename={resumeFile} onChange={setResumeFile} buttonClassName="d-button secondary" linkClassName="d-text-button" textClassName="d-small" /><label>Resume link (optional when a profile PDF is uploaded)<input type="url" inputMode="url" spellCheck={false} autoCapitalize="none" placeholder="https://drive.google.com/…" pattern="https://.*" value={resumeUrl} onChange={(event) => set({ resumeUrl: event.target.value })} /></label></fieldset>
      <label>Why do you want to join this team?<textarea required minLength={40} rows={4} maxLength={2000} value={why} onChange={(event) => set({ why: event.target.value })} /><small>40–2,000 characters</small></label>
      <div className="d-actions">{savedAt && <span className="d-small" role="status">Draft saved {savedAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>}<button type="submit" className="d-button" disabled={busy}>{busy ? "Saving…" : needsInfo ? "Submit updates" : "Submit application"}</button></div>
    </form>}
  </>;
}

/** A placed member's home: first-week steps, then their tasks and the team's open ones (GitHub issues). */
function TeamHome({ team, mine }: { team: Team; mine: MyTeam }) {
  const info = page(team);
  const discord = process.env.NEXT_PUBLIC_DISCORD_URL;
  const tasks = (list: Task[], empty: string) => list.length
    ? <ul className="d-task-list">{list.map((t) => <li key={t.url}><a href={t.url} target="_blank" rel="noopener noreferrer"><span className="d-muted">{t.repo}#{t.number}</span> {t.title}</a></li>)}</ul>
    : <p className="d-small d-muted">{empty}</p>;
  return <>
    <section className="d-panel d-now">
      <span className="d-now-label">Your first week</span>
      <h2>You&apos;re on the {label(team)} team</h2>
      {info?.demo && <p className="d-small">Next demo day: {info.demo}.</p>}
      <ol className="d-first-week">
        <li><strong>Accept your GitHub invite to uic-logica</strong><small>{mine.github ? <>An exec sends it to <b>@{mine.github}</b>. <a className="d-text-link" href="https://github.com/orgs/uic-logica/invitation" target="_blank" rel="noopener noreferrer">Open the invite</a></> : <>Send the board your GitHub username in <Link className="d-text-link" href="/dashboard/messages">Messages</Link> so they can invite you.</>}</small></li>
        <li><strong>Join your team&apos;s standup</strong><small>Every 2 days, 15 minutes{discord ? <>, on <a className="d-text-link" href={discord} target="_blank" rel="noreferrer">Discord</a></> : " on Discord"}: what you did, what&apos;s next, what&apos;s blocking you.</small></li>
        <li><strong>Read your team&apos;s plan</strong><small><a className="d-text-link" href={teamPage(slug(team))} target="_blank" rel="noopener noreferrer">Milestones, design doc and demos on GitHub</a></small></li>
        <li><strong>Take your first task</strong><small>Issue → branch → pull request → review. <a className="d-text-link" href={CONTRIBUTING} target="_blank" rel="noopener noreferrer">How we work</a></small></li>
      </ol>
    </section>

    <section className="d-panel d-teams-inline" aria-labelledby="team-tasks">
      <div className="d-section-head"><h2 id="team-tasks">Your tasks</h2><a className="d-text-link" href={teamIssues(team)} target="_blank" rel="noopener noreferrer">All {label(team)} tasks</a></div>
      {mine.mine === null || mine.open === null
        ? <p className="d-small">GitHub didn&apos;t answer just now. <a className="d-text-link" href={teamIssues(team)} target="_blank" rel="noopener noreferrer">See your team&apos;s tasks on GitHub</a>.</p>
        : <>
          {tasks(mine.mine, mine.github ? "Nothing assigned to you yet. Take one below." : "Once the board has your GitHub username, tasks assigned to you show up here.")}
          <h3 className="d-subhead">Up for grabs</h3>
          {tasks(mine.open, "No open tasks right now. Ask in your standup what's next.")}
          {mine.open.length > 0 && <p className="d-small d-muted">To take one, assign yourself on GitHub or comment that you&apos;re on it.</p>}
        </>}
    </section>
  </>;
}

type Board = {
  members: { id: string; name: string | null; email: string; github: string | null; team: Team; openTasks: number | null }[];
  unplaced: { userId: string; name: string; email: string; projects: Team[]; hoursPerWeek: number | null }[];
  upForGrabs: Record<Team, number> | null;
};

/** Exec view: who's on which team, who's accepted but not placed, and who has nothing to work on. */
function TeamsBoard() {
  const [board, setBoard] = useState<Board | null>(() => peek<Board>("/api/board/teams") ?? null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const load = () => api<Board>("/api/board/teams").then(setBoard).catch((e: Error) => setError(e.message));
  useEffect(() => { void load(); }, []);

  async function place(userId: string, team: string) {
    setBusy(userId);
    setError("");
    try {
      await api(`/api/board/teams/${userId}`, { method: "PUT", body: JSON.stringify({ team: team || null }) });
      await load();
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(""); }
  }

  const picker = (userId: string, value: string, name: string) => (
    <select aria-label={`Team for ${name}`} value={value} disabled={busy === userId} onChange={(e) => place(userId, e.target.value)}>
      <option value="">{value ? "Take off team" : "Place on…"}</option>
      {PROJECTS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
    </select>
  );

  return <>
    <Heading title="Software Teams" description="Who's building what. Place accepted applicants on a team and they get their first-week steps." />
    {error && <p className="d-error" role="alert">{error}</p>}
    {!board && !error && <p className="d-muted" role="status">Loading…</p>}
    {board && !board.members.length && !board.unplaced.length && (
      <Empty title="Nobody on a team yet">Accept a Software Teams application and pick a team, or place them here afterwards.</Empty>
    )}
    {board && (board.members.length > 0 || board.unplaced.length > 0) && (
      <div className="d-kanban d-team-board" tabIndex={0} role="region" aria-label="Software Teams by team">
        <section aria-labelledby="team-unplaced" className="d-team-unplaced">
          <h3 id="team-unplaced"><span className="d-badge pending">Not placed</span><span>{board.unplaced.length}</span></h3>
          <ul>{board.unplaced.map((a) => (
            <li key={a.userId} className="d-kanban-card">
              <strong>{a.name}</strong>
              <small>{a.projects.length ? `1st: ${label(a.projects[0])}` : "No picks"}{a.hoursPerWeek ? ` · ${a.hoursPerWeek} h/wk` : ""}</small>
              {picker(a.userId, "", a.name)}
            </li>
          ))}</ul>
        </section>
        {PROJECTS.map((p) => {
          const people = board.members.filter((m) => m.team === p.value);
          return (
            <section key={p.value} aria-labelledby={`team-${p.value}`}>
              <h3 id={`team-${p.value}`}><span>{p.label}</span><span>{people.length}</span></h3>
              {board.upForGrabs && <p className="d-small d-muted"><a className="d-text-link" href={teamIssues(p.value)} target="_blank" rel="noopener noreferrer">{board.upForGrabs[p.value]} up for grabs</a></p>}
              <ul>{people.map((m) => (
                <li key={m.id} className="d-kanban-card">
                  <strong>{m.name || m.email}</strong>
                  <small className={m.openTasks === 0 ? "d-overdue" : undefined}>
                    {m.openTasks === null ? (m.github ? `@${m.github}` : "No GitHub yet") : m.openTasks ? `${m.openTasks} task${m.openTasks === 1 ? "" : "s"} open` : "No open task"}
                  </small>
                  {picker(m.id, m.team, m.name || m.email)}
                </li>
              ))}</ul>
            </section>
          );
        })}
      </div>
    )}
  </>;
}
