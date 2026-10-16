"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useSignedIn } from "@/components/club/ClubShell";
import { SiteIcon } from "@/components/site/icons";
import { ApiError, api } from "@/lib/api";

/** Matches `TRACKS` in the backend's lib/membership-application.ts. */
const TRACKS = [
  { value: "SOFTWARE_ENGINEER", label: "Software Engineer" },
  { value: "BOARD_MEMBER", label: "Board Member" },
] as const;

/** Signed out: make an account first. Signed in: skip straight to the application. */
export function JoinActions() {
  const signedIn = useSignedIn();
  return (
    <div className="join-actions">
      {signedIn ? (
        <a href="#apply" className="site-btn">Apply</a>
      ) : (
        <Link href="/signup" className="site-btn">Create your account</Link>
      )}
      <Link href="/events" className="site-btn secondary">Attend an event first</Link>
    </div>
  );
}

export function JoinForm() {
  const id = useId();
  const [track, setTrack] = useState<string>("SOFTWARE_ENGINEER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [major, setMajor] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [why, setWhy] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  // Build teams apply from the dashboard, so every application has an account behind it.
  const signedIn = useSignedIn();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/join", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          track,
          major: major.trim(),
          gradYear: Number(gradYear),
          why: why.trim(),
        }),
      });
      setDone(true);
    } catch (err) {
      // 409 is the friendly one: they already applied to this track.
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Try again, or email logica@uic.edu.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="site-card join-form" role="status">
        <h2 className="serif">Application received</h2>
        <p className="site-muted">
          The board can see it now. You&apos;ll hear back by email at <strong>{email}</strong>.
        </p>
        <Link href="/events" className="site-link">Come to an event while you wait <SiteIcon name="arrow" /></Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="site-card join-form site-form">
      <h2 className="serif">Apply to join</h2>
      <p className="site-muted">Rolling basis, so there&apos;s no deadline to miss.</p>

      {error && <p className="site-error" role="alert">{error}</p>}

      <label className="site-field" htmlFor={`${id}-track`}>
        <span>Which track?</span>
        <select id={`${id}-track`} value={track} onChange={(e) => setTrack(e.target.value)}>
          {TRACKS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </label>

      {track === "SOFTWARE_ENGINEER" ? (
        <>
          <p className="site-muted">
            Software Team applications happen in your dashboard, under Software Teams. You need an account with your
            @uic.edu email, then you tell us your GitHub, hours a week and which projects you want.
          </p>
          <Link href={signedIn ? "/dashboard/teams" : "/signup?next=/dashboard/teams"} className="site-btn block">
            {signedIn ? "Apply in your dashboard" : "Create an account to apply"}
          </Link>
          {!signedIn && (
            <p className="site-hint">
              Already have one? <Link href="/signin?next=/dashboard/teams">Sign in</Link>
            </p>
          )}
        </>
      ) : (
        <>
          <label className="site-field" htmlFor={`${id}-name`}>
            <span>Full name</span>
            <input id={`${id}-name`} required maxLength={100} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="site-field" htmlFor={`${id}-email`}>
            <span>UIC email</span>
            <input
              id={`${id}-email`}
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="netid@uic.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <div className="site-form-row">
            <label className="site-field" htmlFor={`${id}-major`}>
              <span>Major</span>
              <input id={`${id}-major`} required maxLength={100} value={major} onChange={(e) => setMajor(e.target.value)} />
            </label>
            <label className="site-field" htmlFor={`${id}-year`}>
              <span>Graduation year</span>
              <input
                id={`${id}-year`}
                type="number"
                required
                inputMode="numeric"
                min={1900}
                max={2100}
                placeholder="2028"
                value={gradYear}
                onChange={(e) => setGradYear(e.target.value)}
              />
            </label>
          </div>
          <label className="site-field" htmlFor={`${id}-why`}>
            <span>Why LOGICA?</span>
            <textarea id={`${id}-why`} required minLength={40} rows={5} maxLength={2000} value={why} onChange={(e) => setWhy(e.target.value)} />
            <small>At least 40 characters. No prior experience needed; say what you want to get out of it.</small>
          </label>
          <button type="submit" disabled={busy} className="site-btn block">
            {busy ? "Sending…" : "Submit application"}
          </button>
        </>
      )}
    </form>
  );
}
