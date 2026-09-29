"use client";

import { useEffect, useState } from "react";
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

const label = (value: string) => PROJECTS.find((p) => p.value === value)?.label ?? value;

/** Build-team applications live here, behind sign-in, so every one is tied to a @uic.edu account. */
export function BuildTeams({ user, profile }: { user: SessionUser; profile: Profile | null }) {
  const [mine, setMine] = useState<Mine[] | null>(null);
  const [github, setGithub] = useState("");
  const [hours, setHours] = useState("");
  const [picks, setPicks] = useState(["", "", ""]);
  const [skills, setSkills] = useState("");
  const [why, setWhy] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const uic = user.email.toLowerCase().endsWith("@uic.edu");

  useEffect(() => {
    api<Mine[]>("/api/join/mine")
      .then((rows) => setMine(rows.filter((r) => r.track === "SOFTWARE_ENGINEER")))
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
        }),
      });
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
        title="Build teams"
        description="Build open-source products that help students get hired. Apply once; we review your work, email you and set up a short interview."
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
          <h2>Build teams need a @uic.edu account</h2>
          <p className="d-muted">You&apos;re signed in as {user.email}. Create an account with your UIC email to apply.</p>
        </section>
      )}

      {mine && !open && uic && (
        <form className="d-panel d-form" onSubmit={submit}>
          <div className="d-section-head">
            <h2>Apply to a build team</h2>
            <span className="d-muted">Applying as {user.email}</span>
          </div>
          <div className="d-form-grid">
            <label>
              GitHub username
              <input required maxLength={100} autoCapitalize="none" spellCheck={false} placeholder="octocat" value={github} onChange={(e) => setGithub(e.target.value)} />
            </label>
            <label>
              Hours a week you can commit
              <input type="number" inputMode="numeric" required min={1} max={40} placeholder="4" value={hours} onChange={(e) => setHours(e.target.value)} />
            </label>
            {RANKS.map((rank, i) => (
              <label key={rank}>
                {rank}{i > 0 && " (optional)"}
                <select
                  required={i === 0}
                  value={picks[i]}
                  onChange={(e) => setPicks(picks.map((p, j) => (j === i ? e.target.value : p)))}
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
            <textarea rows={3} maxLength={500} placeholder="React, Python, computer vision, design…" value={skills} onChange={(e) => setSkills(e.target.value)} />
          </label>
          <label>
            Why do you want to build with LOGICA?
            <textarea required rows={4} maxLength={2000} value={why} onChange={(e) => setWhy(e.target.value)} />
          </label>
          <div className="d-actions">
            <button type="submit" className="d-button" disabled={busy}>{busy ? "Sending…" : "Submit application"}</button>
          </div>
        </form>
      )}
    </>
  );
}
