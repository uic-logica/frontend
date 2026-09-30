"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ResumeUpload } from "@/components/shell/ResumeUpload";
import { api } from "@/lib/api";
import { Heading } from "./Overview";
import { type Profile, type SessionUser, date } from "./types";

const PROJECTS = [
  { value: "OPPORTUNITY_BOARD", label: "Opportunity board" },
  { value: "RESUME_BUILDER", label: "Resume builder for each role" },
  { value: "EVENT_REPLAYS", label: "Event replays in 3D" },
  { value: "MOCK_INTERVIEWER", label: "Mock interviewer" },
] as const;
const RANKS = ["1st choice", "2nd choice", "3rd choice"];
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
  const initial = loadDraft(user.id);
  const [mine, setMine] = useState<Mine[] | null>(null);
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
    snoozeTeamsHint();
    api<Mine[]>("/api/join/mine").then((rows) => {
      const own = rows.filter((row) => row.track === "SOFTWARE_ENGINEER");
      if (own.length) retireTeamsHint();
      const editable = own.find((row) => row.status === "NEEDS_INFO");
      if (editable) setDraft(applicationDraft(editable));
      setMine(own);
    }).catch((cause: Error) => setError(cause.message));
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
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
  return <>
    <Heading title="Software Teams" description="Find a project with the right problem, people, and pace for you." />
    {error && <p className="d-error" role="alert">{error}</p>}
    {success && <p className="d-success" role="status">{success}</p>}
    {!mine && !error && <p className="d-muted" role="status">Loading…</p>}

    {open && <section className="d-panel d-speaker-detail" aria-labelledby="team-app-title">
      <div className="d-section-head"><h2 id="team-app-title">Your application</h2><span className={`d-badge ${open.status === "ACCEPTED" ? "confirmed" : "pending"}`}>{STATUS[open.status]}</span></div>
      <dl><div><dt>Projects, ranked</dt><dd>{open.projects.map(label).join(" → ")}</dd></div><div><dt>Hours a week</dt><dd>{open.hoursPerWeek ?? "—"}</dd></div><div><dt>Applied</dt><dd>{date(open.createdAt, { month: "long", day: "numeric", year: "numeric" })}</dd></div></dl>
    </section>}

    {declined && !open && !needsInfo && <section className="d-panel d-application-decision">
      <div className="d-section-head"><h2>Previous application</h2><span className="d-badge declined">{STATUS.DECLINED}</span></div>
      <p>{declined.canReapply ? `You can apply again ${declined.decidedAt && reapplyDate(declined.decidedAt) > new Date() ? `on ${date(reapplyDate(declined.decidedAt).toISOString(), { month: "long", day: "numeric", year: "numeric" })}` : "now"}.` : "The board marked this role as unavailable for reapplication."}</p>
    </section>}

    {mine && !open && !uic && <section className="d-panel"><h2>Software Teams need a @uic.edu account</h2><p className="d-muted">You&apos;re signed in as {user.email}. Create an account with your UIC email to apply.</p></section>}

    {showForm && <form className={`d-panel d-form ${needsInfo ? "d-needs-info" : ""}`} onSubmit={submit}>
      <div className="d-section-head"><h2>{needsInfo ? "Update your application" : "Apply for the software role"}</h2><span className="d-muted">Applying as {user.email}</span></div>
      {needsInfo && <div className="d-review-note" role="note"><strong>The board needs a little more:</strong><p>{needsInfo.reviewNote}</p></div>}
      <div className="d-form-grid">
        <label>Full name<input required maxLength={100} autoComplete="name" value={name} onChange={(event) => set({ name: event.target.value })} /></label>
        <label>Major<input required maxLength={100} value={major} onChange={(event) => set({ major: event.target.value })} /></label>
        <label>Graduation year<input type="number" inputMode="numeric" required min={1900} max={2100} placeholder="2028" value={gradYear} onChange={(event) => set({ gradYear: event.target.value })} /></label>
        <label>GitHub username<input required maxLength={100} autoCapitalize="none" spellCheck={false} placeholder="octocat" value={github} onChange={(event) => set({ github: event.target.value })} /></label>
        <label>Hours a week you can commit<input type="number" inputMode="numeric" required min={1} max={40} placeholder="4" value={hours} onChange={(event) => set({ hours: event.target.value })} /></label>
        {RANKS.map((rank, index) => <label key={rank}>{rank}{index > 0 && " (optional)"}<select required={index === 0} value={picks[index]} onChange={(event) => set({ picks: picks.map((pick, pickIndex) => pickIndex === index ? event.target.value : pick) })}><option value="">{index === 0 ? "Pick a project" : "None"}</option>{PROJECTS.filter((project) => project.value === picks[index] || !picks.includes(project.value)).map((project) => <option key={project.value} value={project.value}>{project.label}</option>)}</select></label>)}
      </div>
      <label>Skills<textarea required minLength={3} rows={3} maxLength={500} placeholder="React, Python, computer vision, design…" value={skills} onChange={(event) => set({ skills: event.target.value })} /></label>
      <fieldset className="d-resume"><legend>Resume</legend><p className="d-small">Upload a PDF on <Link className="d-text-link" href="/dashboard/profile">your profile</Link>, or paste an https link. One is required.</p><ResumeUpload filename={resumeFile} onChange={setResumeFile} buttonClassName="d-button secondary" linkClassName="d-text-button" textClassName="d-small" /><label>Resume link (optional when a profile PDF is uploaded)<input type="url" inputMode="url" spellCheck={false} autoCapitalize="none" placeholder="https://drive.google.com/…" pattern="https://.*" value={resumeUrl} onChange={(event) => set({ resumeUrl: event.target.value })} /></label></fieldset>
      <label>Why do you want to join this team?<textarea required minLength={40} rows={4} maxLength={2000} value={why} onChange={(event) => set({ why: event.target.value })} /><small>40–2,000 characters</small></label>
      <div className="d-actions">{savedAt && <span className="d-small" role="status">Draft saved {savedAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>}<button type="submit" className="d-button" disabled={busy}>{busy ? "Saving…" : needsInfo ? "Submit updates" : "Submit application"}</button></div>
    </form>}
  </>;
}
