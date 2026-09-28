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

/** Matches `PROJECTS` in the backend. Order in `projects` is the applicant's ranking. */
const PROJECTS = [
  { value: "OPPORTUNITY_BOARD", label: "Opportunity board" },
  { value: "RESUME_BUILDER", label: "Resume builder for each role" },
  { value: "EVENT_REPLAYS", label: "Event replays in 3D" },
  { value: "MOCK_INTERVIEWER", label: "Mock interviewer" },
] as const;
const RANKS = ["1st choice", "2nd choice", "3rd choice"];

type Me = { user?: { email?: string | null } } | null;

export function JoinForm() {
  const id = useId();
  const [track, setTrack] = useState<string>("SOFTWARE_ENGINEER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [major, setMajor] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [why, setWhy] = useState("");
  const [github, setGithub] = useState("");
  const [hours, setHours] = useState("");
  const [picks, setPicks] = useState(["", "", ""]);
  const [skills, setSkills] = useState("");
  // undefined = still checking; null = signed out.
  const [account, setAccount] = useState<string | null | undefined>(undefined);
  const team = track === "SOFTWARE_ENGINEER";

  useEffect(() => {
    api<Me>("/api/auth/session")
      .then((me) => setAccount(me?.user?.email ?? null))
      .catch(() => setAccount(null));
  }, []);
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
          // Build-team applications use the signed-in account's email.
          email: team ? account : email.trim().toLowerCase(),
          track,
          ...(team && {
            github: github.trim(),
            hoursPerWeek: Number(hours),
            projects: picks.filter(Boolean),
            skills: skills.trim() || null,
          }),
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
          <strong>{team ? account : email}</strong>.
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

        {team ? (
          <div className="grid gap-2">
            <span className="type-label text-white">UIC account</span>
            {account === undefined ? (
              <p className="text-body-sm text-white opacity-60">Checking your account…</p>
            ) : account?.toLowerCase().endsWith("@uic.edu") ? (
              <p className="text-body text-white">Applying as <strong>{account}</strong></p>
            ) : (
              <p className="text-body text-white">
                {account ? <>You&apos;re signed in as <strong>{account}</strong>. </> : null}
                Build teams need a @uic.edu account.{" "}
                <Link href="/signup?next=/join" className="font-semibold text-signal hover:underline">Create one</Link>{" "}
                or{" "}
                <Link href="/signin?next=/join" className="font-semibold text-signal hover:underline">sign in</Link>.
              </p>
            )}
          </div>
        ) : (
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
        )}

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

        {team && (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <label htmlFor={`${id}-github`} className="type-label text-white">
                  GitHub username
                </label>
                <input
                  id={`${id}-github`}
                  required
                  maxLength={100}
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="octocat"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  className={darkInputClass}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor={`${id}-hours`} className="type-label text-white">
                  Hours a week you can commit
                </label>
                <input
                  id={`${id}-hours`}
                  type="number"
                  inputMode="numeric"
                  required
                  min={1}
                  max={40}
                  placeholder="4"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className={darkInputClass}
                />
              </div>
            </div>

            <fieldset className="grid gap-3">
              <legend className="type-label text-white">Which projects do you want? Rank them.</legend>
              {RANKS.map((rank, i) => (
                <div key={rank} className="grid gap-2">
                  <label htmlFor={`${id}-pick-${i}`} className="text-body-sm text-white">
                    {rank} {i > 0 && <span className="opacity-60">(optional)</span>}
                  </label>
                  <select
                    id={`${id}-pick-${i}`}
                    required={i === 0}
                    value={picks[i]}
                    onChange={(e) => setPicks(picks.map((p, j) => (j === i ? e.target.value : p)))}
                    className={darkInputClass}
                  >
                    <option value="">{i === 0 ? "Pick one" : "None"}</option>
                    {PROJECTS.filter((p) => p.value === picks[i] || !picks.includes(p.value)).map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </fieldset>

            <div className="grid gap-2">
              <label htmlFor={`${id}-skills`} className="type-label text-white">
                Skills <span className="opacity-60">(optional)</span>
              </label>
              <textarea
                id={`${id}-skills`}
                rows={3}
                maxLength={500}
                placeholder="React, Python, computer vision, design…"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className={darkInputClass}
              />
            </div>
          </>
        )}

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

      <button
        type="submit"
        disabled={busy || (team && !account?.toLowerCase().endsWith("@uic.edu"))}
        className={`${darkButtonClass} mt-8`}>
        {busy ? "Sending…" : "Submit application"}
      </button>
    </form>
  );
}
