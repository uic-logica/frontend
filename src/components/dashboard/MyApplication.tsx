"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, peek } from "@/lib/api";
import { AvailabilityGrid } from "./AvailabilityGrid";
import { type Application, type Window, date } from "./types";

type Mine = Pick<
  Application,
  "id" | "track" | "status" | "reviewNote" | "canReapply" | "decidedAt" | "createdAt" | "interviewAvailability" | "interviewAvailabilityAt"
>;

const TRACK: Record<Application["track"], string> = {
  GENERAL: "membership",
  SOFTWARE_ENGINEER: "Software Teams",
  MENTORSHIP: "mentorship",
  BOARD_MEMBER: "board member",
};
const STEPS = ["Applied", "Interview", "Decision"] as const;
// A decision stays on the home page this long, then the card steps aside.
const DECIDED_DAYS = 30;

function stepOf(status: Application["status"]) {
  if (status === "INTERVIEW") return 1;
  if (status === "ACCEPTED" || status === "DECLINED") return 2;
  return 0;
}

const when = (iso: string) => date(iso, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

/** The signed-in person's applications, newest first. Identical GETs in flight share one request. */
function useMine() {
  const [mine, setMine] = useState<Mine[] | null>(() => peek<Mine[]>("/api/join/mine") ?? null);
  useEffect(() => {
    let alive = true;
    api<Mine[]>("/api/join/mine")
      .then((rows) => alive && setMine(rows))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return [mine, setMine] as const;
}

/** A "For you" row for a member who hasn't applied to anything yet. */
export function ApplyNudge() {
  const [mine] = useMine();
  if (!mine || mine.length) return null;
  return (
    <Link className="d-compact-row" href="/join#apply">
      <span className="d-live-dot" />
      <span>
        <strong>Apply to a team</strong>
        <small>Software Teams, mentorship or the board.</small>
      </span>
      <span className="d-badge">Apply</span>
    </Link>
  );
}

/**
 * The applicant's place in line, on their own home: where the application
 * stands and the one thing they can do about it. At Interview that's the
 * week grid, the same save as the emailed link, so losing the email
 * doesn't lose the way in. Nothing to show without an application.
 */
export function MyApplication() {
  const [mine, setMine] = useMine();
  const [windows, setWindows] = useState<Window[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [now] = useState(() => Date.now());

  const app = mine?.[0];
  if (!app) return null;
  const decided = app.decidedAt && now - new Date(app.decidedAt).getTime() > DECIDED_DAYS * 864e5;
  if (decided) return null;

  const id = app.id;
  const step = stepOf(app.status);
  const shared = app.interviewAvailability ?? [];
  const picking = app.status === "INTERVIEW" && (windows !== null || !shared.length);

  async function save() {
    if (!windows?.length) return;
    setBusy(true);
    setError("");
    try {
      const res = await api<{ availability: Window[]; savedAt: string }>(`/api/join/mine/${id}`, {
        method: "PUT",
        body: JSON.stringify({ availability: windows }),
      });
      setMine((rows) => rows?.map((r) => (r.id === id ? { ...r, interviewAvailability: res.availability, interviewAvailabilityAt: res.savedAt } : r)) ?? rows);
      setWindows(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="d-panel d-my-application" aria-labelledby="my-application">
      <div className="d-section-head">
        <h2 id="my-application">Your {TRACK[app.track]} application</h2>
        <span className="d-muted">Sent {date(app.createdAt)}</span>
      </div>

      <ol className="d-tracker">
        {STEPS.map((label, i) => (
          <li key={label} className={i < step ? "done" : i === step ? "current" : undefined} aria-current={i === step ? "step" : undefined}>
            {i === 2 && app.status === "ACCEPTED" ? "Accepted" : i === 2 && app.status === "DECLINED" ? "Decided" : label}
          </li>
        ))}
      </ol>

      {app.status === "PENDING" && (
        <p className="d-small">The board is reading your application. You&apos;ll get an email and a notification here when it moves.</p>
      )}

      {app.status === "NEEDS_INFO" && (
        <>
          <p className="d-small">The board needs a bit more: {app.reviewNote}</p>
          <div className="d-availability-footer">
            {app.track === "SOFTWARE_ENGINEER" ? (
              <Link className="d-button" href="/dashboard/teams">Update your application</Link>
            ) : (
              <Link className="d-button" href="/dashboard/messages">Reply to the board</Link>
            )}
          </div>
        </>
      )}

      {app.status === "INTERVIEW" &&
        (picking ? (
          <>
            <p className="d-small">
              The board would like to talk with you. Drag across every time you could meet (Chicago time). The more you mark, the easier it is to find a slot.
            </p>
            <AvailabilityGrid windows={windows ?? shared} onChange={setWindows} />
            {error && <p className="d-error" role="alert">{error}</p>}
            <div className="d-availability-footer">
              <button className="d-button" disabled={busy || !windows?.length} onClick={save}>
                {busy ? "Saving…" : shared.length ? "Update my times" : "Share my times"}
              </button>
              {shared.length > 0 && (
                <button type="button" className="d-text-button" onClick={() => { setWindows(null); setError(""); }}>
                  Cancel
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <p className="d-small">
              You shared {shared.length} time{shared.length === 1 ? "" : "s"}
              {app.interviewAvailabilityAt ? ` on ${when(app.interviewAvailabilityAt)}` : ""}. The board will pick one and email you to set up the interview.
            </p>
            <div className="d-availability-footer">
              <button type="button" className="d-button secondary" onClick={() => setWindows(shared)}>
                Change my times
              </button>
              <Link className="d-button secondary" href="/dashboard/messages">Message the board</Link>
            </div>
          </>
        ))}

      {app.status === "ACCEPTED" && <p className="d-small">You&apos;re in. Watch Events and Messages for what comes next.</p>}

      {app.status === "DECLINED" && (
        <>
          <p className="d-small">{app.reviewNote || "The board couldn't offer you a spot this time."}</p>
          {app.canReapply && (
            <div className="d-availability-footer">
              <Link className="d-button secondary" href="/join#apply">Apply again</Link>
            </div>
          )}
        </>
      )}
    </section>
  );
}
