"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { darkButtonClass, darkInputClass } from "@/components/ui/darkForm";
import { ApiError, api } from "@/lib/api";

/** Matches `TRACKS` in the backend's lib/membership-application.ts. */
const TRACKS = [
  { value: "GENERAL", label: "General Member" },
  { value: "SOFTWARE_ENGINEER", label: "Software Engineer" },
  { value: "MENTORSHIP", label: "Mentorship track" },
] as const;

export function JoinForm() {
  const id = useId();
  const [track, setTrack] = useState<string>("GENERAL");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [major, setMajor] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [why, setWhy] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

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
          major: major.trim() || null,
          // The backend wants a number or null, never "" or NaN.
          gradYear: gradYear.trim() ? Number(gradYear) : null,
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
              Major <span className="opacity-60">(optional)</span>
            </label>
            <input
              id={`${id}-major`}
              maxLength={100}
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className={darkInputClass}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor={`${id}-year`} className="type-label text-white">
              Graduation year <span className="opacity-60">(optional)</span>
            </label>
            <input
              id={`${id}-year`}
              type="number"
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
            rows={5}
            maxLength={2000}
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            className={darkInputClass}
          />
          <p className="text-body-sm text-white opacity-60">
            No prior experience needed — say what you want to get out of it.
          </p>
        </div>
      </div>

      <button type="submit" disabled={busy} className={`${darkButtonClass} mt-8`}>
        {busy ? "Sending…" : "Submit application"}
      </button>
    </form>
  );
}
