"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { darkButtonClass, darkInputClass } from "@/components/ui/darkForm";
import { ApiError, api } from "@/lib/api";

/** Matches `TRACKS` in the backend's lib/membership-application.ts. */
const TRACKS = [
  { value: "SOFTWARE_ENGINEER", label: "Software Engineer" },
  { value: "BOARD_MEMBER", label: "Board Member" },
] as const;

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
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    api<{ user?: unknown } | null>("/api/auth/session")
      .then((me) => setSignedIn(!!me?.user))
      .catch(() => {});
  }, []);

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
      <div className="club-card max-w-2xl p-8 md:p-12">
        <h2 className="type-h3 text-white">Application received</h2>
        <p className="mt-3 text-body text-white">
          The board can see it now. You&apos;ll hear back by email at{" "}
          <strong>{email}</strong>.
        </p>
        <p className="mt-4">
          <Link href="/events" className="font-semibold text-signal hover:underline">
            Come to an event while you wait →
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="club-card max-w-2xl p-8 md:p-12">
      <h2 className="type-h3 text-white">Apply to join</h2>
      <p className="mt-3 text-body text-white">
        Rolling basis — there is no deadline to miss.
      </p>

      {error && (
        <div
          className="rounded-lg mt-6 border-2 border-signal bg-signal/10 px-4 py-3 text-body-sm text-white"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-5">
        <div className="grid gap-2">
          <label htmlFor={`${id}-track`} className="type-label text-white">
            Which track?
          </label>
          <select
            id={`${id}-track`}
            value={track}
            onChange={(e) => setTrack(e.target.value)}
            className={darkInputClass}
          >
            {TRACKS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {track === "SOFTWARE_ENGINEER" ? (
          <div className="grid gap-4">
            <p className="text-body text-white">
              Software Team applications happen in your dashboard, under Software Teams. You need an account with your
              @uic.edu email, then you tell us your GitHub, hours a week and which projects you want.
            </p>
            <Link
              href={signedIn ? "/dashboard/teams" : "/signup?next=/dashboard/teams"}
              className={`${darkButtonClass} text-center`}
            >
              {signedIn ? "Apply in your dashboard" : "Create an account to apply"}
            </Link>
            {!signedIn && (
              <p className="text-body-sm text-white">
                Already have one?{" "}
                <Link href="/signin?next=/dashboard/teams" className="font-semibold text-signal hover:underline">
                  Sign in
                </Link>
              </p>
            )}
          </div>
        ) : (
        <>
        <div className="grid gap-2">
          <label htmlFor={`${id}-name`} className="type-label text-white">
            Full name
          </label>
          <input
            id={`${id}-name`}
            required
            maxLength={100}
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={darkInputClass}
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor={`${id}-email`} className="type-label text-white">
            UIC email
          </label>
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
            className={darkInputClass}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <label htmlFor={`${id}-major`} className="type-label text-white">
              Major
            </label>
            <input
              id={`${id}-major`}
              required
              maxLength={100}
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className={darkInputClass}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor={`${id}-year`} className="type-label text-white">
              Graduation year
            </label>
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
              className={darkInputClass}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <label htmlFor={`${id}-why`} className="type-label text-white">
            Why LOGICA?
          </label>
          <textarea
            id={`${id}-why`}
            required
            minLength={40}
            rows={5}
            maxLength={2000}
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            className={darkInputClass}
          />
          <p className="text-body-sm text-white opacity-60">
            At least 40 characters. No prior experience needed; say what you want to get out of it.
          </p>
        </div>
        </>
        )}
      </div>

      {track !== "SOFTWARE_ENGINEER" && (
        <button type="submit" disabled={busy} className={`${darkButtonClass} mt-8`}>
          {busy ? "Sending…" : "Submit application"}
        </button>
      )}
    </form>
  );
}
