"use client";

import { useEffect, useState } from "react";
import { ResumeUpload } from "@/components/shell/ResumeUpload";
import { api } from "@/lib/api";
import { Heading } from "./Overview";
import { type Profile, type SessionUser, date } from "./types";

/** Matches `PROJECTS` in the backend. Order in `projects` is the applicant's ranking. */
const PROJECTS = [
  { value: "OPPORTUNITY_BOARD", label: "Opportunity board" },
  { value: "RESUME_BUILDER", label: "Resume builder for each role" },
  { value: "EVENT_REPLAYS", label: "Event replays in 3D" },
  { value: "MOCK_INTERVIEWER", label: "Mock interviewer" },
] as const;
const RANKS = ["1st choice", "2nd choice", "3rd choice"];
const STATUS = {
  PENDING: "Received — under review",
  INTERVIEW: "Interview — check your email",
  ACCEPTED: "Accepted — you're on a team",
  DECLINED: "Not this round",
};

type Mine = {
  id: string;
  track: string;
  status: keyof typeof STATUS;
  projects: string[];
  hoursPerWeek: number | null;
  createdAt: string;
};

/**
 * The sidebar pointer to this section. × or opening the section snoozes it
 * for a week; having applied hides it for good. Per browser — it's a nudge,
 * not a record, so localStorage is enough.
 */
const HINT = "logica.softwareTeamsHint";
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;
export function teamsHintHidden(): boolean {
  try {
    const value = localStorage.getItem(HINT);
    return value === "applied" || Number(value) > Date.now();
  } catch {
    return true;
  }
}
export function snoozeTeamsHint() {
  try {
    if (localStorage.getItem(HINT) !== "applied") localStorage.setItem(HINT, String(Date.now() + SNOOZE_MS));
  } catch {}
}
export function retireTeamsHint() {
  try {
    localStorage.setItem(HINT, "applied");
  } catch {}
}

const label = (value: string) => PROJECTS.find((p) => p.value === value)?.label ?? value;

/** Software Team applications live here, behind sign-in, so every one is tied to a @uic.edu account. */
type Draft = { github: string; hours: string; picks: string[]; skills: string; why: string; resumeUrl: string };
const EMPTY: Draft = { github: "", hours: "", picks: ["", "", ""], skills: "", why: "", resumeUrl: "" };

/**
 * The application saves as a draft while they type, per account, in this
 * browser. ponytail: localStorage, not a server draft — switching devices
 * starts over. Add a draft row on the backend if that turns out to matter.
 */
const draftKey = (userId: string) => `logica.softwareTeamsDraft.${userId}`;
function loadDraft(userId: string): Draft {
  try {
    return { ...EMPTY, ...JSON.parse(localStorage.getItem(draftKey(userId)) ?? "{}") };
  } catch {
    return EMPTY;
  }
}

export function BuildTeams({ user, profile }: { user: SessionUser; profile: Profile | null }) {
  const [mine, setMine] = useState<Mine[] | null>(null);
  // Only rendered client-side once the session has loaded, so localStorage is available here.
  const [draft, setDraft] = useState<Draft>(() => loadDraft(user.id));
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [resumeFile, setResumeFile] = useState<string | null>(profile?.resumeFilename ?? null);
  const { github, hours, picks, skills, why, resumeUrl } = draft;
  const set = (patch: Partial<Draft>) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    try {
      localStorage.setItem(draftKey(user.id), JSON.stringify(next));
      setSavedAt(new Date());
    } catch {}
  };
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const uic = user.email.toLowerCase().endsWith("@uic.edu");

  useEffect(() => {
    snoozeTeamsHint();
    api<Mine[]>("/api/join/mine")
      .then((rows) => {
        const own = rows.filter((r) => r.track === "SOFTWARE_ENGINEER");
        if (own.length) retireTeamsHint();
        setMine(own);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/join", {
        method: "POST",
        body: JSON.stringify({
          track: "SOFTWARE_ENGINEER",
          name: profile?.name || user.name || "",
          email: user.email,
          major: profile?.major || null,
          gradYear: profile?.gradYear ?? null,
          why: why.trim(),
          github: github.trim(),
          hoursPerWeek: Number(hours),
          projects: picks.filter(Boolean),
          skills: skills.trim() || null,
          resumeUrl: resumeUrl.trim() || null,
        }),
      });
      try {
        localStorage.removeItem(draftKey(user.id));
      } catch {}
      retireTeamsHint();
      setMine(await api<Mine[]>("/api/join/mine").then((rows) => rows.filter((r) => r.track === "SOFTWARE_ENGINEER")));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const open = mine?.find((m) => m.status === "PENDING" || m.status === "INTERVIEW" || m.status === "ACCEPTED");

  return (
    <>
      <Heading
        title="Software Teams"
        description="Find a project with the right problem, people, and pace for you."
      />
      {error && <p className="d-error" role="alert">{error}</p>}
      {!mine && !error && <p className="d-muted" role="status">Loading…</p>}

      {mine && open && (
        <section className="d-panel d-speaker-detail" aria-labelledby="team-app-title">
          <div className="d-section-head">
            <h2 id="team-app-title">Your application</h2>
            <span className={`d-badge ${open.status === "ACCEPTED" ? "confirmed" : "pending"}`}>{STATUS[open.status]}</span>
          </div>
          <dl>
            <div><dt>Projects, ranked</dt><dd>{open.projects.map(label).join(" → ")}</dd></div>
            <div><dt>Hours a week</dt><dd>{open.hoursPerWeek ?? "—"}</dd></div>
            <div><dt>Applied</dt><dd>{date(open.createdAt, { month: "long", day: "numeric", year: "numeric" })}</dd></div>
          </dl>
        </section>
      )}

      {mine && !open && !uic && (
        <section className="d-panel">
          <h2>Software Teams need a @uic.edu account</h2>
          <p className="d-muted">You&apos;re signed in as {user.email}. Create an account with your UIC email to apply.</p>
        </section>
      )}

      {mine && !open && uic && (
        <form className="d-panel d-form" onSubmit={submit}>
          <div className="d-section-head">
            <h2>Apply for the software role</h2>
            <span className="d-muted">Applying as {user.email}</span>
          </div>
          <div className="d-form-grid">
            <label>
              GitHub username
              <input required maxLength={100} autoCapitalize="none" spellCheck={false} placeholder="octocat" value={github} onChange={(e) => set({ github: e.target.value })} />
            </label>
            <label>
              Hours a week you can commit (an estimate)
              <input type="number" inputMode="numeric" required min={1} max={40} placeholder="4" value={hours} onChange={(e) => set({ hours: e.target.value })} />
            </label>
            {RANKS.map((rank, i) => (
              <label key={rank}>
                {rank}{i > 0 && " (optional)"}
                <select
                  required={i === 0}
                  value={picks[i]}
                  onChange={(e) => set({ picks: picks.map((p, j) => (j === i ? e.target.value : p)) })}
                >
                  <option value="">{i === 0 ? "Pick a project" : "None"}</option>
                  {PROJECTS.filter((p) => p.value === picks[i] || !picks.includes(p.value)).map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <label>
            Skills (optional)
            <textarea rows={3} maxLength={500} placeholder="React, Python, computer vision, design…" value={skills} onChange={(e) => set({ skills: e.target.value })} />
          </label>
          <fieldset className="d-resume">
            <legend>Resume (optional)</legend>
            <p className="d-small">Upload a PDF to your profile, or paste a link. The board sees either one.</p>
            <ResumeUpload
              filename={resumeFile}
              onChange={setResumeFile}
              buttonClassName="d-button secondary"
              linkClassName="d-text-button"
              textClassName="d-small"
            />
            <label>
              Or a link to your resume
              <input
                type="url"
                inputMode="url"
                spellCheck={false}
                autoCapitalize="none"
                placeholder="https://drive.google.com/…"
                pattern="https://.*"
                value={resumeUrl}
                onChange={(e) => set({ resumeUrl: e.target.value })}
              />
            </label>
          </fieldset>
          <label>
            Why are you special? (optional)
            <textarea rows={4} maxLength={2000} value={why} onChange={(e) => set({ why: e.target.value })} />
          </label>
          <div className="d-actions">
            {savedAt && (
              <span className="d-small" role="status">
                Draft saved {savedAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              </span>
            )}
            <button type="submit" className="d-button" disabled={busy}>{busy ? "Sending…" : "Submit application"}</button>
          </div>
        </form>
      )}
    </>
  );
}
