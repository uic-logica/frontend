"use client";

import "@/components/dashboard/dashboard.css";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { ClubShell } from "@/components/club/ClubShell";
import { AvailabilityGrid } from "@/components/dashboard/AvailabilityGrid";
import type { Window } from "@/components/dashboard/types";
import { ApiError, api } from "@/lib/api";

type Interview = { name: string; track: string; availability: Window[]; savedAt: string | null };
type State = { kind: "loading" } | { kind: "dead"; message: string } | { kind: "ready"; interview: Interview };

const ROLE: Record<string, string> = { SOFTWARE_ENGINEER: "Software Teams", BOARD_MEMBER: "board member" };
const saved = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

/**
 * The private link an applicant gets when the board moves them to
 * Interview: they mark the times they can meet, and the board picks one.
 * No account needed; the link works while the application is in Interview.
 */
export default function InterviewAvailabilityPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [state, setState] = useState<State>({ kind: "loading" });
  const [windows, setWindows] = useState<Window[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  useEffect(() => {
    api<Interview>(`/api/join/interview/${token}`)
      .then((interview) => {
        setState({ kind: "ready", interview });
        setWindows(interview.availability);
      })
      .catch((e: unknown) =>
        setState({ kind: "dead", message: e instanceof ApiError && e.status === 404 ? (e as Error).message : "This page didn't load. Try again in a minute." }),
      );
  }, [token]);

  async function save() {
    setBusy(true);
    setError("");
    setDone("");
    try {
      const res = await api<{ savedAt: string }>(`/api/join/interview/${token}`, { method: "PUT", body: JSON.stringify({ availability: windows }) });
      setDone(`Saved ${saved(res.savedAt)}. The board will reach out to set up your interview. You can come back to this link to change your times.`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ClubShell>
      <main className="site-page interview-page">
        {state.kind === "loading" && <p className="site-muted" role="status">Loading…</p>}
        {state.kind === "dead" && (
          <section className="site-card auth-card">
            <h1 className="serif">Link not active</h1>
            <p className="site-muted">{state.message}</p>
            <Link href="/" className="site-btn secondary">Go to logicauic.org</Link>
          </section>
        )}
        {state.kind === "ready" && (
          <>
            <header className="site-page-head">
              <p className="site-kicker">INTERVIEW</p>
              <h1 className="serif">When can you meet, {state.interview.name.split(" ")[0]}?</h1>
              <p>
                The board would like to talk with you about your {ROLE[state.interview.track] ?? "LOGICA"} application. Drag across the
                times that work for you (Chicago time). The more you mark, the easier it is to find a slot.
              </p>
            </header>
            <section className="site-card interview-card">
              <AvailabilityGrid windows={windows} onChange={setWindows} />
              {error && <p className="site-error" role="alert">{error}</p>}
              {done && <p className="site-success" role="status">{done}</p>}
              <div className="interview-actions">
                <button className="site-btn" disabled={busy || !windows.length} onClick={save}>
                  {busy ? "Saving…" : state.interview.savedAt || done ? "Update my times" : "Share my times"}
                </button>
                {state.interview.savedAt && !done && (
                  <small className="site-muted">Last shared {saved(state.interview.savedAt)}</small>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </ClubShell>
  );
}
