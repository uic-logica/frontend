"use client";
import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api";
import { AvailabilityGrid } from "./AvailabilityGrid";
import { Icon } from "./Icon";
import { Heading } from "./Overview";
import { type Profile, type SessionUser, type Window, date } from "./types";

const EMPTY: Window = {
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
};

function complete(w: Window) {
  return !!(w.startDate && w.endDate && w.startTime && w.endTime);
}

function readable(w: Window) {
  const day = (d: string) =>
    date(`${d}T12:00:00`, { month: "short", day: "numeric" });
  const clock = (t: string) =>
    new Date(`2000-01-01T${t}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  const span =
    w.startDate === w.endDate
      ? day(w.startDate)
      : `${day(w.startDate)} – ${day(w.endDate)}`;
  return `${span}, ${clock(w.startTime)} – ${clock(w.endTime)}`;
}

/**
 * A candidate's whole dashboard: when can you come in?
 *
 * The board creates the account and invites them, so there's no application
 * to chase and nothing to introduce — we already know who they are. One
 * task, on the page they land on, with the editor inline so there's nowhere
 * to navigate to. Everything else (talk, slides, numbers) appears only once
 * the board accepts them.
 */
export function CandidateHome({
  user,
  profile,
  onSaved,
}: {
  user: SessionUser;
  profile: Profile | null;
  onSaved: (p: Profile) => void;
}) {
  const submission = profile?.speakerSubmission;
  const saved = submission?.availability ?? [];
  const confirmedAt = submission?.availabilityConfirmedAt ?? null;
  const declined = submission?.status === "DECLINED";
  const first = (profile?.name || user.name || "there").split(" ")[0];

  const [editing, setEditing] = useState(false);
  const [windows, setWindows] = useState<Window[]>(
    saved.length ? saved : [EMPTY],
  );
  const [picker, setPicker] = useState<"grid" | "list">("grid");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const usable = windows.filter(complete);
  const backwards = usable.some(
    (w) => w.endDate < w.startDate || w.startTime >= w.endTime,
  );
  const open = editing || !confirmedAt;

  function edit(i: number, key: keyof Window, value: string) {
    setWindows((prev) =>
      prev.map((w, j) => (i === j ? { ...w, [key]: value } : w)),
    );
    setError("");
  }

  async function save(confirm: boolean) {
    if (backwards) {
      setError("Each window has to end after it starts.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const updated = await api<Profile>("/api/speaker-profile", {
        method: "PATCH",
        body: JSON.stringify({
          availability: usable,
          availabilityConfirmed: confirm,
        }),
      });
      onSaved(updated);
      setWindows(updated.speakerSubmission?.availability ?? [EMPTY]);
      setEditing(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (declined) {
    return (
      <>
        <Heading
          title={`Thanks, ${first}.`}
          description="We couldn't make this one work."
        />
        <section className="d-panel">
          <p>
            We’d still love to have you another semester — your thread with the
            board stays open.
          </p>
          <Link
            className="d-button secondary d-standalone"
            href="/dashboard/messages"
          >
            Message the board
          </Link>
        </section>
      </>
    );
  }

  return (
    <>
      <Heading
        title={`Hi, ${first}.`}
        description={
          confirmedAt
            ? "That's everything we need for now. We'll come back to you with a date."
            : "One thing to do: tell us when you could come in."
        }
      />

      <section className="d-panel d-availability">
        <div className="d-section-head">
          <h2>When are you free?</h2>
          {confirmedAt && !editing && (
            <span className="d-badge confirmed">
              Confirmed {date(confirmedAt)}
            </span>
          )}
        </div>

        {open ? (
          <>
            <p className="d-small">
              {picker === "grid"
                ? "Drag across every time that could work — the more you mark, the better the odds we find a date. Chicago time."
                : "Add every window that could work — the more options, the better the odds we find a date. Chicago time."}{" "}
              <button
                type="button"
                className="d-text-button"
                onClick={() => setPicker(picker === "grid" ? "list" : "grid")}
              >
                {picker === "grid"
                  ? "Type dates instead"
                  : "Use the calendar instead"}
              </button>
            </p>
            {picker === "grid" && (
              <AvailabilityGrid
                windows={usable}
                onChange={(next) => {
                  setWindows(next.length ? next : [EMPTY]);
                  setError("");
                }}
              />
            )}
            {picker === "list" && (
              <div className="d-window-list">
                {windows.map((w, i) => (
                  <div className="d-window-row" key={i}>
                    <label>
                      <span>From</span>
                      <input
                        type="date"
                        value={w.startDate}
                        onChange={(e) => edit(i, "startDate", e.target.value)}
                      />
                    </label>
                    <label>
                      <span>To</span>
                      <input
                        type="date"
                        value={w.endDate || w.startDate}
                        onChange={(e) => edit(i, "endDate", e.target.value)}
                      />
                    </label>
                    <label>
                      <span>Between</span>
                      <input
                        type="time"
                        value={w.startTime}
                        onChange={(e) => edit(i, "startTime", e.target.value)}
                      />
                    </label>
                    <label>
                      <span>and</span>
                      <input
                        type="time"
                        value={w.endTime}
                        onChange={(e) => edit(i, "endTime", e.target.value)}
                      />
                    </label>
                    <button
                      type="button"
                      className="d-window-remove"
                      aria-label={`Remove window ${i + 1}`}
                      disabled={windows.length === 1}
                      onClick={() =>
                        setWindows((prev) => prev.filter((_, j) => j !== i))
                      }
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {picker === "list" && (
              <button
                type="button"
                className="d-text-button d-standalone"
                onClick={() => setWindows((prev) => [...prev, EMPTY])}
              >
                + Add another window
              </button>
            )}

            {error && (
              <p className="d-error" role="alert">
                {error}
              </p>
            )}

            <div className="d-availability-footer">
              <button
                className="d-button"
                disabled={busy || !usable.length}
                onClick={() => save(true)}
              >
                {busy ? "Saving…" : "Confirm these times"}
              </button>
              <span className="d-small">
                {usable.length
                  ? "We'll only look at times you've confirmed."
                  : "Fill in one window to confirm."}
              </span>
              {editing && (
                <button
                  type="button"
                  className="d-text-button"
                  onClick={() => {
                    setWindows(saved.length ? saved : [EMPTY]);
                    setEditing(false);
                    setError("");
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <ul className="d-window-summary">
              {saved.map((w, i) => (
                <li key={i}>
                  <Icon name="events" />
                  {readable(w)}
                </li>
              ))}
            </ul>
            <p className="d-small">
              The board is checking these against the calendar. We’ll come back
              to you in your thread — if we can’t make one work, we’ll say so
              rather than leave you waiting.
            </p>
            <div className="d-availability-footer">
              <button
                type="button"
                className="d-button secondary"
                onClick={() => setEditing(true)}
              >
                Change these times
              </button>
              <Link className="d-button secondary" href="/dashboard/messages">
                Message the board
              </Link>
            </div>
          </>
        )}
      </section>
    </>
  );
}
